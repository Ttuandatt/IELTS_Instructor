# US-WRIT-07 — See a clear "waiting for review" status until my instruct...

| Field | Value |
|-------|-------|
| **Feature** | Writing Mode A/B (Instant vs Review-First) |
| **Domain** | Writing |

> As a learner in a review-first classroom, I want to see a clear "waiting for review" status until my instructor releases scores, so that I understand why my results aren't visible yet.

## Acceptance Criteria

- Submission detail page in `pending_review` state shows:
- Writing history page: `pending_review` submissions show orange clock icon + "Chờ duyệt" text instead of score
- When instructor releases (→ `finalized`): in-app notification sent to learner: "Giáo viên đã duyệt bài viết '{prompt_title}'" with link to submission detail. Email notification if email notifications enabled (see F-NOTIF-02)
- Finalized submission shows: AI scores + AI feedback + instructor scores (if overridden) + instructor comments. Clear labeling: "Điểm AI (ước lượng)" vs "Điểm giáo viên" sections
- Security: API endpoint `GET /api/writing/submissions/{id}` checks: if `state=pending_review` AND requester is learner → strip `ai_scores`, `ai_feedback` from response. Only instructor/admin see scores in pending state
