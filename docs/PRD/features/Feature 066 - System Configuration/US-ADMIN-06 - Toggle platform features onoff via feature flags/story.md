# US-ADMIN-06 — Toggle platform features on/off via feature flags

| Field | Value |
|-------|-------|
| **Feature** | System Configuration |
| **Domain** | Admin |

> As an admin, I want to toggle platform features on/off via feature flags, so that I can control the rollout during pilot and disable problematic features without deployment.

## Acceptance Criteria

- AC1: Configuration page at `/admin/config`. Requires `role=admin`
- AC2: Feature flags (toggle switches with description):
- AC3: System parameters (number/text inputs):
- AC4: Changes take effect immediately (no restart required). Feature flag values cached in Redis with 60-second TTL; API middleware checks flags before processing requests
- AC5: Audit log: every config change recorded: `{ admin_id, flag_name, old_value, new_value, timestamp }`. Viewable in "Lịch sử thay đổi" section
- AC6: Confirmation on critical flags: `maintenance_mode` ON → "Bật chế độ bảo trì sẽ chặn TẤT CẢ thao tác ghi. Tiếp tục?"
- AC7: API endpoint: `GET /api/config/flags` returns public feature flags (no secrets). Frontend checks flags to show/hide UI elements. Cached per session
