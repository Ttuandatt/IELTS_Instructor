# US-DASH-01 — As a learner, I want a dashboard showing my recent activity,

| Field | Value |
|-------|-------|
| **Feature** | Learner Dashboard |
| **Domain** | Dashboard & Analytics |

> As a learner, I want a dashboard showing my recent activity, scores, and next steps, so that I can see my progress at a glance and know what to do next.

## Acceptance Criteria

- AC1: Dashboard route: `/dashboard`. Requires authentication with `role=learner`. Instructors have separate dashboard (see F-DASH-02)
- AC2: Summary cards row (top):
- AC3: Cards show real data ONLY — display "—" placeholder when no data exists. NEVER show zeros masquerading as data (0.0 band vs no data are different). Subtitle: "Chưa có dữ liệu" when empty
- AC4: Recent activity section: last 10 submissions (reading + writing mixed), sorted by date DESC. Each row: icon (📖/✏️), title, date (relative), score/band, status badge. Click → detail page
- AC5: Quick actions section: prominent buttons:
- AC6: Classroom section (if enrolled): cards for each classroom showing name, instructor, pending assignments count, next due date. Click → classroom page
- AC7: Study streak (if F-ENG-01 built): "🔥 {n} ngày liên tiếp" counter displayed prominently
- AC8: Page load time: < 1 second (dashboard data should be precomputed/cached, not aggregated on each request)
- AC9: Empty dashboard (new user, no activity): welcoming message "Chào {display_name}! Bắt đầu luyện tập IELTS" with onboarding cards guiding to first reading or writing exercise
- AC10: Mobile: cards stack vertically; recent activity shows 5 items with "Xem tất cả" link
