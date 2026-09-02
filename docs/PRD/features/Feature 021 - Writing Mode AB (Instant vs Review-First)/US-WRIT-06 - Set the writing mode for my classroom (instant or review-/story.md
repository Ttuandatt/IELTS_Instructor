# US-WRIT-06 — Set the writing mode for my classroom (instant or review-...

| Field | Value |
|-------|-------|
| **Feature** | Writing Mode A/B (Instant vs Review-First) |
| **Domain** | Writing |

> As an instructor, I want to set the writing mode for my classroom (instant or review-first), so that I control whether students see AI scores immediately or only after my review.

## Acceptance Criteria

- AC1: Setting location: classroom settings page `/instructor/classrooms/{id}/settings`, section "Chế độ chấm bài viết"
- AC2: Two radio buttons with descriptions:
- AC3: Default for new classrooms: `instant` (lower friction for pilot adoption)
- AC4: Saving mode change: `PATCH /api/classrooms/{id}` with `{ writing_mode }`. Confirmation modal: "Thay đổi chế độ chỉ áp dụng cho bài nộp MỚI. Các bài đã nộp giữ nguyên trạng thái hiện tại." (enforces invariant #2)
- AC5: **Invariant #2 enforcement:** when mode changes from instant→review-first, existing `released_ai` submissions stay `released_ai` (NOT retroactively moved to `pending_review`). When mode changes from review-first→instant, existing `pending_review` submissions stay `pending_review` (instructor must still release them manually)
- AC6: UI shows current mode as badge on classroom card: "⚡ Chấm tức thì" or "👁 Duyệt trước"
- AC7: Only classroom owner or co-teacher can change writing_mode. Learners cannot see this setting
