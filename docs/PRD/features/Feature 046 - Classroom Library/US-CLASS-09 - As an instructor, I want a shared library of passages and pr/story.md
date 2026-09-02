# US-CLASS-09 — As an instructor, I want a shared library of passages and pr

| Field | Value |
|-------|-------|
| **Feature** | Classroom Library |
| **Domain** | Classroom |

> As an instructor, I want a shared library of passages and prompts within my classroom, so that I can organize reusable content and link it to multiple lessons.

## Acceptance Criteria

- AC1: Library tab at `/instructor/classrooms/{id}/library`. Shows all reading passages and writing prompts created by this instructor (not scoped to classroom — instructor's full content library)
- AC2: Library views: toggle between "Bài đọc" (passages) and "Đề viết" (prompts). Each tab shows card grid
- AC3: Passage cards: title, difficulty badge, question count, status badge (draft/published), tags. Actions: "Thêm vào bài học" (link to lesson), "Chỉnh sửa" (→ passage editor), "Xem trước" (→ preview mode)
- AC4: Prompt cards: title, task type badge (T1/T2), status, tags. Same actions
- AC5: "Thêm vào bài học" flow: click → modal shows topic/lesson tree for this classroom → select lesson → link created. One passage/prompt can be linked to multiple lessons
- AC6: Items not linked to any lesson: still visible in library (orphaned content is fine). Filter: "Đã gán" / "Chưa gán" / "Tất cả"
- AC7: Search within library: text search by title (debounced 300ms, substring match)
- AC8: Filter by: type (passage/prompt), status (draft/published), tags
- AC9: "Tạo mới" button: dropdown → "Bài đọc mới" or "Đề viết mới" → navigates to respective create form
- AC10: Library count shown in tab label: "Thư viện ({passage_count + prompt_count})"
- AC11: Content created in one classroom is accessible from ALL of the instructor's classrooms (content is instructor-scoped, not classroom-scoped)
