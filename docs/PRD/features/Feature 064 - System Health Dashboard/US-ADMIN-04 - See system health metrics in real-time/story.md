# US-ADMIN-04 — See system health metrics in real-time

| Field | Value |
|-------|-------|
| **Feature** | System Health Dashboard |
| **Domain** | Admin |

> As an admin, I want to see system health metrics in real-time, so that I can monitor platform stability and respond to issues before users are impacted.

## Acceptance Criteria

- AC1: Admin health page at `/admin/system`. Requires `role=admin`
- AC2: Key metrics displayed (auto-refreshed every 30 seconds or via WebSocket):
- AC3: Alert system: when any metric crosses threshold, admin sees flashing alert card at top of dashboard. Alert history (last 50) accessible via "Lịch sử cảnh báo" link
- AC4: BullMQ job detail: expandable section showing: completed today, failed today, average processing time, last failed job error message. "Retry Failed Jobs" button → re-queues all failed jobs in `scoring` queue
- AC5: Time range selector: "1 giờ" / "6 giờ" / "24 giờ" / "7 ngày" for historical charts
- AC6: Data source: metrics collected via application-level instrumentation (NestJS interceptors for API metrics) + Redis info command + PostgreSQL `pg_stat` views + file system stats
- AC7: No external monitoring service required in pilot (self-contained). Consider Prometheus/Grafana post-pilot
