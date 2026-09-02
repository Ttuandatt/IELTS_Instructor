# US-DASH-03 — See my writing band estimates graphed over time

| Field | Value |
|-------|-------|
| **Feature** | Band Score Trend Chart |
| **Domain** | Dashboard & Analytics |

> As a learner, I want to see my writing band estimates graphed over time, so that I can visualize my improvement trajectory and identify which criteria improve fastest.

## Acceptance Criteria

- AC1: Chart location: `/dashboard/analytics` or as a section on the main dashboard (expandable)
- AC2: Chart type: line chart with smooth curves. X-axis = submission date (evenly spaced by time). Y-axis = band score (range 0-9, gridlines at 0.5 intervals)
- AC3: Data series (5 lines, each toggleable via legend):
- AC4: Hover/tap data point: tooltip showing submission date, prompt title, overall band, all 4 criteria scores
- AC5: Date range filter: chips "7 ngày" / "30 ngày" / "3 tháng" / "Tất cả" (default: "3 tháng"). Date range picker for custom range
- AC6: Minimum data: at least 2 scored submissions required to show chart. Fewer → "Nộp thêm bài viết để xem biểu đồ xu hướng" with illustration
- AC7: Data source: only `released_ai` and `finalized` submissions (not `pending_review` — scores not visible to learner yet). Self-study and classroom submissions both included
- AC8: Chart renders client-side (Canvas-based, e.g., Chart.js or similar). SVG fallback for accessibility
- AC9: Responsive: chart fills container width; legend below chart on mobile (not beside)
- AC10: Accessibility: chart has `aria-label` describing the trend. Data also available as table (toggle: "Xem dạng bảng")
- AC11: Performance: API returns max 100 data points (aggregate if > 100 submissions in range); response < 300ms
