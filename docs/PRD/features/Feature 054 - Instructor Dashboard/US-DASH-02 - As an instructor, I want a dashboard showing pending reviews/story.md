# US-DASH-02 — As an instructor, I want a dashboard showing pending reviews

| Field | Value |
|-------|-------|
| **Feature** | Instructor Dashboard |
| **Domain** | Dashboard & Analytics |

> As an instructor, I want a dashboard showing pending reviews, class activity, and student engagement, so that I can manage my workload and spot issues early.

## Acceptance Criteria

- Dashboard route: `/instructor/dashboard`. Requires `role=instructor` or `role=admin`
- Priority section — Pending Reviews: large badge "{n} bài chờ duyệt" with "Duyệt ngay" button → review queue. Badge color: green (0-5), orange (6-20), red (>20). Shows combined count across all classrooms
- Per-classroom summary cards (horizontal scroll if > 3):
- Recent class activity feed (last 20 events across all classrooms):
- Quick actions: "Tạo lớp mới", "Tạo bài đọc", "Tạo đề viết", "Xem tất cả lớp"
- Announcements section: "Thông báo gần đây" — last 3 announcements across all classrooms
- Empty dashboard (no classrooms): "Chào {name}! Tạo lớp học đầu tiên" with CTA button → create classroom. Link to setup wizard (F-ONBOARD-02)
- Page load time: < 1.5 seconds. Pending review count updated in real-time if WebSocket connected (F-NOTIF-04); otherwise refreshed on page load
- Sidebar badge: pending review count shown as red badge on "Bài chờ duyệt" sidebar menu item (always visible, not just on dashboard)
