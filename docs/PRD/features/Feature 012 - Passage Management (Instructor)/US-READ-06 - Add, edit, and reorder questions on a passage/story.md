# US-READ-06 — Add, edit, and reorder questions on a passage

| Field | Value |
|-------|-------|
| **Feature** | Passage Management (Instructor) |
| **Domain** | Reading |

> As an instructor, I want to add, edit, and reorder questions on a passage, so that I can build and refine test content.

## Acceptance Criteria

- AC1: Question editor accessible from passage edit page, below passage content. Section header: "Câu hỏi ({count})"
- AC2: Add question button: "Thêm câu hỏi" → type selector dropdown showing all 13 types with Vietnamese labels (e.g., "Đúng/Sai/Không có thông tin", "Trắc nghiệm", "Điền vào chỗ trống")
- AC3: Type-specific fields per question:
- AC4: Drag-to-reorder: drag handle on each question card. Reorder updates `display_order` for all affected questions via single batch API call
- AC5: Delete question: trash icon → confirmation "Xóa câu hỏi #{number}?". Remaining questions renumbered
- AC6: Inline preview: "Xem trước" toggle button → renders questions exactly as learner would see them (read-only, with input fields)
- AC7: Validation on save: at least 1 question required before publishing passage. No questions → publish blocked with "Thêm ít nhất 1 câu hỏi trước khi xuất bản"
- AC8: Batch save: all question changes (add/edit/delete/reorder) saved together in one transaction when instructor clicks "Lưu câu hỏi"
