# US-WRIT-10 — Create and manage writing prompts (Task 1 and Task 2)

| Field | Value |
|-------|-------|
| **Feature** | Writing Prompt Management |
| **Domain** | Writing |

> As an instructor, I want to create and manage writing prompts (Task 1 and Task 2), so that I can assign varied writing exercises to my students.

## Acceptance Criteria

- AC1: Prompt management page: `/instructor/prompts`. Shows all prompts created by this instructor
- AC2: Create prompt form fields:
- AC3: Edit: all fields editable. Changes tracked in `content_versions` (F-ADMIN-03)
- AC4: Delete: soft-delete. Confirmation: "Xóa đề bài '{title}'? Các bài nộp liên quan sẽ được giữ lại." Deleted prompts not shown in browse; existing submissions reference them as "[Đề bài đã xóa]"
- AC5: Prompt list: paginated (20/page), searchable by title, filterable by task_type + status + tags
- AC6: "Gán cho bài học" button → modal: select classroom → select lesson → link prompt to lesson. Same prompt can be assigned to multiple lessons
- AC7: Preview: "Xem trước" button → renders prompt exactly as learner sees it (read-only, with image)
- AC8: Duplicate: "Nhân bản" → creates copy with "(Copy)" suffix, `status=draft`
- AC9: Published prompt with submissions: cannot be deleted (only unpublished). Unpublish first, then delete. Warning shown if prompt has active submissions
