# US-AUTH-08 — Sign in with Google

| Field | Value |
|-------|-------|
| **Feature** | Social Login (Google) |
| **Domain** | Auth & Account |

> As a user, I want to sign in with Google, so that I can start using the app without creating a separate account.

## Acceptance Criteria

- AC1: "Đăng nhập bằng Google" button on login and registration pages; uses Google OAuth2 authorization code flow (not implicit)
- AC2: OAuth scopes requested: `openid`, `email`, `profile` — no unnecessary permissions
- AC3: On first-time Google login (no account with matching email): create new account with `authProvider: 'google'`, `emailVerified: true` (Google-verified); prompt role selection modal "Bạn là Giáo viên hay Học sinh?" before completing registration; display name pre-filled from Google profile `name` field; avatar URL set from Google profile picture
- AC4: On first-time Google login with existing email account (registered via email/password): link Google identity to existing account; merge — do not create duplicate; show toast "Tài khoản Google đã được liên kết với tài khoản hiện tại"
- AC5: On subsequent Google logins: skip role selection, redirect directly to role-based dashboard; issue JWT pair same as email login
- AC6: If Google OAuth flow is cancelled or fails: redirect back to login page with toast "Đăng nhập Google không thành công, vui lòng thử lại"
- AC7: State parameter included in OAuth request to prevent CSRF; validated on callback
- AC8: Google-only accounts (no password set): hide password change section on settings page; show "Đăng nhập bằng Google" badge instead; allow setting a password later via "Thêm mật khẩu" flow (sets password without requiring current password)
- AC9: If Google returns an email different from what was expected (edge case: user changed Google email): match by `googleId` (stored on user record), not by email
- AC10: Response time for complete OAuth flow (redirect → callback → JWT issued): < 3 seconds excluding Google's own latency
