# US-READ-03 — See my reading attempt history and scores

| Field | Value |
|-------|-------|
| **Feature** | Reading Score & History |
| **Domain** | Reading |

> As a learner, I want to see my reading attempt history and scores, so that I can track my progress over time and revisit past mistakes.

## Acceptance Criteria

- AC1: History page route: `/reading/history`. Requires authentication
- AC2: Table columns: Date (DD/MM/YYYY HH:mm), Passage Name (clickable → attempt detail), Mode (Practice/Simulation badge), Score (correct/total), Percentage, Time Spent (MM:SS)
- AC3: Default sort: newest first (`submitted_at DESC`). Sortable by date, score, passage name (click column header to toggle ASC/DESC)
- AC4: Pagination: 20 items per page; show "Trang {n}/{total}" with prev/next buttons. API uses cursor-based pagination for performance
- AC5: Filter by mode: "Tất cả" / "Luyện tập" / "Thi thử" tabs/chips above the table
- AC6: Filter by date range: date picker (from/to) for narrowing history
- AC7: Empty state: "Bạn chưa làm bài đọc nào. Bắt đầu luyện tập!" with CTA button → reading list page
- AC8: Click attempt row → attempt detail page `/reading/attempts/{attemptId}`: shows passage text (read-only) + all questions with learner's answers, correct answers, and ✓/✗ indicators. No re-submit allowed
- AC9: Score displayed as correct/total and percentage — NOT converted to band score (per decision D6). No band equivalence table shown
- AC10: Simulation attempts show all 3 passages with per-passage breakdown on detail page
- AC11: API response time: < 500ms for history list (indexed on `user_id + submitted_at`)
- AC12: Learner can only see their own attempts; API enforces `user_id` filter from JWT. Attempting to access another user's attempt → 403
