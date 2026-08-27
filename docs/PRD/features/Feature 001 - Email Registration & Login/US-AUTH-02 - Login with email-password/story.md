# US-AUTH-02 — Login with email-password

| Field | Value |
|-------|-------|
| **PRD Ref** | US-102 |
| **Priority** | P0 |
| **Story Points** | 3 |

> As a user, I want to login with email/password, so that I can access my account.

## Acceptance Criteria

- Email field: required, trimmed, lowercased before lookup; max 255 chars
- Password field: required, max 72 chars; no format validation on login (only match check)
- Valid credentials: HTTP 200 with `{ accessToken, refreshToken, user: { id, email, displayName, role } }`; both tokens set as httpOnly secure cookies AND returned in response body (dual strategy for SSR + SPA)
- Invalid credentials (wrong email or wrong password): HTTP 401 with "Email hoặc mật khẩu không đúng" — identical message for both cases to prevent user enumeration
- Account locked/soft-deleted: HTTP 403 with "Tài khoản đã bị khóa, vui lòng liên hệ hỗ trợ"
- Submit button shows loading spinner during request; disabled to prevent double-submit
- "Quên mật khẩu?" link visible below password field, links to password reset flow (F-AUTH-05)
- Rate limit: max 10 login attempts per email per 15 minutes; exceeded → HTTP 429 with "Quá nhiều lần đăng nhập thất bại, vui lòng đợi 15 phút"; counter resets on successful login
- Successful login sets `lastLoginAt` timestamp on user record
- Redirect after login: to the URL stored in `?redirect=` query param if present and relative (no open redirect — must start with `/` and not `//`), otherwise to role-based dashboard
