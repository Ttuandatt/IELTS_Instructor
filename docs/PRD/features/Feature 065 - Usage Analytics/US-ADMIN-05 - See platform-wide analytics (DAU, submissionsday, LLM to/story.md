# US-ADMIN-05 — See platform-wide analytics (DAU, submissions/day, LLM to...

| Field | Value |
|-------|-------|
| **Feature** | Usage Analytics |
| **Domain** | Admin |

> As an admin, I want to see platform-wide analytics (DAU, submissions/day, LLM token usage and cost), so that I can track growth and control costs.

## Acceptance Criteria

- Admin analytics at `/admin/analytics`. Requires `role=admin`
- Top-level KPI cards:
- LLM Usage section:
- Submission analytics: line chart of submissions per day (reading + writing stacked). Filter by type
- User growth: line chart of new registrations per day. Funnel: registered → verified → first submission → retained (>= 2 submissions)
- Classroom analytics: total classrooms, avg students per classroom, most active classrooms
- Time range: "7 ngày" / "30 ngày" / "3 tháng" / "Tùy chỉnh" date range picker
- Comparison mode: "So sánh với kỳ trước" toggle → shows +/- percentage change for each metric
- Export: "Xuất CSV" downloads raw data for selected time range
- Data source: aggregated from scoring_logs (LLM), reading_attempts, writing_submissions, users tables. Pre-aggregated into `analytics_daily` summary table via daily cron job
- Performance: analytics page loads in < 2 seconds (precomputed aggregates, not real-time queries on raw tables)
