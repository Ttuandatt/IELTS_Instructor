# US-IMPORT-02 — Upload a scanned PDF and have AI extract the passage and ...

| Field | Value |
|-------|-------|
| **Feature** | PDF Import (Reading) |
| **Domain** | Content Import & Parsing |

> As an instructor, I want to upload a scanned PDF and have AI extract the passage and questions, so that I can use Cambridge IELTS test books without manual retyping.

## Acceptance Criteria

- Upload endpoint: `POST /api/uploads` with `.pdf` file. Max file size: 20MB. Max pages: 10 (IELTS reading passages typically 2-4 pages). Exceeds → "PDF không được vượt quá 10 trang"
- Pipeline: each PDF page rendered as PNG image (300 DPI) → all page images sent to Gemini multimodal API in single request → Gemini returns structured JSON matching `question_groups` schema
- Gemini prompt includes: all page images + instruction to extract passage title, full passage text (preserve paragraphs), and all question groups with types, stems, options, and correct answers
- Preview page: same as DOCX preview. Instructor reviews and edits all parsed content before import. Type corrections especially important (AI may misclassify question types)
- "Giữ PDF gốc" checkbox (default: checked): if checked, original PDF stored and linked to passage as `pdf_file_path` for learner PDF viewer (F-READ-07). If unchecked, only extracted HTML text saved
- Parsing time: 15-30 seconds for 3-page PDF (Gemini latency). Progress: "Đang phân tích trang {n}/{total}…" or overall spinner
- Error handling: password-protected PDF → "PDF bị khóa. Vui lòng mở khóa trước khi tải lên". Blank/image-only PDF with no text → Gemini attempts OCR; low confidence → warn "Kết quả có thể không chính xác cho PDF quét kém chất lượng"
- Quality indicator: after parsing, show confidence badge: "Chất lượng: Cao/Trung bình/Thấp" based on Gemini's extraction quality signals. Low → "Vui lòng kiểm tra kỹ nội dung đã trích xuất"
- Rate limit: max 10 PDF uploads per instructor per hour (Gemini API cost control)
- Token usage: logged per request (see F-WRIT-05 pattern)
