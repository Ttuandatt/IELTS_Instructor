# US-CLASS-05 — Create lessons with different content types (text, video,...

| Field | Value |
|-------|-------|
| **Feature** | Lessons |
| **Domain** | Classroom |

> As an instructor, I want to create lessons with different content types (text, video, reading passage, writing prompt), so that I can build a structured curriculum with varied materials.

## Acceptance Criteria

- AC1: Create lesson: "Thêm bài học" button within a topic section. Opens create form/modal
- AC2: Lesson form fields:
- AC3: Learner visibility: only `status=published` lessons visible. Draft lessons show "(Bản nháp)" badge in instructor view
- AC4: Lesson ordering within topic: `display_order` integer. Drag-to-reorder via drag handle. Reorder API: batch PATCH
- AC5: Lessons with `due_at`: shown in learner's view with deadline badge: "Hạn: DD/MM/YYYY HH:mm". If overdue (past `due_at` and learner hasn't submitted): lesson card border turns red, badge shows "Quá hạn"
- AC6: Lesson detail page (learner): shows title, instructions, content (rendered by type), "Nộp bài" button for reading/writing types. Submission status shown if already submitted (see US-CLASS-07)
- AC7: Max lessons per classroom: 200 (soft limit). Per topic: no limit
