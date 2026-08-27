# US-INT-03 — Receive webhook events for key actions (submission scored...

| Field | Value |
|-------|-------|
| **Feature** | Webhook Notifications |
| **Domain** | Integration |

> As a developer/admin, I want to receive webhook events for key actions (submission scored, student joined), so that I can integrate Langy with other tools.

## Acceptance Criteria

- Webhook management at `/admin/settings/webhooks` (admin only) and `/instructor/settings/webhooks` (instructor — scoped to their classrooms only)
- Register webhook form:
- Webhook delivery:
- Retry logic: on failure (timeout, 5xx response, network error):
- Signature verification (recipient side): recipient computes `HMAC-SHA256(raw_request_body, webhook_secret)` and compares with `X-Webhook-Signature` header. Mismatch → reject (potential tampered or spoofed request). Documentation provided for verification in Node.js, Python, Go
- Delivery log: admin/instructor can view webhook delivery history at `/settings/webhooks/{id}/log`. Table: event type, delivery time, HTTP status code, response time, status (delivered/failed/pending). Last 100 deliveries shown. Click → expand to see full request payload + response body (truncated to 1KB)
- Test webhook: "Gửi test" button → sends a test event (`test.ping`) to the registered URL with sample payload. Response shown in UI: status code, response body, latency. Useful for debugging integration
- Webhook management: edit URL/events, regenerate secret, toggle active/inactive (pause without deleting), delete webhook (confirmation required)
- Security:
- Rate limit: max 1000 webhook deliveries per hour per user (across all registered webhooks). Exceeded → events queued and delivered when rate allows
- Webhook record: `{ id, user_id, url, events (JSONB array), secret_hash, description, is_active, created_at, updated_at }`
- Depends on: all event-producing services (scoring, classroom, auth) must emit events to webhook dispatcher
