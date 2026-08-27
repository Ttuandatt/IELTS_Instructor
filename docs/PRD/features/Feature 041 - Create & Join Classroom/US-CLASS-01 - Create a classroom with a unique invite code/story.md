# US-CLASS-01 — Create a classroom with a unique invite code

| Field | Value |
|-------|-------|
| **Feature** | Create & Join Classroom |
| **Domain** | Classroom |

> As an instructor, I want to create a classroom with a unique invite code, so that my students can join my class and access assigned content.

## Acceptance Criteria

- Create form at `/instructor/classrooms/create`. Requires `role=instructor`; learner → 403
- Form fields:
- On create: auto-generate 6-character invite code. Characters: uppercase alphanumeric [A-Z0-9], excluding ambiguous chars (0/O, 1/I/L). Code is case-insensitive (stored uppercase, input lowercased → uppercased before lookup)
- Invite code uniqueness: checked against all active classrooms. Collision (extremely rare at 30^6) → regenerate. Code displayed prominently with "📋 Sao chép" button
- Instructor can regenerate invite code at any time via settings (see US-CLASS-12). Old code immediately invalidated — students using old code → "Mã lớp không hợp lệ"
- Classroom record: `{ id, name, description, invite_code, writing_mode, owner_id, status: 'active', created_at }`
- No limit on number of classrooms per instructor during pilot. Max classroom name length enforced at DB level
- After creation: redirect to classroom detail page with toast "Lớp học đã được tạo!" and guide: "Chia sẻ mã {CODE} cho học sinh để tham gia"
