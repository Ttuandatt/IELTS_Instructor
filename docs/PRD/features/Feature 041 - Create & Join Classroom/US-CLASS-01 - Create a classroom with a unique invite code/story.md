# US-CLASS-01 — Create a classroom with a unique invite code

| Field | Value |
|-------|-------|
| **Feature** | Create & Join Classroom |
| **Domain** | Classroom |

> As an instructor, I want to create a classroom with a unique invite code, so that my students can join my class and access assigned content.

## Acceptance Criteria

- AC1: Create form at `/instructor/classrooms/create`. Requires `role=instructor`; learner → 403
- AC2: Form fields:
- AC3: On create: auto-generate 6-character invite code. Characters: uppercase alphanumeric [A-Z0-9], excluding ambiguous chars (0/O, 1/I/L). Code is case-insensitive (stored uppercase, input lowercased → uppercased before lookup)
- AC4: Invite code uniqueness: checked against all active classrooms. Collision (extremely rare at 30^6) → regenerate. Code displayed prominently with "📋 Sao chép" button
- AC5: Instructor can regenerate invite code at any time via settings (see US-CLASS-12). Old code immediately invalidated — students using old code → "Mã lớp không hợp lệ"
- AC6: Classroom record: `{ id, name, description, invite_code, writing_mode, owner_id, status: 'active', created_at }`
- AC7: No limit on number of classrooms per instructor during pilot. Max classroom name length enforced at DB level
- AC8: After creation: redirect to classroom detail page with toast "Lớp học đã được tạo!" and guide: "Chia sẻ mã {CODE} cho học sinh để tham gia"
