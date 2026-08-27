# US-BILL-01 — Use Langy completely free forever

| Field | Value |
|-------|-------|
| **Feature** | Free Teacher Access |
| **Domain** | Billing & Subscription |

> As an instructor, I want to use Langy completely free forever, so that I can adopt it as my teaching platform without financial risk.

## Acceptance Criteria

- Instructor role (`role=instructor`) has zero feature restrictions — no usage caps, no feature gates, no trial periods. This is a permanent business decision, not a promotion
- No credit card, payment method, or billing info required at any point during instructor registration or usage
- Instructor UI never shows: upgrade prompts, pricing banners, "premium" badges, subscription CTAs, or any billing-related navigation. Billing menu item hidden for instructor role
- All features available to instructors regardless of student subscription status: classroom creation (unlimited), content CRUD, student management, review queue, analytics, exports, AI-generated questions (F-IMPORT-06)
- Rate limits for instructors are generous operational limits (prevent abuse), NOT monetization limits. Example: AI scoring review unlimited for instructor overrides; content imports limited only by Gemini API cost controls
- If a user's role changes from learner to instructor (admin action), any active subscription remains but no new billing is required. If role changes from instructor to learner, free tier applies until subscription purchased
- Admin dashboard (F-ADMIN-05) tracks instructor count separately — business metric for adoption, never for billing
