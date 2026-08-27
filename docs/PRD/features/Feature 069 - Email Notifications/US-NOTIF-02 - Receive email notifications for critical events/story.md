# US-NOTIF-02 — Receive email notifications for critical events

| Field | Value |
|-------|-------|
| **Feature** | Email Notifications |
| **Domain** | Notifications |

> As a user, I want to receive email notifications for critical events, so that I don't miss important updates even when I'm not actively using the platform.

## Acceptance Criteria

- Email sent for these event types (configurable per user via F-NOTIF-03):
- Email template: HTML email with Vietnamese text, Langy logo header, content section, CTA button linking to relevant page, footer with unsubscribe link
- Unsubscribe link in every email: `{FRONTEND_URL}/unsubscribe?token={one-time-token}&type={notification_type}`. Click → toggles off email for that type. Confirmation page: "Bạn đã tắt thông báo email cho {type}. Bạn có thể bật lại trong Cài đặt." PDPL requirement: must be one-click (no login required)
- Batching: max 1 email per event type per user per hour. Multiple events of same type within 1 hour → combined into single email with event list. Prevents email spam during burst activity
- Email delivery: via transactional email service (SendGrid, SES, or similar). Retry: 3 attempts with exponential backoff (1min, 5min, 30min). Failed delivery logged but not exposed to user
- Email only sent to verified email addresses (F-AUTH-04). Unverified users get in-app notifications only
- Reply-to: `noreply@langy.vn`. Emails are outgoing only — no incoming email processing
- Email content: plain-text fallback for clients that don't render HTML. Subject lines in Vietnamese. Max body length: 500 chars (concise — direct to the platform for details)
- Tracking: open rate and click rate tracked via pixel/redirect (optional, configurable). No PII in tracking URLs
