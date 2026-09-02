# US-DASH-08 — Set my IELTS test date and see a countdown with a study plan

| Field | Value |
|-------|-------|
| **Feature** | Study Calendar & Target Date |
| **Domain** | Dashboard & Analytics |

> As a learner, I want to set my IELTS test date and see a countdown with a study plan, so that I can pace my preparation and stay on track.

## Acceptance Criteria

- AC1: Settings: "Ngày thi IELTS" date picker in learner profile/settings. `target_test_date` field (nullable date). "Điểm mục tiêu" input: band target (4.0-9.0 in 0.5 steps), default: 6.5
- AC2: Countdown widget on dashboard: "Còn {n} ngày đến kỳ thi ({date})" prominently displayed. Color: green (> 30 days), orange (15-30 days), red (< 15 days). If past → "Kỳ thi đã qua — Đặt ngày thi mới?"
- AC3: Suggested daily practice load: calculated based on (target_date - today) and current level vs target:
- AC4: Calendar view: monthly calendar grid. Day cells show:
- AC5: Streak visualization: consecutive green days shown with connecting line/highlight
- AC6: Calendar navigation: prev/next month arrows. Default: current month
- AC7: No test date set: calendar still shows practice history. Countdown section shows "Đặt ngày thi IELTS để xem đếm ngược" with CTA → settings
- AC8: Target date included in data export (F-COMP-04) and visible in instructor progress view (F-CLASS-07): "Ngày thi: {date}" column if set
- AC9: Depends on: F-ENG-01 (streak data, optional), F-CLASS-08 (due dates on calendar)
