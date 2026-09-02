# US-ADMIN-05 — See platform-wide analytics (DAU, submissions/day, LLM to...

| Field | Value |
|-------|-------|
| **Feature** | Usage Analytics |
| **Domain** | Admin |

> As an admin, I want to see platform-wide analytics (DAU, submissions/day, LLM token usage and cost), so that I can track growth and control costs.

## Acceptance Criteria

- AC1: Admin analytics at `/admin/analytics`. Requires `role=admin`
- AC2: Top-level KPI cards:
- AC3: LLM Usage section:
- AC4: Submission analytics: line chart of submissions per day (reading + writing stacked). Filter by type
- AC5: User growth: line chart of new registrations per day. Funnel: registered → verified → first submission → retained (>= 2 submissions)
- AC6: Classroom analytics: total classrooms, avg students per classroom, most active classrooms
- AC7: Time range: "7 ngày" / "30 ngày" / "3 tháng" / "Tùy chỉnh" date range picker
- AC8: Comparison mode: "So sánh với kỳ trước" toggle → shows +/- percentage change for each metric
- AC9: Export: "Xuất CSV" downloads raw data for selected time range
- AC10: Data source: aggregated from scoring_logs (LLM), reading_attempts, writing_submissions, users tables. Pre-aggregated into `analytics_daily` summary table via daily cron job
- AC11: Performance: analytics page loads in < 2 seconds (precomputed aggregates, not real-time queries on raw tables)
