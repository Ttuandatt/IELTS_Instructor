# US-COMM-01 — Send a private message to my instructor

| Field | Value |
|-------|-------|
| **Feature** | Direct Messaging |
| **Domain** | Communication |

> As a learner, I want to send a private message to my instructor, so that I can ask questions about assignments.

## Acceptance Criteria

- Message thread: 1:1 between learner and instructor. Thread auto-created on first message. No group messaging. Scope: learner can only message instructors of classrooms they belong to. Attempt to message non-instructor → 403 "Bạn chỉ có thể nhắn tin cho giáo viên của mình"
- Message composer: text input at bottom of thread. "Gửi" button + Enter key to send. Shift+Enter for newline
- Message format: plain text only (v1). No file attachments, no images, no formatting. Max message length: 2,000 characters. Exceeds → "Tin nhắn không được vượt quá 2.000 ký tự" (character count shown live)
- Message record: `{ id, thread_id, sender_id, content, is_read, created_at }`. Thread record: `{ id, learner_id, instructor_id, classroom_id, last_message_at, last_message_preview (first 100 chars) }`
- Unread count: red badge on "Tin nhắn" sidebar menu item showing total unread messages across all threads. Updated in real-time via WebSocket (F-NOTIF-04) or on page load
- Read receipts: when recipient opens thread, all unread messages in that thread marked as read. No "seen" indicator shown to sender (privacy — instructor shouldn't feel pressured to respond immediately)
- Notification: new message → in-app notification (F-NOTIF-01): "💬 {sender_name}: {preview}" with link to thread. Email notification if enabled (F-NOTIF-02, batched per hour)
- Learner cannot message other learners (scope limit — Langy is not a social platform). Instructor-to-instructor messaging: also not supported (use external tools)
- Message deletion: sender can delete own messages within 5 minutes of sending. "Xóa" option on hover → "Tin nhắn đã bị xóa" placeholder shown to both parties. After 5 min: no deletion
- Message retention: 1 year. Older messages auto-archived (not displayed but included in data export). Thread kept if any messages remain
- Rate limit: max 30 messages per user per hour (prevent spam). Exceeded → "Bạn đã gửi quá nhiều tin nhắn. Thử lại sau"
