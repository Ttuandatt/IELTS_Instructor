# US-WRIT-11 — See all my past writing submissions with scores and status

| Field | Value |
|-------|-------|
| **Feature** | Writing History & Analytics |
| **Domain** | Writing |

> As a learner, I want to see all my past writing submissions with scores and status, so that I can track my improvement over time.

## Acceptance Criteria

- AC1: History page route: `/writing/history`. Requires authentication
- AC2: Table columns: Date (DD/MM/YYYY HH:mm, relative for < 24h: "3 giờ trước"), Prompt Title (clickable → submission detail), Task Type (badge "T1"/"T2"), Overall Band (number or "—" if not scored), State (badge with color), Word Count
- AC3: State badges and colors:
- AC4: Default sort: newest first. Sortable by date, band, state, word count
- AC5: Filters: state filter (chips: "Tất cả", "Đã chấm", "Chờ duyệt", "Lỗi"), task type ("Tất cả", "Task 1", "Task 2"), date range picker
- AC6: Click row → submission detail page `/writing/submissions/{id}`:
- AC7: Empty state: "Bạn chưa viết bài nào. Bắt đầu luyện viết!" with CTA button → prompt browser
- AC8: Pagination: 20 items per page, cursor-based
- AC9: API response excludes `ai_scores` field for `pending_review` submissions when requester is learner (security enforcement)
- AC10: Band trend summary at top of history page: "Bài gần nhất: {band}" and mini trend indicator (↑ improving / ↓ declining / → stable, based on last 5 scored submissions)
