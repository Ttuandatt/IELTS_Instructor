# US-ENGAGE-02 — Earn badges for milestones

| Field | Value |
|-------|-------|
| **Feature** | Badges & Achievements |
| **Domain** | Engagement & Gamification |

> As a learner, I want to earn badges for milestones, so that I feel a sense of accomplishment.

## Acceptance Criteria

- Badge catalog (~15 badges, expandable):
- Badge record: `{ id, user_id, badge_type (enum), earned_at, trigger_entity_id (submission/attempt that earned it) }`. Unique constraint on `(user_id, badge_type)` — each badge earned once
- Badge check: triggered asynchronously after each qualifying activity (BullMQ job `check-badges`). Checks all unearned badges against current user stats. If newly earned → create record + send notification
- Badge display: profile page has "Huy hiệu" section showing earned badges as icons in a grid. Each badge: icon (custom SVG or emoji), name, description, date earned. Unearned badges shown as locked (grayscale + 🔒). Hover/tap shows criteria
- Badge gallery at `/badges`: shows ALL available badges with criteria. Progress indicator for countable badges (e.g., "Bài đọc: 7/10 📖")
- Notification on badge earned (F-NOTIF-01): "🏆 Bạn đã nhận huy hiệu '{badge_name}'!" with link to badge gallery. Toast animation with confetti (CSS-only, respects prefers-reduced-motion)
- Instructor can see student badges in progress view (F-CLASS-07): badge icons displayed as small row under student name
- Badge data included in data export (F-COMP-04)
- Depends on: F-NOTIF-01 (earned notification), F-DASH-01 (dashboard display), F-CLASS-07 (instructor view)
