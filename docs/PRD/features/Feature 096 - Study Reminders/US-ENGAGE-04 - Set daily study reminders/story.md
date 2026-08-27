# US-ENGAGE-04 — Set daily study reminders

| Field | Value |
|-------|-------|
| **Feature** | Study Reminders |
| **Domain** | Engagement & Gamification |

> As a learner, I want to set daily study reminders, so that I build a consistent practice habit.

## Acceptance Criteria

- Settings at `/settings/reminders`:
- Reminder delivery channels (based on F-NOTIF-03 preferences):
- Reminder content (Vietnamese, rotated — not same message every day):
- Reminder suppressed if: user already has qualifying activity today (streak already counted for today). Don't nag someone who already practiced
- Reminder scheduling: cron job runs every minute, checks users with `reminder_enabled=true` AND `reminder_time` matches current UTC+7 time (within 1-minute window) AND current day-of-week is in their selected days AND no activity today. Sends notification
- Timezone: all reminder times in UTC+7 (Vietnamese market). No per-user timezone setting in v1 (simplicity). If expanding to other markets: add timezone field
- Unsubscribe: turning OFF the toggle immediately stops all future reminders. No "are you sure?" — respect the user's choice
- Admin analytics (F-ADMIN-05): "% of learners with reminders enabled", "Reminder → activity conversion rate" (users who practiced within 2 hours of reminder)
- Depends on: F-NOTIF-01 (in-app delivery), F-NOTIF-02 (email delivery), F-MOBILE-02 (push notifications)
