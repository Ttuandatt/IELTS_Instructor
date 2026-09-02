# US-CLASS-14 — Save a lesson setup as a reusable template

| Field | Value |
|-------|-------|
| **Feature** | Assignment Templates |
| **Domain** | Classroom |

> As an instructor, I want to save a lesson setup as a reusable template, so that I can quickly create similar lessons in other classrooms or future semesters.

## Acceptance Criteria

- AC1: Save as template: "Lưu làm template" button on any lesson's edit page
- AC2: Template captures: lesson title (as template name), content type, content reference (passage ID or prompt ID), instructions text, suggested due duration (e.g., "7 ngày" — relative, not absolute date)
- AC3: Template name: editable before saving, default = lesson title. 3-200 chars. "Tên template"
- AC4: Template storage: `lesson_templates` table: `{ id, instructor_id, name, type, content_ref_id, instructions, suggested_due_days, created_at }`
- AC5: Templates are instructor-scoped: only the creating instructor can see and use their templates. NOT shared across instructors (privacy of teaching materials)
- AC6: "Tạo từ template" option: when creating a new lesson → "Tạo từ template" tab in create modal → shows instructor's template list → click template → pre-fills lesson form with template data. `due_at` auto-calculated: `now() + suggested_due_days` if set
- AC7: Template list page: `/instructor/templates`. Shows all templates with name, type, creation date. Edit/delete actions
- AC8: Edit template: update name, instructions, suggested_due_days. Content reference is immutable (if passage/prompt is deleted, template shows "[Nội dung đã xóa]" — cannot be used until re-linked)
- AC9: Delete template: confirmation "Xóa template '{name}'?" → hard delete. Existing lessons created from this template are unaffected
- AC10: Max templates per instructor: 100 (soft limit)
- AC11: Depends on: F-CLASS-04 (lesson creation flow)
