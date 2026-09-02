# US-AUTH-01 — Register with email and password

| Field | Value |
|-------|-------|
| **Feature** | Email Registration & Login |
| **Domain** | Auth & Account |

> As a learner/instructor, I want to register with email and password, so that I can access the platform.

## Acceptance Criteria

- AC1: Email field: required, max 255 chars, validated against RFC 5322 simplified pattern (`^[^\s@]+@[^\s@]+\.[^\s@]+$`); on invalid format show "Email không hợp lệ"
- AC2: Email uniqueness: checked server-side (case-insensitive, trimmed, lowercased before storage); duplicate shows "Email này đã được đăng ký"
- AC3: Password field: required, min 8 chars, max 72 chars (bcrypt limit), must contain at least 1 uppercase letter, 1 lowercase letter, and 1 digit; on violation show "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số"
- AC4: Password stored as bcrypt hash with cost factor 10; plaintext never logged or returned in any API response
- AC5: Registration form includes role selector (see F-ONBOARD-01 US-ONBOARD-01); role stored as enum `learner | instructor` on the user record
- AC6: Display name field: required, min 2 chars, max 50 chars, trimmed; on violation show "Tên hiển thị phải từ 2 đến 50 ký tự"
- AC7: Submit button disabled while any field is invalid or while request is in-flight (shows spinner); prevents double-submit
- AC8: On success: HTTP 201 with JWT pair (access + refresh), user redirected to role-appropriate dashboard (learner → `/dashboard`, instructor → `/instructor/dashboard`)
- AC9: On server error (5xx): show "Đã có lỗi xảy ra, vui lòng thử lại" with retry option; do not clear form fields
- AC10: Rate limit: max 5 registration attempts per IP per 15 minutes; exceeded → HTTP 429 with "Bạn đã thử quá nhiều lần, vui lòng đợi 15 phút"
- AC11: All input fields sanitized server-side (strip HTML tags) to prevent stored XSS
