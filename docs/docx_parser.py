import argparse
import html
import json
import re
import shutil
import zipfile
from pathlib import Path

import easyocr
import mammoth
from bs4 import BeautifulSoup

try:
    import torch
except ImportError:  # torch is optional but enables GPU support
    torch = None

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT_PATH = BASE_DIR / "cam18_reading_test_1.docx"
IMAGES_BASE_DIR = BASE_DIR / "parsed_images"

QUESTION_NUMBER_RE = re.compile(r"^(?:\(?)(\d{1,2})(?:\)|\.|\s)")
QUESTION_INSTRUCTION_RE = re.compile(r"^questions?\b", re.IGNORECASE)
ANSWER_HEADING_RE = re.compile(r"^answer", re.IGNORECASE)
PASSAGE_HEADER_RE = re.compile(r"reading\s+passage\s+(\d+)", re.IGNORECASE)
QUESTION_RANGE_RE = re.compile(r"questions?\s+(\d+)(?:\s*(?:-|to)\s*(\d+))?", re.IGNORECASE)
PASSAGE_LETTER_RE = re.compile(r"passage\s+([abc])", re.IGNORECASE)
QUESTION_HEADING_RE = re.compile(r"^questions?\b", re.IGNORECASE)
QUESTION_TYPE_HINTS = [
    (("true", "false", "not given"), "true_false_not_given"),
    (("yes", "no", "not given"), "yes_no_not_given"),
    (("matching headings",), "matching_headings"),
    (("match the headings",), "matching_headings"),
    (("complete the sentences",), "sentence_completion"),
    (("complete the summary",), "summary_completion"),
    (("choose the correct letter",), "multiple_choice"),
    (("multiple choice",), "multiple_choice"),
    (("short answer questions",), "short_answer"),
    (("short-answer questions",), "short_answer"),
    (("diagram labelling",), "diagram_labeling"),
    (("label the diagram",), "diagram_labeling"),
    (("flow-chart completion",), "flowchart_completion"),
    (("complete the flow-chart",), "flowchart_completion"),
    (("match the statements",), "matching"),
]


def normalize_whitespace(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def detect_passage_heading(text: str) -> dict | None:
    normalized = text.strip()
    if not normalized:
        return None
    header_match = PASSAGE_HEADER_RE.search(normalized)
    if header_match:
        number = int(header_match.group(1))
        return {
            "label": f"Reading Passage {number}",
            "number": number,
            "id": f"reading-passage-{number}",
        }
    letter_match = PASSAGE_LETTER_RE.search(normalized)
    if letter_match:
        token = letter_match.group(1).upper()
        return {
            "label": f"Passage {token}",
            "number": None,
            "id": f"passage-{token.lower()}",
        }
    return None


def create_passage_container(meta: dict | None, index: int) -> dict:
    number = meta.get("number") if meta else index
    label = meta.get("label") if meta else f"Reading Passage {number}"
    passage_id = meta.get("id") if meta else f"reading-passage-{number}"
    return {
        "id": passage_id,
        "label": label,
        "number": number,
        "title_block": None,
        "content_blocks": [],
        "question_groups": [],
    }


def detect_question_heading(text: str) -> dict | None:
    normalized = text.strip()
    if not normalized or not QUESTION_HEADING_RE.match(normalized.lower()):
        return None
    range_match = QUESTION_RANGE_RE.search(normalized)
    range_data = None
    if range_match:
        start = int(range_match.group(1))
        end = int(range_match.group(2) or range_match.group(1))
        range_data = {"from": start, "to": end}
    return {
        "label": normalized,
        "range": range_data,
    }


def infer_question_type(parts: list[str]) -> str:
    combined = normalize_whitespace(" ".join(part for part in parts if part))
    lower = combined.lower()
    if not lower:
        return "unknown"
    for keywords, label in QUESTION_TYPE_HINTS:
        if all(keyword in lower for keyword in keywords):
            return label
    return "unknown"


def derive_range_from_questions(questions: list[dict]) -> dict | None:
    numbers = [question.get("number") for question in questions if isinstance(question.get("number"), int)]
    if not numbers:
        return None
    return {"from": min(numbers), "to": max(numbers)}


def flatten_questions_for_compat(passages: list[dict]) -> list[dict]:
    flattened: list[dict] = []
    for passage in passages:
        passage_id = passage.get("id")
        for group in passage.get("question_groups", []):
            instructions = group.get("instructions") or {}
            if instructions.get("text"):
                flattened.append(
                    {
                        "type": "instruction",
                        "text": instructions.get("text", ""),
                        "html": instructions.get("html", ""),
                        "group_label": group.get("label"),
                        "passage_id": passage_id,
                        "question_type": group.get("question_type", "unknown"),
                        "range": group.get("range"),
                    }
                )
            for question in group.get("questions", []):
                enriched = dict(question)
                enriched["group_label"] = group.get("label")
                enriched["passage_id"] = passage_id
                enriched["question_type"] = group.get("question_type", "unknown")
                flattened.append(enriched)
    return flattened


def build_result(
    passages: list[dict],
    answers: list[str],
    *,
    source: str,
    global_intro: dict | None = None,
    extra_meta: dict | None = None,
) -> dict:
    question_count = sum(
        len(group.get("questions", [])) for passage in passages for group in passage.get("question_groups", [])
    )
    meta = {
        "source": source,
        "passage_count": len(passages),
        "question_count": question_count,
    }
    if extra_meta:
        meta.update(extra_meta)
    global_intro_payload = global_intro or {"text": "", "html": ""}
    return {
        "global_intro": global_intro_payload,
        "passages": passages,
        "passage": passages[0]["content"] if passages else {"text": "", "html": ""},
        "questions": flatten_questions_for_compat(passages),
        "answers": answers,
        "meta": meta,
    }


def load_html(docx_path: Path) -> str:
    with open(docx_path, "rb") as docx_file:
        result = mammoth.convert_to_html(docx_file)
    html_content = result.value
    return html_content


def build_blocks(html: str):
    soup = BeautifulSoup(html, "html.parser")
    blocks = []
    for element in soup.find_all(["p", "h1", "h2", "h3", "h4", "ol", "ul", "table"]):
        text = element.get_text("\n", strip=True)
        if not text:
            continue
        blocks.append({"text": text, "html": str(element)})
    return blocks


def merge_block_content(target: dict, block: dict):
    target["text"] = (target.get("text", "") + "\n" + block["text"]).strip()
    target["html"] = target.get("html", "") + "\n" + block["html"]


def parse_blocks(blocks):
    passages: list[dict] = []
    answers: list[str] = []
    global_intro_blocks: list[dict] = []
    current_passage: dict | None = None
    current_question_group: dict | None = None
    current_question: dict | None = None
    expect_passage_title = False

    for block in blocks:
        text = block["text"].strip()
        if not text:
            continue
        lower = text.lower()

        if ANSWER_HEADING_RE.match(text):
            answers.append(text)
            current_question = None
            current_question_group = None
            continue

        passage_meta = detect_passage_heading(text)
        if passage_meta:
            current_passage = create_passage_container(passage_meta, len(passages) + 1)
            passages.append(current_passage)
            current_question_group = None
            current_question = None
            expect_passage_title = True
            continue

        question_heading = detect_question_heading(text)
        if question_heading:
            if not current_passage:
                current_passage = create_passage_container(None, len(passages) + 1)
                passages.append(current_passage)
            current_question_group = {
                "id": f"{current_passage['id']}-group-{len(current_passage['question_groups']) + 1}",
                "label": question_heading["label"],
                "range": question_heading.get("range"),
                "question_type": infer_question_type([question_heading["label"]]),
                "instruction_blocks": [],
                "questions": [],
            }
            current_passage["question_groups"].append(current_question_group)
            current_question = None
            continue

        number_match = QUESTION_NUMBER_RE.match(text)
        if number_match:
            if not current_passage:
                current_passage = create_passage_container(None, len(passages) + 1)
                passages.append(current_passage)
            if not current_question_group:
                current_question_group = {
                    "id": f"{current_passage['id']}-group-{len(current_passage['question_groups']) + 1}",
                    "label": f"Questions {number_match.group(1)}",
                    "range": {"from": int(number_match.group(1)), "to": int(number_match.group(1))},
                    "question_type": "unknown",
                    "instruction_blocks": [],
                    "questions": [],
                }
                current_passage["question_groups"].append(current_question_group)
            current_question = {
                "type": "question",
                "number": int(number_match.group(1)),
                "text": block["text"],
                "html": block["html"],
            }
            current_question_group["questions"].append(current_question)
            continue

        if current_question_group:
            if current_question:
                merge_block_content(current_question, block)
            else:
                current_question_group["instruction_blocks"].append(block)
            continue

        if current_passage:
            if expect_passage_title:
                current_passage["title_block"] = block
                expect_passage_title = False
            else:
                current_passage.setdefault("content_blocks", []).append(block)
        else:
            global_intro_blocks.append(block)

    if not passages and global_intro_blocks:
        current_passage = create_passage_container(None, 1)
        current_passage["content_blocks"].extend(global_intro_blocks)
        passages.append(current_passage)
        global_intro_blocks = []

    structured_passages: list[dict] = []
    for passage in passages:
        content_blocks = passage.get("content_blocks", [])
        structured_groups = []
        for group in passage.get("question_groups", []):
            instructions_text = "\n".join(block["text"] for block in group.get("instruction_blocks", [])).strip()
            instructions_html = "\n".join(block["html"] for block in group.get("instruction_blocks", [])).strip()
            question_range = group.get("range") or derive_range_from_questions(group.get("questions", []))
            question_type = group.get("question_type")
            if not question_type or question_type == "unknown":
                question_type = infer_question_type([group.get("label"), instructions_text])
            structured_groups.append(
                {
                    "id": group.get("id"),
                    "label": group.get("label"),
                    "range": question_range,
                    "question_type": question_type or "unknown",
                    "instructions": {"text": instructions_text, "html": instructions_html},
                    "questions": group.get("questions", []),
                }
            )
        structured_passages.append(
            {
                "id": passage.get("id"),
                "label": passage.get("label"),
                "number": passage.get("number"),
                "title": {
                    "text": passage.get("title_block", {}).get("text", "") if passage.get("title_block") else "",
                    "html": passage.get("title_block", {}).get("html", "") if passage.get("title_block") else "",
                },
                "content": {
                    "text": "\n".join(block["text"] for block in content_blocks).strip(),
                    "html": "\n".join(block["html"] for block in content_blocks),
                },
                "question_groups": structured_groups,
            }
        )

    intro_text = "\n".join(block["text"] for block in global_intro_blocks).strip()
    intro_html = "\n".join(block["html"] for block in global_intro_blocks)

    return build_result(
        structured_passages,
        answers,
        source="docx",
        global_intro={"text": intro_text, "html": intro_html},
    )


def extract_images(docx_path: Path, output_dir: Path) -> list[Path]:
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    extracted_paths: list[Path] = []
    with zipfile.ZipFile(docx_path) as zf:
        media_files = [name for name in zf.namelist() if name.startswith("word/media/")]
        for index, media_name in enumerate(sorted(media_files)):
            data = zf.read(media_name)
            extension = Path(media_name).suffix or ".bin"
            destination = output_dir / f"page_{index:02}{extension}"
            with open(destination, "wb") as output_file:
                output_file.write(data)
            extracted_paths.append(destination)
    return extracted_paths


def lines_to_html(lines: list[str]) -> str:
    if not lines:
        return ""
    return "".join(f"<p>{html.escape(line)}</p>" for line in lines)


def build_questions_from_lines(lines: list[str]) -> list[dict]:
    questions: list[dict] = []
    current_instruction: list[str] = []
    current_question: dict | None = None

    def flush_instruction():
        nonlocal current_instruction
        if current_instruction:
            questions.append(
                {
                    "type": "instruction",
                    "text": "\n".join(current_instruction),
                    "html": lines_to_html(current_instruction),
                }
            )
            current_instruction = []

    def flush_question():
        nonlocal current_question
        if current_question and current_question.get("lines"):
            lines_copy = current_question.pop("lines")
            current_question["text"] = "\n".join(lines_copy)
            current_question["html"] = lines_to_html(lines_copy)
            questions.append(current_question)
        current_question = None

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        if QUESTION_INSTRUCTION_RE.match(line.lower()):
            flush_question()
            current_instruction.append(line)
            continue

        number_match = QUESTION_NUMBER_RE.match(line)
        if number_match:
            flush_instruction()
            flush_question()
            current_question = {
                "type": "question",
                "number": int(number_match.group(1)),
                "lines": [line],
            }
            continue

        if current_question is not None:
            current_question.setdefault("lines", []).append(line)
        else:
            current_instruction.append(line)

    flush_question()
    flush_instruction()
    return questions


def slice_for_passage(lines: list[str], passage_number: int = 1) -> tuple[list[str], list[str]]:
    header_positions: list[tuple[int, int]] = []

    idx = 0
    while idx < len(lines):
        line = lines[idx].strip().lower()
        match = PASSAGE_HEADER_RE.search(line)
        if match:
            header_positions.append((idx, int(match.group(1))))
            idx += 1
            continue

        if line == "reading" and idx + 2 < len(lines):
            second = lines[idx + 1].strip().lower()
            third = lines[idx + 2].strip().lower()
            if second == "passage" and third.isdigit():
                header_positions.append((idx, int(third)))
                idx += 3
                continue
        idx += 1

    if not header_positions:
        split_idx = next((pos for pos, text in enumerate(lines) if text.lower().startswith("questions")), len(lines))
        return lines[:split_idx], lines[split_idx:]

    header_positions.sort(key=lambda item: item[0])
    start_idx = next((idx for idx, number in header_positions if number == passage_number), header_positions[0][0])
    end_idx = next((idx for idx, number in header_positions if number > passage_number), len(lines))

    segment = lines[max(0, start_idx - 2):end_idx]
    question_offset = next((i for i, text in enumerate(segment) if text.lower().startswith("questions")), len(segment))
    return segment[:question_offset], segment[question_offset:]


def parse_ocr_lines(all_lines: list[str], passage_number: int = 1):
    passage_id = f"reading-passage-{passage_number}"
    if not all_lines:
        empty_passage = {
            "id": passage_id,
            "label": f"Reading Passage {passage_number}",
            "number": passage_number,
            "title": {"text": "", "html": ""},
            "content": {"text": "", "html": ""},
            "question_groups": [],
        }
        return build_result([empty_passage], [], source="ocr")

    passage_lines, question_lines = slice_for_passage(all_lines, passage_number=passage_number)
    flat_questions = build_questions_from_lines(question_lines)
    instructions_entries = [item for item in flat_questions if item.get("type") == "instruction"]
    question_entries = [item for item in flat_questions if item.get("type") == "question"]
    instructions_text = "\n".join(entry.get("text", "") for entry in instructions_entries if entry.get("text")).strip()
    instructions_html = "\n".join(entry.get("html", "") for entry in instructions_entries if entry.get("html")).strip()
    range_info = derive_range_from_questions(question_entries)
    if range_info and range_info["from"] == range_info["to"]:
        label = f"Question {range_info['from']}"
    elif range_info:
        label = f"Questions {range_info['from']}-{range_info['to']}"
    else:
        label = "Questions"

    question_groups: list[dict] = []
    if question_entries or instructions_text:
        question_groups.append(
            {
                "id": f"{passage_id}-group-1",
                "label": label,
                "range": range_info,
                "question_type": infer_question_type([instructions_text]),
                "instructions": {"text": instructions_text, "html": instructions_html},
                "questions": question_entries,
            }
        )

    passage_entry = {
        "id": passage_id,
        "label": f"Reading Passage {passage_number}",
        "number": passage_number,
        "title": {"text": "", "html": ""},
        "content": {
            "text": "\n".join(passage_lines).strip(),
            "html": lines_to_html(passage_lines),
        },
        "question_groups": question_groups,
    }
    return build_result([passage_entry], [], source="ocr")


def _images_dir_for(docx_path: Path) -> Path:
    safe_name = re.sub(r"[^a-zA-Z0-9_-]", "_", docx_path.stem) or "docx"
    return IMAGES_BASE_DIR / safe_name


def parse_via_ocr(docx_path: Path, passage_number: int = 1):
    image_paths = extract_images(docx_path, _images_dir_for(docx_path))
    if not image_paths:
        raise RuntimeError("No embedded images found for OCR fallback.")

    gpu_enabled = bool(torch and torch.cuda.is_available())
    reader = easyocr.Reader(["en"], gpu=gpu_enabled)
    pages: list[dict] = []
    all_lines: list[str] = []
    for index, image_path in enumerate(sorted(image_paths)):
        ocr_lines = reader.readtext(str(image_path), detail=0, paragraph=False)
        cleaned_lines = [line.strip() for line in ocr_lines if isinstance(line, str) and line.strip()]
        all_lines.extend(cleaned_lines)
        pages.append({"page_index": index, "image": image_path.name, "lines": cleaned_lines})

    lines_dump = BASE_DIR / f"{docx_path.stem}_ocr_lines.txt"
    lines_dump.write_text("\n".join(all_lines), encoding="utf-8")
    parsed = parse_ocr_lines(all_lines, passage_number=passage_number)
    parsed.setdefault("meta", {})
    parsed["meta"].update(
        {
            "source": "ocr",
            "page_count": len(pages),
            "gpu_enabled": gpu_enabled,
        }
    )
    return parsed


def parse_docx(path: Path, passage_number: int = 1):
    html_content = load_html(path)
    if html_content.strip():
        blocks = build_blocks(html_content)
        parsed = parse_blocks(blocks)
        if parsed["passage"].get("text") or parsed["questions"]:
            return parsed
    return parse_via_ocr(path, passage_number=passage_number)


def parse_text_file(path: Path, passage_number: int = 1):
    raw = path.read_text(encoding="utf-8")
    lines = [line.strip() for line in raw.splitlines()]
    return parse_ocr_lines(lines, passage_number=passage_number)


def parse_input_file(path: Path, passage_number: int = 1):
    suffix = path.suffix.lower()
    if suffix == ".txt":
        return parse_text_file(path, passage_number=passage_number)
    return parse_docx(path, passage_number=passage_number)


def main():
    parser = argparse.ArgumentParser(description="Parse IELTS reading DOCX into structured JSON.")
    parser.add_argument("--input", dest="input_path", default=str(DEFAULT_INPUT_PATH), help="Path to the DOCX file to parse.")
    parser.add_argument("--output", dest="output_path", default=None, help="Path for JSON output. Writes to stdout when omitted.")
    parser.add_argument("--passage-number", dest="passage_number", type=int, default=1, help="Passage number to prioritize when splitting OCR text.")
    args = parser.parse_args()

    input_path = Path(args.input_path)
    result = parse_input_file(input_path, passage_number=args.passage_number)
    output_json = json.dumps(result, ensure_ascii=False, indent=2)

    if args.output_path:
        output_path = Path(args.output_path)
        output_path.write_text(output_json, encoding="utf-8")
        print(f"Parsed content saved to {output_path}")
    else:
        print(output_json)


if __name__ == "__main__":
    main()
