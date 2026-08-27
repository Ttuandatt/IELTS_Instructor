# US-READ-03 — See my reading attempt history and scores

| Field | Value |
|-------|-------|
| **Feature** | Reading Score & History |
| **Domain** | Reading |

> As a learner, I want to see my reading attempt history and scores, so that I can track my progress over time and revisit past mistakes.

## Acceptance Criteria

- History page route: `/reading/history`. Requires authentication
- Table columns: Date (DD/MM/YYYY HH:mm), Passage Name (clickable → attempt detail), Mode (Practice/Simulation badge), Score (correct/total), Percentage, Time Spent (MM:SS)
- Default sort: newest first (`submitted_at DESC`). Sortable by date, score, passage name (click column header to toggle ASC/DESC)
- Pagination: 20 items per page; show "Trang {n}/{total}" with prev/next buttons. API uses cursor-based pagination for performance
- Filter by mode: "Tất cả" / "Luyện tập" / "Thi thử" tabs/chips above the table
- Filter by date range: date picker (from/to) for narrowing history
- Empty state: "Bạn chưa làm bài đọc nào. Bắt đầu luyện tập!" with CTA button → reading list page
- Click attempt row → attempt detail page `/reading/attempts/{attemptId}`: shows passage text (read-only) + all questions with learner's answers, correct answers, and ✓/✗ indicators. No re-submit allowed
- Score displayed as correct/total and percentage — NOT converted to band score (per decision D6). No band equivalence table shown
- Simulation attempts show all 3 passages with per-passage breakdown on detail page
- API response time: < 500ms for history list (indexed on `user_id + submitted_at`)
- Learner can only see their own attempts; API enforces `user_id` filter from JWT. Attempting to access another user's attempt → 403
