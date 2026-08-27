# US-COMP-05 — Rate-limit API endpoints

| Field | Value |
|-------|-------|
| **Feature** | Rate Limiting & Abuse Prevention |
| **Domain** | Compliance & Security |

> As the system, I want to rate-limit API endpoints, so that abuse and cost spikes are prevented.

## Acceptance Criteria

- Rate limiting implemented via NestJS `ThrottlerModule` with Redis-backed store (consistent across multiple server instances). Key pattern: `throttle:{scope}:{identifier}`
- Rate limit tiers:
- Response headers on all rate-limited endpoints:
- 429 response body: `{ statusCode: 429, message: "Quá nhiều yêu cầu. Thử lại sau {seconds} giây", retryAfter: {seconds} }`. `Retry-After` header also set
- Rate limit bypass: admin role exempt from most rate limits (except AI scoring — even admins don't need unlimited). Configurable via F-ADMIN-06 flags
- IP-based limits use `X-Forwarded-For` header (behind reverse proxy). Validate: reject requests with > 10 forwarded IPs (potential spoofing)
- Monitoring: rate limit hits logged as warning-level events with: endpoint, identifier, limit tier, current count. Admin health dashboard (F-ADMIN-04) shows rate limit hit frequency
- DDoS: application-level rate limiting is NOT a DDoS solution. Rely on CDN/reverse proxy (Cloudflare, nginx) for network-level protection. Document this in ops runbook
