# US-READ-07 — Upload a DOCX/PDF file and have it automatically parsed i...

| Field | Value |
|-------|-------|
| **Feature** | Passage Upload & AI Parse |
| **Domain** | Reading |

> As an instructor, I want to upload a DOCX/PDF file and have it automatically parsed into a passage with questions, so that I can quickly digitize existing Cambridge test materials.

## Acceptance Criteria

- Upload endpoint: `POST /api/uploads` (multipart/form-data). Accepted formats: `.docx` (application/vnd.openxmlformats...), `.pdf` (application/pdf). Max file size: 20MB. Rejected format → 400 "Chỉ chấp nhận file DOCX hoặc PDF". Oversized → 400 "File không được vượt quá 20MB"
- DOCX pipeline: Mammoth library converts to HTML first → system extracts passage text and question patterns → if parsing confidence < 0.6 (heuristic based on detected question count vs expected), falls back to Gemini 2.5 Flash with SYSTEM_PROMPT that defines `question_groups` JSON schema
- PDF pipeline: each page rendered as image → sent to Gemini multimodal API (vision) → returns structured JSON with passage text + question_groups. Multi-page PDFs: all pages sent in single API call (batch)
- Gemini parsing prompt: returns `{ passage_title, passage_text (HTML), question_groups: [{ instruction, questions: [{ type, stem, options?, correct_answer }] }] }`. Response validated against schema before proceeding
- Preview page: after parsing, instructor sees full preview — passage text on left, parsed questions on right. Each field editable inline. Question types shown as dropdown (can be changed if AI misclassified). Options editable/addable/removable
- "Nhập bài đọc" (Import) button: saves passage + questions to DB in single transaction. Creates `passage` record with `status=draft` + all `question` records with correct `display_order`
- "Hủy" (Cancel) button: discards parsed result, returns to upload page. No data saved
- Parsing time indicator: progress bar or spinner with "Đang phân tích file…" message. Expected time: DOCX 2-5s, PDF 10-30s (depends on page count)
- Parsing failure (Gemini API error, invalid response): show "Không thể phân tích file. Vui lòng thử lại hoặc nhập thủ công" with "Thử lại" and "Nhập thủ công" buttons
- Original uploaded file stored in `uploads/` directory and linked to passage record (`source_file_path`). Accessible for re-parsing or as PDF passage source
- Rate limit: max 10 uploads per instructor per hour (prevent Gemini API abuse)
- Depends on: F-IMPORT-01, F-IMPORT-02 for detailed import pipeline specs
