# US-ENGAGE-01 — See my study streak (consecutive days with activity)

| Field | Value |
|-------|-------|
| **Feature** | Study Streaks |
| **Domain** | Engagement & Gamification |

> As a learner, I want to see my study streak (consecutive days with activity), so that I'm motivated to practice daily.

## Acceptance Criteria

- Streak counter displayed on learner dashboard (F-DASH-01): "🔥 {n} ngày liên tiếp" with fire emoji. Counter font size increases at milestones (7+ days: slightly larger, 30+ days: prominently larger)
- Activity definition: a day counts as "active" if the learner has at least ONE of: completed reading attempt (submitted answers), submitted writing essay (non-draft, reaches `submitted` state or beyond), completed vocabulary review session (F-VOCAB-02, minimum 5 cards reviewed). Browsing/viewing without submitting does NOT count
- Day boundary: midnight UTC+7 (Vietnam timezone). Activity at 23:59 UTC+7 counts for that day; activity at 00:01 UTC+7 starts the next day
- Streak logic: stored in `user_streaks` table: `{ user_id, current_streak (int), longest_streak (int), last_active_date (DATE), streak_started_at (DATE) }`. Updated on each qualifying activity:
- Streak break: no notification when streak breaks (avoid negative reinforcement). Dashboard simply shows "🔥 1 ngày" (new streak started). If learner had 0 activity ever or broke streak yesterday: show "Bắt đầu chuỗi luyện tập!" instead of "0 ngày"
- Milestone notifications (in-app, via F-NOTIF-01):
- Streak visible to instructor in student progress view (F-CLASS-07): column "Chuỗi hiện tại" with streak count
- Streak freeze (future consideration, not v1): ability to "freeze" streak for 1 day (e.g., sick day). Descoped — too complex for initial implementation
- Performance: streak check on activity is a single UPDATE query, O(1). No batch calculation needed
- Depends on: F-DASH-01 (dashboard display), F-NOTIF-01 (milestone notifications)
