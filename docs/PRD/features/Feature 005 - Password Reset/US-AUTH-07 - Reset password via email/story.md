# US-AUTH-07 — Reset password via email

| Field | Value |
|-------|-------|
| **PRD Ref** | FR-AUTH-005 (BỔ SUNG) |
| **Priority** | P1 |
| **Story Points** | 3 |

> As a user, I want to reset my password via email, so that I can regain access if I forget it.

## Acceptance Criteria

- Reset request at `/forgot-password`; single email field
- On submit (any email): HTTP 200 with "Nếu email này đã đăng ký, bạn sẽ nhận được link đặt lại mật khẩu" — identical response to prevent enumeration
- If email exists: send reset email within 5s; link with crypto token (32 bytes, hex); valid 1 hour, single-use
- Reset page validates token on load; expired → "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ"
- Reset form: new password + confirm; same validation as registration
- On success: password updated, ALL refresh tokens revoked; redirect to login with toast "Mật khẩu đã được đặt lại"
- Rate limit: 3 requests/email/hour, 10/IP/hour; same success message (no leak)
- Tokens stored hashed (SHA-256), constant-time comparison
