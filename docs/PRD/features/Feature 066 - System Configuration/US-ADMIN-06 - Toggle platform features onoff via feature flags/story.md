# US-ADMIN-06 — Toggle platform features on/off via feature flags

| Field | Value |
|-------|-------|
| **Feature** | System Configuration |
| **Domain** | Admin |

> As an admin, I want to toggle platform features on/off via feature flags, so that I can control the rollout during pilot and disable problematic features without deployment.

## Acceptance Criteria

- Configuration page at `/admin/config`. Requires `role=admin`
- Feature flags (toggle switches with description):
- System parameters (number/text inputs):
- Changes take effect immediately (no restart required). Feature flag values cached in Redis with 60-second TTL; API middleware checks flags before processing requests
- Audit log: every config change recorded: `{ admin_id, flag_name, old_value, new_value, timestamp }`. Viewable in "Lịch sử thay đổi" section
- Confirmation on critical flags: `maintenance_mode` ON → "Bật chế độ bảo trì sẽ chặn TẤT CẢ thao tác ghi. Tiếp tục?"
- API endpoint: `GET /api/config/flags` returns public feature flags (no secrets). Frontend checks flags to show/hide UI elements. Cached per session
