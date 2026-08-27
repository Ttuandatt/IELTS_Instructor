# US-AUTH-05 — Change password

| Field | Value |
|-------|-------|
| **PRD Ref** | US-104 (extended) |
| **Priority** | P1 |
| **Story Points** | 2 |

> As a user, I want to change my password, so that I can maintain account security.

## Acceptance Criteria

- Password change form at `/settings/security`; requires authentication
- Current password field: required; verified server-side against stored bcrypt hash before accepting change
- Wrong current password: HTTP 403 with "Mật khẩu hiện tại không đúng"
- New password field: required, same validation as registration (min 8, max 72, 1 upper, 1 lower, 1 digit); must differ from current password — "Mật khẩu mới phải khác mật khẩu hiện tại"
- Confirm password field: required, must exactly match new password; on mismatch show "Mật khẩu xác nhận không khớp"
- On success: HTTP 200, all existing refresh tokens for this user revoked (forces re-login on other devices); current session gets new token pair; toast "Đã đổi mật khẩu thành công"
- Rate limit: max 5 password change attempts per user per hour; exceeded → HTTP 429
- Password change logged in audit trail with timestamp and IP (no password values logged)
