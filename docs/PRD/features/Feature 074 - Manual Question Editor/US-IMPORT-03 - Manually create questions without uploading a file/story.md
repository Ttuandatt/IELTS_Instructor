# US-IMPORT-03 — Manually create questions without uploading a file

| Field | Value |
|-------|-------|
| **Feature** | Manual Question Editor |
| **Domain** | Content Import & Parsing |

> As an instructor, I want to manually create questions without uploading a file, so that I can build custom tests from scratch or add questions to existing passages.

## Acceptance Criteria

- Question editor: accessible from passage edit page → "Thêm câu hỏi" button, and from standalone create page
- Type selector: dropdown with all 13 IELTS question types, labeled in Vietnamese:
- Type-specific form fields:
- Group instruction: if multiple questions share a common instruction (e.g., "Choose the correct letter A, B, C or D"), enter it in `group_instruction` field. Displayed as a header above the question group for learners
- Inline preview: "Xem trước" toggle shows questions as learners see them (read-only inputs, formatted). Live updates as instructor types
- Validation on save: `stem` required, `correct_answer` required, type-specific validation (MCQ has options with correct marked, matching has valid pairs). Violations shown inline with red borders and messages
- Drag-to-reorder: drag handle on each question card to change order. Updates `display_order` field
- Batch save: "Lưu tất cả" button saves all changes in single transaction. No auto-save for question editor (explicit save required)
