# US-SPEAK-03 — Create speaking prompts (Part 1/2/3)

| Field | Value |
|-------|-------|
| **Feature** | Speaking Prompt Management |
| **Domain** | Speaking |

> As an instructor, I want to create speaking prompts (Part 1/2/3), so that I can assign speaking practice.

## Acceptance Criteria

- Prompt editor at `/instructor/speaking/create`. Requires `role=instructor` or `role=admin`
- Part type selector: "Part 1" / "Part 2" / "Part 3" radio buttons. Selected part determines form fields below
- **Part 1 form:**
- **Part 2 form:**
- **Part 3 form:**
- Common fields (all parts):
- Preview: "Xem trước" button → shows prompt as learner would see it (with timer UI mockup, cue card layout for Part 2)
- Assign to lesson: speaking prompts can be attached to classroom lessons (F-CLASS-05) as `lesson_type=speaking`
- Speaking prompt record: `{ id, instructor_id, title, part_type (1/2/3), content (JSONB: { questions, cue_card, bullet_points, follow_up }), tags, status, related_part2_id (for Part 3), created_at, updated_at }`
- Content management: same patterns as reading passages and writing prompts. Admin can manage all (F-ADMIN-02)
- Depends on: F-CLASS-05 (lesson assignment), F-ADMIN-02 (admin content management)
