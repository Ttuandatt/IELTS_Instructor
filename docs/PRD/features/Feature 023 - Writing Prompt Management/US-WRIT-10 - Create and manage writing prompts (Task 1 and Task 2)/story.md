# US-WRIT-10 — Create and manage writing prompts (Task 1 and Task 2)

| Field | Value |
|-------|-------|
| **Feature** | Writing Prompt Management |
| **Domain** | Writing |

> As an instructor, I want to create and manage writing prompts (Task 1 and Task 2), so that I can assign varied writing exercises to my students.

## Acceptance Criteria

- Prompt management page: `/instructor/prompts`. Shows all prompts created by this instructor
- Create prompt form fields:
- Edit: all fields editable. Changes tracked in `content_versions` (F-ADMIN-03)
- Delete: soft-delete. Confirmation: "Xóa đề bài '{title}'? Các bài nộp liên quan sẽ được giữ lại." Deleted prompts not shown in browse; existing submissions reference them as "[Đề bài đã xóa]"
- Prompt list: paginated (20/page), searchable by title, filterable by task_type + status + tags
- "Gán cho bài học" button → modal: select classroom → select lesson → link prompt to lesson. Same prompt can be assigned to multiple lessons
- Preview: "Xem trước" button → renders prompt exactly as learner sees it (read-only, with image)
- Duplicate: "Nhân bản" → creates copy with "(Copy)" suffix, `status=draft`
- Published prompt with submissions: cannot be deleted (only unpublished). Unpublish first, then delete. Warning shown if prompt has active submissions
