# US-AUTH-03 — Auto-refresh session

| Field | Value |
|-------|-------|
| **PRD Ref** | US-103 |
| **Priority** | P0 |
| **Story Points** | 3 |

> As a user, I want my session to auto-refresh, so that I don't get logged out while actively using the app.

## Acceptance Criteria

- Access token: JWT signed with HS256 secret, expires in 15 minutes; payload contains `{ sub: userId, role, iat, exp }`
- Refresh token: opaque token (UUID v4) or JWT, expires in 7 days; stored server-side in Redis with association to user ID
- Frontend interceptor: when any API call returns 401, automatically attempt token refresh via `POST /api/auth/refresh` with the refresh token before retrying the original request; max 1 concurrent refresh attempt (queue other requests)
- Refresh endpoint: accepts refresh token in httpOnly cookie or request body; returns new access token + new refresh token (rotation); old refresh token invalidated immediately
- If refresh token is expired or invalid: HTTP 401 with `{ code: 'REFRESH_EXPIRED' }`; frontend clears all auth state, redirects to `/login` with toast "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
- Refresh token reuse detection: if a previously-invalidated refresh token is presented, revoke ALL refresh tokens for that user (potential token theft); log security event
- Token refresh response time: < 200ms p95
- On browser tab restore / app reopen: frontend checks access token expiry client-side; if expired or within 60s of expiry, trigger refresh immediately before any data fetch
