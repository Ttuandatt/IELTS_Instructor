# US-WRIT-14 — Limit AI scoring to 10 essays/day per learner

| Field | Value |
|-------|-------|
| **Feature** | Rate Limiting (Writing) |
| **Domain** | Writing |

> As the system, I want to limit AI scoring to 10 essays/day per learner, so that Gemini API costs stay within budget during the pilot phase.

## Acceptance Criteria

- AC1: Rate limit: 10 AI scoring submissions per user per calendar day. "Calendar day" = midnight-to-midnight in UTC+7 (Vietnam timezone, Asia/Ho_Chi_Minh)
- AC2: Counter stored in Redis: key `scoring_limit:{user_id}:{date_YYYYMMDD}`, value = count, TTL = 48 hours (auto-cleanup). Incremented on successful submit (state: `draft → submitted`), not on retry
- AC3: When limit reached:
- AC4: Rate limit headers on scoring-related endpoints: `X-RateLimit-Limit: 10`, `X-RateLimit-Remaining: {n}`, `X-RateLimit-Reset: {unix_timestamp}`
- AC5: **Instructor exemption:** users with `role=instructor` or `role=admin` are exempt from rate limit. No counter tracked, no limit UI shown
- AC6: Retries (US-WRIT-03) do NOT consume rate limit — only the initial submission counts
- AC7: Draft saves (auto-save) do NOT consume rate limit — only submits
- AC8: Rate limit configurable by admin (see F-ADMIN-06): `max_scoring_per_day` system setting, default 10. Changes apply to new counters (next day for existing users)
- AC9: Premium subscribers (F-BILL-02): higher limit (e.g., 50/day) or unlimited — configurable per plan tier
- AC10: Depends on: F-COMP-05 (general rate limiting infrastructure)
