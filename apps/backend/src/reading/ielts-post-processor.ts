import { IeltsQuestionType, ParsedParagraph, ParsedPassage, ParsedQuestion } from './hybrid-parser.types';

const QUESTION_SECTION_RE = /<p>\s*<em>\s*(?:<strong>\s*)?Questions?\s+(\d+)\s*[-–—]\s*(\d+)(?:\s*<\/strong>)?\s*<\/em>\s*<\/p>/gi;
const ANSWER_KEY_HEADER_RE = /<h1>\s*READING\s*<\/h1>|<h1>\s*ANSWER\s+KEY\s*<\/h1>/i;
const PASSAGE_HEADER_RE = /<h1>\s*READING\s+PASSAGE\s+(\d+)\s*<\/h1>/i;
const BLANK_PLACEHOLDER_RE = /\.{2,}\s*\(\s*(\d+)\s*\)\s*\.{2,}/g;
const UNDERSCORE_BLANK_RE = /_{3,}/g;
const PARAGRAPH_LABEL_RE = /^\s*(?:<strong>)?\s*([A-H])\s*(?:<\/strong>)?\s+/;

/** Extract the inner HTML of each top-level <ol> in source, properly balancing nested <ol>. */
function extractBalancedOlBlocks(source: string): string[] {
  const blocks: string[] = [];
  const openRe = /<ol\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(source)) !== null) {
    const start = m.index + m[0].length;
    let depth = 1;
    let k = start;
    while (k < source.length && depth > 0) {
      const rest = source.slice(k);
      const open = /^<ol\b[^>]*>/i.exec(rest);
      const close = /^<\/ol>/i.exec(rest);
      if (open) { depth += 1; k += open[0].length; continue; }
      if (close) {
        depth -= 1;
        if (depth === 0) {
          blocks.push(source.slice(start, k));
          openRe.lastIndex = k + close[0].length;
          break;
        }
        k += close[0].length;
        continue;
      }
      k += 1;
    }
  }
  return blocks;
}

interface TypeDetectRule {
  type: IeltsQuestionType;
  keywords: RegExp[];
}

const TYPE_RULES: TypeDetectRule[] = [
  { type: 'matching_headings',        keywords: [/match(ing)?\s+the\s+headings?/i, /choose\s+the\s+most\s+suitable\s+headings?/i, /paragraph\s+headings?/i] },
  { type: 'matching_features',        keywords: [/match(ing)?\s+the\s+people/i, /match(ing)?\s+(each|the)\s+statement/i, /match.*\bwith\b.*(listed|below)/i] },
  { type: 'matching_sentence_endings',keywords: [/match.*sentence\s+ending/i, /complete\s+each\s+sentence/i, /choose\s+the\s+correct\s+ending/i] },
  { type: 'matching_information',     keywords: [/which\s+paragraph\s+contains/i, /match(ing)?\s+information/i] },
  { type: 'true_false_notgiven',      keywords: [/true\s*\/?\s*false\s*\/?\s*not\s+given/i, /\btrue\b.*\bfalse\b.*\bnot\s+given\b/i] },
  { type: 'yes_no_notgiven',          keywords: [/\byes\b.*\bno\b.*\bnot\s+given\b/i, /yes\s*\/?\s*no\s*\/?\s*not\s+given/i] },
  { type: 'table_completion',         keywords: [/complete\s+the\s+table/i] },
  { type: 'flowchart_completion',     keywords: [/complete\s+the\s+flow\s*chart/i, /flow\s*chart/i] },
  { type: 'diagram_label_completion', keywords: [/label\s+the\s+diagram/i, /complete\s+the\s+labels?/i, /labelling\s+a\s+diagram/i] },
  { type: 'summary_completion',       keywords: [/complete\s+the\s+summary/i, /complete\s+the\s+notes/i] },
  { type: 'sentence_completion',      keywords: [/complete\s+the\s+sentences?/i, /complete\s+each\s+of\s+the\s+sentences?/i] },
  { type: 'mcq',                      keywords: [/choose\s+the\s+(appropriate|correct)\s+letters?/i, /choose\s+the\s+correct\s+answer/i, /multiple\s+choice/i, /\ba[-–]\s*[bcd]\b/i] },
  { type: 'short',                    keywords: [/answer\s+the\s+questions?\s+below/i, /short\s+answer/i, /no\s+more\s+than\s+\w+\s+words/i] },
];

export interface ExtractedSection {
  passageHtml: string;
  questionsHtml: string;
  answerKeyHtml: string;
  passageNumber: number;
  passageTitle: string;
}

/** Strip passage title from the top-level "You should spend ..." instruction that
 *  precedes the passage body. Returns { title, body } pair. */
function splitPassageTitle(passageHtml: string): { title: string; bodyHtml: string } {
  const introMatch = passageHtml.match(/<p>[^<]*?spend\s+about\s+\d+\s+minutes[^<]*<\/p>/i);
  const rest = introMatch ? passageHtml.slice(introMatch.index! + introMatch[0].length) : passageHtml;
  const titleMatch = rest.match(/<p>\s*([^<]+?)\s*<\/p>/);
  if (!titleMatch) {
    return { title: '', bodyHtml: rest.trim() };
  }
  const title = titleMatch[1].replace(/\s+/g, ' ').trim();
  const bodyHtml = rest.slice(titleMatch.index! + titleMatch[0].length).trim();
  return { title, bodyHtml };
}

/** Split HTML into paragraphs with optional A-H labels + char offsets. */
export function splitParagraphs(bodyHtml: string): ParsedParagraph[] {
  const paraRe = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  const paras: ParsedParagraph[] = [];
  let m: RegExpExecArray | null;
  while ((m = paraRe.exec(bodyHtml)) !== null) {
    const inner = m[1];
    const stripped = inner.replace(/<[^>]+>/g, '');
    const labelMatch = stripped.match(PARAGRAPH_LABEL_RE);
    paras.push({
      label: labelMatch ? labelMatch[1] : null,
      offset: m.index,
      html: m[0],
    });
  }
  return paras;
}

/** Replace `... (N) ...` and `___` with ielts-blank spans referencing question N. */
export function injectBlankSpans(html: string): { html: string; blanksByNum: Map<number, string> } {
  const blanksByNum = new Map<number, string>();
  let out = html.replace(BLANK_PLACEHOLDER_RE, (_match, num: string) => {
    const id = `blank_q${num}`;
    blanksByNum.set(Number(num), id);
    return `<span class="ielts-blank" data-blank-id="${id}"></span>`;
  });
  let unlabelled = 0;
  out = out.replace(UNDERSCORE_BLANK_RE, () => {
    unlabelled += 1;
    return `<span class="ielts-blank" data-blank-id="blank_u${unlabelled}"></span>`;
  });
  return { html: out, blanksByNum };
}

export function detectQuestionType(instruction: string): IeltsQuestionType {
  const plain = instruction.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  for (const rule of TYPE_RULES) {
    if (rule.keywords.some((re) => re.test(plain))) return rule.type;
  }
  return 'short';
}

/** Find the answer key section (second <h1>READING</h1>) and extract answers from
 *  tables under Question/Answer columns. */
export function extractAnswerKey(html: string): Map<number, string> {
  const answers = new Map<number, string>();
  const keyMatch = html.search(ANSWER_KEY_HEADER_RE);
  if (keyMatch === -1) return answers;
  const keyHtml = html.slice(keyMatch);
  const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let t: RegExpExecArray | null;
  while ((t = tableRe.exec(keyHtml)) !== null) {
    const tableInner = t[1];
    if (!/Question/i.test(tableInner) || !/Answer/i.test(tableInner)) continue;
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let r: RegExpExecArray | null;
    while ((r = rowRe.exec(tableInner)) !== null) {
      const cells = Array.from(r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(
        (c) => c[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      );
      if (cells.length < 2) continue;
      const num = Number(cells[0]);
      if (!Number.isFinite(num) || num < 1 || num > 200) continue;
      const ans = cells[1];
      if (ans) answers.set(num, ans);
    }
  }
  return answers;
}

/** Split the HTML into (a) passage section (b) question section (c) answer key.
 *  Cuts at first <p><em>Questions N-M</em></p> and at <h1>READING</h1>. */
export function extractSections(html: string): ExtractedSection[] {
  const passageHeaders: { start: number; end: number; number: number }[] = [];
  const headerRe = /<h1>\s*READING\s+PASSAGE\s+(\d+)\s*<\/h1>/gi;
  let h: RegExpExecArray | null;
  while ((h = headerRe.exec(html)) !== null) {
    passageHeaders.push({ start: h.index, end: h.index + h[0].length, number: Number(h[1]) });
  }
  const answerKeyStart = html.search(ANSWER_KEY_HEADER_RE);
  const sections: ExtractedSection[] = [];

  if (passageHeaders.length === 0) {
    const firstQMatch = QUESTION_SECTION_RE.exec(html);
    QUESTION_SECTION_RE.lastIndex = 0;
    const qStart = firstQMatch?.index ?? html.length;
    sections.push({
      passageHtml: html.slice(0, qStart),
      questionsHtml: html.slice(qStart, answerKeyStart === -1 ? html.length : answerKeyStart),
      answerKeyHtml: answerKeyStart === -1 ? '' : html.slice(answerKeyStart),
      passageNumber: 1,
      passageTitle: '',
    });
    return sections;
  }

  for (let i = 0; i < passageHeaders.length; i += 1) {
    const hdr = passageHeaders[i];
    const nextBoundary =
      i + 1 < passageHeaders.length
        ? passageHeaders[i + 1].start
        : answerKeyStart === -1
          ? html.length
          : answerKeyStart;
    const sectionHtml = html.slice(hdr.end, nextBoundary);
    const localQMatch = /<p>\s*<em>\s*(?:<strong>\s*)?Questions?\s+\d+/i.exec(sectionHtml);
    const qStart = localQMatch?.index ?? sectionHtml.length;
    sections.push({
      passageHtml: sectionHtml.slice(0, qStart),
      questionsHtml: sectionHtml.slice(qStart),
      answerKeyHtml: '',
      passageNumber: hdr.number,
      passageTitle: '',
    });
  }

  if (answerKeyStart !== -1 && sections.length > 0) {
    sections[0].answerKeyHtml = html.slice(answerKeyStart);
  }
  return sections;
}

/** Parse a question section into group-structured questions. */
export function parseQuestions(
  questionsHtml: string,
  answers: Map<number, string>,
  warnings: string[],
): ParsedQuestion[] {
  const result: ParsedQuestion[] = [];
  const matches: { from: number; to: number; index: number; header: string }[] = [];
  const re = new RegExp(QUESTION_SECTION_RE.source, 'gi');
  let m: RegExpExecArray | null;
  while ((m = re.exec(questionsHtml)) !== null) {
    matches.push({
      from: Number(m[1]),
      to: Number(m[2]),
      index: m.index + m[0].length,
      header: m[0],
    });
  }

  for (let i = 0; i < matches.length; i += 1) {
    const seg = matches[i];
    const endOfSegment = i + 1 < matches.length ? matches[i + 1].index - matches[i + 1].header.length : questionsHtml.length;
    const segHtml = questionsHtml.slice(seg.index, endOfSegment);
    const instrMatch = segHtml.match(/<p>\s*([\s\S]*?)<\/p>/);
    const groupInstruction = instrMatch
      ? instrMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : '';
    const type = detectQuestionType(segHtml);
    const groupId = `q${seg.from}-${seg.to}`;

    // Extract numbered questions. Strategy: assign question numbers sequentially
    // starting at seg.from to either <ol><li> items or table blank placeholders.
    const blanks = Array.from(segHtml.matchAll(BLANK_PLACEHOLDER_RE));
    if (blanks.length >= seg.to - seg.from) {
      for (let n = seg.from; n <= seg.to; n += 1) {
        result.push({
          type,
          group_id: groupId,
          group_instruction: groupInstruction,
          number: n,
          stem: `Blank ${n}`,
          blank_refs: [`blank_q${n}`],
          correct_answer: answers.get(n),
        });
      }
      continue;
    }

    // Top-level <li> items. Nested <ol> children become options for the outer li.
    const items: { text: string; options?: string[] }[] = [];
    const olBlocks = extractBalancedOlBlocks(segHtml);
    for (const olInner of olBlocks) {
      // Split top-level <li> by tracking nested depth.
      let depth = 0;
      let buf = '';
      let inLi = false;
      for (let j = 0; j < olInner.length; j += 1) {
        const rest = olInner.slice(j);
        const liOpen = /^<li\b[^>]*>/i.exec(rest);
        const liClose = /^<\/li>/i.exec(rest);
        const olOpen = /^<ol\b[^>]*>/i.exec(rest);
        const olClose = /^<\/ol>/i.exec(rest);
        if (liOpen && depth === 0) {
          inLi = true;
          j += liOpen[0].length - 1;
          buf = '';
          continue;
        }
        if (liClose && depth === 0 && inLi) {
          inLi = false;
          j += liClose[0].length - 1;
          const nestedMatch = buf.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
          let text = buf;
          let options: string[] | undefined;
          if (nestedMatch) {
            text = buf.slice(0, nestedMatch.index).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            const nested = Array.from(nestedMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((li) =>
              li[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
            );
            if (nested.length > 0) options = nested;
          } else {
            text = buf.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }
          items.push({ text, options });
          buf = '';
          continue;
        }
        if (olOpen) { depth += 1; j += olOpen[0].length - 1; buf += olOpen[0]; continue; }
        if (olClose) { depth -= 1; j += olClose[0].length - 1; buf += olClose[0]; continue; }
        if (inLi) buf += olInner[j];
      }
    }

    const expected = seg.to - seg.from + 1;
    if (items.length === 0) {
      warnings.push(`No question items found for ${groupId}`);
      continue;
    }

    // Matching pattern: options first (e.g. A-E list of people), then stems.
    let sharedOptions: string[] | undefined;
    let stems = items;
    if (type === 'matching_features' || type === 'matching_sentence_endings' || type === 'matching_headings') {
      const optCountMatch = groupInstruction.match(/A\s*[-–—]\s*([A-Z])/);
      if (optCountMatch && items.length > expected) {
        const optCount = optCountMatch[1].charCodeAt(0) - 'A'.charCodeAt(0) + 1;
        sharedOptions = items.slice(0, optCount).map((it) => it.text);
        stems = items.slice(optCount);
      }
    }

    // MCQ mixed pattern: some questions have nested <ol> options, others have
    // their options as flat siblings. Walk items in order, consuming flat items
    // as options for the preceding flat stem.
    if (type === 'mcq' && stems.length > expected) {
      const restructured: { text: string; options?: string[] }[] = [];
      let i = 0;
      while (i < stems.length && restructured.length < expected) {
        const cur = stems[i];
        if (cur.options) {
          restructured.push(cur);
          i += 1;
          continue;
        }
        // Flat stem: consume following flat items as options until next item
        // that has nested options or we run out.
        const opts: string[] = [];
        let j = i + 1;
        while (j < stems.length && !stems[j].options) {
          opts.push(stems[j].text);
          j += 1;
        }
        const remaining = expected - restructured.length - 1;
        const reserve = stems.slice(j).length;
        // Reserve enough flat items if later questions need them.
        const keep = Math.max(0, opts.length - Math.max(0, remaining - reserve) * 4);
        restructured.push({ text: cur.text, options: opts.slice(0, keep > 0 ? keep : opts.length) });
        i = i + 1 + (keep > 0 ? keep : opts.length);
      }
      stems = restructured;
    }

    for (let idx = 0; idx < expected; idx += 1) {
      const n = seg.from + idx;
      const stem = stems[idx]?.text ?? '';
      const perQuestionOptions = stems[idx]?.options;
      if (!stem) {
        warnings.push(`Missing stem for Q${n}`);
      }
      result.push({
        type,
        group_id: groupId,
        group_instruction: groupInstruction,
        number: n,
        stem,
        options: perQuestionOptions ?? sharedOptions,
        correct_answer: answers.get(n),
      });
    }
  }
  return result;
}

export function buildPassage(sectionPassageHtml: string): ParsedPassage {
  const { title, bodyHtml } = splitPassageTitle(sectionPassageHtml);
  const withBlanks = injectBlankSpans(bodyHtml);
  const paragraphs = splitParagraphs(withBlanks.html);
  return {
    title,
    body_html: withBlanks.html,
    paragraphs,
  };
}

export function computeConfidence(input: {
  passage: ParsedPassage;
  questions: ParsedQuestion[];
  expectedQuestionCount: number;
  warnings: string[];
}): number {
  let score = 1.0;
  if (!input.passage.title) score -= 0.15;
  if (input.passage.body_html.length < 500) score -= 0.25;
  if (input.expectedQuestionCount > 0) {
    const ratio = input.questions.length / input.expectedQuestionCount;
    if (ratio < 0.8) score -= 0.3;
    else if (ratio < 1.0) score -= 0.1;
  } else if (input.questions.length === 0) {
    score -= 0.4;
  }
  const stemless = input.questions.filter((q) => !q.stem && !q.blank_refs?.length).length;
  if (stemless > 0) score -= Math.min(0.2, stemless * 0.05);
  score -= Math.min(0.2, input.warnings.length * 0.03);
  return Math.max(0, Math.min(1, score));
}

/** Detect the expected question count from the top-level intro ("Questions 1-12"). */
export function detectExpectedQuestionCount(sectionPassageHtml: string, questionsHtml: string): number {
  const introMatch = sectionPassageHtml.match(/Questions?\s+(\d+)\s*[-–—]\s*(\d+)/i);
  if (introMatch) return Number(introMatch[2]) - Number(introMatch[1]) + 1;
  let max = 0;
  let min = Number.POSITIVE_INFINITY;
  const re = new RegExp(QUESTION_SECTION_RE.source, 'gi');
  let m: RegExpExecArray | null;
  while ((m = re.exec(questionsHtml)) !== null) {
    min = Math.min(min, Number(m[1]));
    max = Math.max(max, Number(m[2]));
  }
  return max > 0 && Number.isFinite(min) ? max - min + 1 : 0;
}
