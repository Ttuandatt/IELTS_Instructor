# US-CLASS-08 — Post announcements to my classroom

| Field | Value |
|-------|-------|
| **Feature** | Announcements |
| **Domain** | Classroom |

> As an instructor, I want to post announcements to my classroom, so that I can communicate important information to all students at once.

## Acceptance Criteria

- AC1: Announcement form: accessible from classroom feed page. "Đăng thông báo" button (prominent, at top of feed)
- AC2: Form fields:
- AC3: On publish: announcement created with `{ classroom_id, author_id, title, body, created_at }`. Immediately visible in classroom feed
- AC4: Notification: all classroom members (learners + co-teachers) receive in-app notification: "📢 Thông báo mới từ {instructor_name}: {title}" with link to classroom feed. Email notification if enabled (see F-NOTIF-02)
- AC5: Classroom feed: announcements displayed in a timeline, newest first. Each announcement card shows: author avatar + name, title (bold), body (truncated to 200 chars with "Xem thêm" expand), timestamp (relative: "2 giờ trước")
- AC6: Edit: pencil icon on own announcements → inline edit mode. Updated `body` saved; edit history not tracked (lightweight). "Đã chỉnh sửa" indicator shown on edited announcements
- AC7: Delete: trash icon → confirmation "Xóa thông báo này?" → hard delete. Notification not recalled (already delivered)
- AC8: Only instructor (owner + co-teachers) can post/edit/delete. Learners can only view
- AC9: Announcements do NOT support comments/replies (keep simple; use F-COMM-01 for discussions)
- AC10: Pin announcement: "Ghim" toggle → pinned announcements appear at top of feed regardless of date, with 📌 icon. Max 3 pinned per classroom
- AC11: Pagination: 20 announcements per page, infinite scroll or "Xem thêm"
