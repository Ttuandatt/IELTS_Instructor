# US-COMM-02 — See all my message threads in one inbox

| Field | Value |
|-------|-------|
| **Feature** | Direct Messaging |
| **Domain** | Communication |

> As an instructor, I want to see all my message threads in one inbox, so that I can respond efficiently.

## Acceptance Criteria

- Inbox page at `/messages`. Two-panel layout: thread list (left, 300px) + active thread (right, remaining width). Mobile: thread list only → tap thread → full-screen thread view with back button
- Thread list: sorted by `last_message_at` DESC (most recent first). Each thread row: learner avatar + name, classroom name (small text below), last message preview (truncated 80 chars), relative timestamp ("5 phút trước"), unread badge (blue dot if unread)
- Search threads: text input at top of thread list. Searches by learner name and message content. Debounced 300ms
- Filter: "Tất cả" / "Chưa đọc" toggle
- Quick reply: in thread list view, hover thread → "↩️" icon → inline reply input expands below thread preview. Send without opening full thread. Useful for short responses
- Thread detail: message bubbles (own messages right-aligned, counterpart left-aligned). Timestamps grouped by day ("Hôm nay", "Hôm qua", date). Scroll to bottom on open (latest messages visible)
- Infinite scroll: older messages loaded on scroll-up (20 per batch). Loading indicator at top
- Instructor can initiate conversation: "Tin nhắn mới" button → select student from their classrooms (search by name). If thread already exists → opens existing thread instead of creating duplicate
- Thread context: thread header shows learner name, classroom name, "Xem hồ sơ" link → learner's progress page in that classroom
- Depends on: F-NOTIF-01 (new message notification), F-NOTIF-04 (real-time delivery), F-CLASS-01 (classroom membership for scoping)
