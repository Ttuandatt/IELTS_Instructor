# US-NOTIF-01 — See notifications for important events (scores ready, ass...

| Field | Value |
|-------|-------|
| **Feature** | In-App Notifications |
| **Domain** | Notifications |

> As a user, I want to see notifications for important events (scores ready, assignments, announcements), so that I stay informed without checking each feature manually.

## Acceptance Criteria

- Bell icon (🔔) in header/navbar, visible on all authenticated pages. Shows unread count badge (red circle with number). Badge hidden when count = 0. Count capped at "99+" for >99 unread
- Click bell → dropdown panel (max-height 400px, scrollable) showing recent notifications. Each item: type icon (📖📝📢⏰), title text (max 100 chars, truncated with "…"), preview text (max 80 chars), relative timestamp ("5 phút trước"), unread indicator (blue dot)
- Notification types and their messages:
- Click notification → navigate to linked page + mark as read. If page no longer exists (deleted content) → show toast "Nội dung không còn tồn tại"
- "Đánh dấu tất cả đã đọc" button at top of dropdown. Marks all as read via `PATCH /api/notifications/read-all`
- Individual mark as read: swipe-left (mobile) or hover → "✓" button (desktop)
- "Xem tất cả" link at bottom → full notifications page `/notifications` with paginated list (20/page), filters by type, date range
- Notifications stored in `notifications` table: `{ id, user_id, type, title, message, link, is_read, created_at }`. Indexed on `(user_id, is_read, created_at DESC)`
- Notification retention: 90 days. Older notifications auto-deleted by daily cron. Max 1000 per user (oldest deleted when exceeded)
- API: `GET /api/notifications?unread=true&limit=20` for dropdown; `PATCH /api/notifications/{id}/read` for marking read. Response < 100ms (indexed query)
