# US-READ-05 — Create, edit, and delete reading passages

| Field | Value |
|-------|-------|
| **Feature** | Passage Management (Instructor) |
| **Domain** | Reading |

> As an instructor, I want to create, edit, and delete reading passages, so that I can provide custom content for my students.

## Acceptance Criteria

- AC1: Passage CRUD at `/instructor/passages`. Requires `role=instructor` or `role=admin`; learner → 403
- AC2: Create form fields:
- AC3: Edit: all fields editable. Changes saved via `PUT /api/passages/{id}`. Edit history tracked in `content_versions` table (see F-ADMIN-03)
- AC4: Delete: soft-delete (set `deleted_at`). Confirmation modal: "Xóa bài đọc '{title}'? Các kết quả làm bài liên quan sẽ được giữ lại." Deleted passages hidden from browse but historical attempts still reference them (show "[Bài đọc đã xóa]" in attempt history)
- AC5: Learner visibility: only passages with `status=published` and `deleted_at=null` shown in browse/practice lists
- AC6: Instructor sees all own passages (draft + published + deleted) with status badges
- AC7: Passage list: paginated (20/page), searchable by title, filterable by status (draft/published/all) and tags
- AC8: Assign to classroom: "Thêm vào bài học" button → select classroom → select lesson → link created. Same passage can be assigned to multiple lessons/classrooms
