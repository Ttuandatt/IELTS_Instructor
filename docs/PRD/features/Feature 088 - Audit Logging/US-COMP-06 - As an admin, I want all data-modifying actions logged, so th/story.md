# US-COMP-06 — As an admin, I want all data-modifying actions logged, so th

| Field | Value |
|-------|-------|
| **Feature** | Audit Logging |
| **Domain** | Compliance & Security |

> As an admin, I want all data-modifying actions logged, so that I can investigate incidents and satisfy compliance audits.

## Acceptance Criteria

- Audit log stored in `audit_logs` table: `{ id (BIGINT auto-increment), actor_id (user who performed action), actor_role, action (enum), entity_type (user/passage/prompt/submission/classroom/config), entity_id, changes (JSONB — old/new values for modified fields), ip_address (hashed), user_agent (truncated to 200 chars), created_at (timestamptz, indexed) }`. Table is append-only — no UPDATE or DELETE allowed (enforced by database trigger or app-level guard)
- Actions logged (exhaustive list):
- `changes` JSONB stores only changed fields: `{ "field_name": { "old": value, "new": value } }`. For creation: `old` is null. For deletion: `new` is null. Sensitive fields (password hash) stored as `"[REDACTED]"` in changes
- Retention: minimum 2 years (exceeds PDPL 1-year recommendation for safety margin). Older logs archived to cold storage (S3/equivalent), not deleted. Archival cron: monthly
- Immutability enforcement:
- Admin audit viewer at `/admin/audit-logs`: paginated table (50/page) with filters: actor (user search), action (dropdown), entity type, date range. Search by entity_id. Export to CSV for compliance audits
- Performance: `created_at` indexed for time-range queries. `actor_id` + `created_at` composite index for per-user queries. `entity_type` + `entity_id` composite index for per-entity history. Expected volume: ~10k rows/day at pilot scale
- Automated logging: implemented via NestJS interceptor (`AuditInterceptor`) that wraps service methods. Developers annotate service methods with `@Audited('action_name')` decorator — no manual log calls needed
- Depends on: every data-modifying service in the application
