# US-WRIT-03 — Retry AI scoring if it fails

| Field | Value |
|-------|-------|
| **Feature** | AI Scoring (Gemini) |
| **Domain** | Writing |

> As a learner, I want to retry AI scoring if it fails, so that a temporary Gemini API error doesn't permanently block my feedback.

## Acceptance Criteria

- `ai_failed` state: submission detail page shows error message "Chấm điểm AI thất bại" with "Thử lại" button (primary blue) and "Liên hệ hỗ trợ" link
- Retry button click: `POST /api/writing/submissions/{id}/retry`. State transitions: `ai_failed` → `submitted` → re-queues scoring job
- Max 3 retries per submission. Counter tracked in `retry_count` field. After 3 failures: "Thử lại" button disabled with "Đã thử 3 lần. Vui lòng liên hệ hỗ trợ hoặc thử lại sau" and "Liên hệ hỗ trợ" mailto link
- Each retry logged: `{ attempt_number, error_type, error_message, attempted_at }`
- Retry does not consume an additional rate-limit count (only initial submit counts toward daily limit, see F-WRIT-09)
- If Gemini API is down (consecutive failures across users): admin notified via system health alert (see F-ADMIN-04). Consider circuit breaker pattern: after 5 consecutive failures in 5 min, pause queue for 2 min before retrying
