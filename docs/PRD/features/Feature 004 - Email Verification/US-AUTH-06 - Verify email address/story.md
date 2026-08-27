# US-AUTH-06 — Verify email address

| Field | Value |
|-------|-------|
| **PRD Ref** | FR-AUTH-003 (BỔ SUNG) |
| **Priority** | P1 |
| **Story Points** | 3 |

> As the system, I want to verify user email addresses, so that we prevent fake accounts and enable password recovery.

## Acceptance Criteria

- On registration: send verification email within 5 seconds with cryptographically random token (min 32 bytes, hex-encoded)
- Verification link: `{FRONTEND_URL}/verify-email?token={token}`; valid for 24 hours
- Valid token: set `emailVerified=true`, `emailVerifiedAt` timestamp; redirect to dashboard with toast "Email đã được xác nhận"
- Expired token: show "Link xác nhận đã hết hạn" with "Gửi lại link" button
- Invalid/used token: show "Link xác nhận không hợp lệ" (no distinction to prevent enumeration)
- Unverified accounts: can login, browse (read-only); persistent banner "Vui lòng xác nhận email của bạn"; CANNOT submit writing, CANNOT create classrooms
- Resend: rate limited 1/60s per user, max 5/24h; tokens stored hashed (SHA-256)
