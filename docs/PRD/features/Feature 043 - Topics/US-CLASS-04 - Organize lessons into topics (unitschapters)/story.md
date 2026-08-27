# US-CLASS-04 — Organize lessons into topics (units/chapters)

| Field | Value |
|-------|-------|
| **Feature** | Topics |
| **Domain** | Classroom |

> As an instructor, I want to organize lessons into topics (units/chapters), so that my course has a clear structure that students can follow.

## Acceptance Criteria

- Topic CRUD within classroom edit view. Requires classroom owner or co-teacher
- Create topic: "Thêm chủ đề" button → inline input field for topic name. Name: required, 2-100 chars. Empty → focus stays on input with red border. Save on Enter or blur; cancel on Escape
- Topic fields: `{ id, classroom_id, name, display_order, created_at }`
- Display: topics shown as collapsible accordion sections in classroom view. Click section header → expand/collapse lessons within. Expand state persisted in localStorage per user
- Default: first topic expanded, others collapsed
- Drag-to-reorder: drag handle (⠿) on topic header. Reorder updates `display_order` for all topics in single batch `PATCH /api/classrooms/{id}/topics/reorder` with ordered ID array
- Edit topic name: click topic name (or pencil icon) → inline text input. Save on Enter/blur, cancel on Escape
- Delete topic: trash icon → confirmation with logic:
- "Không có chủ đề" default topic: lessons not assigned to any topic shown under "Chung" or "Không phân loại" section at bottom
- Max topics per classroom: 50 (soft limit, warn at 40). "Lớp học chỉ được có tối đa 50 chủ đề"
- Topic names shown in sidebar nested under classroom name (learner view): collapsible tree structure
