# US-IMPORT-01 — Upload a DOCX file and have it parsed into a reading pass...

| Field | Value |
|-------|-------|
| **Feature** | DOCX Import (Reading) |
| **Domain** | Content Import & Parsing |

> As an instructor, I want to upload a DOCX file and have it parsed into a reading passage with questions, so that I can quickly digitize my existing Word-format test materials.

## Acceptance Criteria

- AC1: Upload endpoint: `POST /api/reading/parse-docx` (multipart/form-data). Accepted: `.docx` (MIME: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`). Max file size: 20MB. Other formats → 400 "Chỉ chấp nhận file DOCX"
- AC2: Parsing pipeline: Mammoth library (DOCX → HTML) as primary parser → `mammoth-parser.service.ts` extracts passage text + attempts question detection using heading/numbering patterns
- AC3: Confidence scoring: system assigns confidence 0.0-1.0 based on: detected question count (expected: 10-40 for IELTS), structural patterns found (numbered lists, T/F/NG keywords, matching sections). Logged per import
- AC4: Gemini fallback: if Mammoth confidence < 0.6 → DOCX converted to images → sent to Gemini 2.5 Flash with SYSTEM_PROMPT defining `question_groups` JSON schema. Fallback automatically, no user action needed
- AC5: Parsing result: `{ passage_title, passage_text (HTML), question_groups: [{ instruction, questions: [{ type (IeltsQuestionType enum), stem, options?, correct_answer }] }] }`
- AC6: Preview page (admin upload): passage rendered on left, questions listed on right with editable fields. Each field inline-editable. Question type changeable via dropdown (all 13 types). Options addable/removable. Correct answer editable
- AC7: "Nhập bài đọc" (Import) button: validates all questions have `correct_answer` filled. Missing → "Câu {n} chưa có đáp án đúng" highlighted in red. Creates `passage` (status=draft) + `questions` in single DB transaction
- AC8: "Hủy" → discard, return to upload page. No data saved
- AC9: Parsing time: DOCX typically 2-5 seconds (Mammoth-only) or 10-20 seconds (with Gemini fallback). Progress indicator: "Đang phân tích…" with spinner
- AC10: Error handling: corrupted DOCX → "Không thể đọc file. Vui lòng kiểm tra file DOCX" with option to retry or upload different file
- AC11: File stored in `uploads/` after successful import with reference on passage record. Original file available for re-parsing
- AC12: Depends on: F-READ-05 (passage creation), F-READ-04 (question types)
