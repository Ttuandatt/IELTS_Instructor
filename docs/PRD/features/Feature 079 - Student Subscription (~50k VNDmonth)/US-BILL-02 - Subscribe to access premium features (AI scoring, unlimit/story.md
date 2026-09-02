# US-BILL-02 — Subscribe to access premium features (AI scoring, unlimit...

| Field | Value |
|-------|-------|
| **Feature** | Student Subscription (~50k VND/month) |
| **Domain** | Billing & Subscription |

> As a learner, I want to subscribe to access premium features (AI scoring, unlimited practice), so that I can use the full platform.

## Acceptance Criteria

- AC1: Two tiers:
- AC2: Upgrade page at `/settings/subscription`: comparison table with two columns (Free vs Premium). Each feature row shows ✓/✗ or limit. Green CTA button "Nâng cấp Premium — {price}/tháng"
- AC3: Free tier clearly labeled — never use language that implies the free tier is a "trial" or "limited time". It's permanent
- AC4: When free-tier learner hits daily AI scoring limit: toast "Bạn đã dùng hết {n}/{max} lượt chấm AI hôm nay. Nâng cấp Premium để chấm không giới hạn" with "Nâng cấp" link. Submission still saved as draft — can be scored tomorrow or after upgrade
- AC5: Scoring limit tracked in Redis: key `scoring_limit:{user_id}:{YYYY-MM-DD}`, expires at midnight UTC+7. Premium users bypass this check entirely
- AC6: Subscription status stored in `subscriptions` table: `{ id, user_id, plan (free/premium), status (active/cancelled/expired/past_due), payment_method, current_period_start, current_period_end, cancelled_at, created_at }`
- AC7: API middleware checks subscription: `SubscriptionGuard` decorator on premium-only endpoints. Returns 403 with body `{ code: "PREMIUM_REQUIRED", message: "Tính năng này yêu cầu gói Premium" }`
- AC8: Pricing is configurable via admin config (F-ADMIN-06) — `subscription_price_vnd` system parameter. Pilot pricing validated before monetization launch (decision D5)
- AC9: Classroom instructors see which students are free vs premium in member list (subtle badge, not prominent — avoid shaming)
- AC10: Depends on: F-BILL-03 (payment to activate), F-ADMIN-06 (pricing config)
