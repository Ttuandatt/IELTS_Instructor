# US-CLASS-06 — Duplicate a lesson

| Field | Value |
|-------|-------|
| **Feature** | Lessons |
| **Domain** | Classroom |

> As an instructor, I want to duplicate a lesson, so that I can reuse content across topics or classrooms without recreating from scratch.

## Acceptance Criteria

- AC1: "Nhân bản" button on lesson card (instructor view) → creates copy in same topic
- AC2: Duplicated lesson: title = "{original_title} (Copy)", `status=draft`, `due_at=null` (dates don't carry over), `display_order` = last in topic
- AC3: Content duplication: text content copied, video URL copied. Reading passage / writing prompt: references are SHARED (same passage/prompt ID), not deep-copied. Editing the referenced passage affects both lessons
- AC4: "Nhân bản vào lớp khác" option: modal → select target classroom → select target topic → creates lesson there. Requires instructor to be owner/co-teacher of target classroom
- AC5: Submissions are NOT copied (each lesson tracks its own submissions)
- AC6: Original lesson unaffected by duplication
