# US-CLASS-15 — Duplicate an entire classroom (structure + content, witho...

| Field | Value |
|-------|-------|
| **Feature** | Classroom Duplication |
| **Domain** | Classroom |

> As an instructor, I want to duplicate an entire classroom (structure + content, without students), so that I can reuse a course structure for a new semester or a different class.

## Acceptance Criteria

- AC1: "Nhân bản lớp học" button on classroom settings page (owner only)
- AC2: Configuration modal: "Nhân bản lớp '{name}'" with options:
- AC3: What IS copied:
- AC4: What is NOT copied:
- AC5: Duplication process: `POST /api/classrooms/{id}/duplicate`. Response time: < 5 seconds for classroom with ~50 lessons. Progress indicator for large classrooms
- AC6: On success: redirect to new classroom page with toast "Lớp đã được nhân bản! Kiểm tra và xuất bản các bài học"
- AC7: Original classroom completely unaffected by duplication
- AC8: Edge case: original has 200 lessons → duplication might be slow. Show progress: "Đang nhân bản… {n}/{total} bài học"
- AC9: Depends on: F-CLASS-03 (topics), F-CLASS-04 (lessons)
