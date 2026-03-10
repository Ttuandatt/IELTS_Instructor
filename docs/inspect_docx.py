from docx import Document

path = r"D:\IT\Projects\IELTS_Instructor\docs\cam18_reading_test_1.docx"
output_path = r"D:\IT\Projects\IELTS_Instructor\docs\cam18_reading_test_1_paragraphs.txt"

doc = Document(path)

with open(output_path, "w", encoding="utf-8") as f:
    for idx, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if text:
            f.write(f"{idx:03}: {text}\n")

print(f"Saved paragraph dump to {output_path}")
