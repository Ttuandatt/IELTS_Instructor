# US-NOTIF-04 — As a user, I want notifications delivered in real-time witho

| Field | Value |
|-------|-------|
| **Feature** | Real-Time Updates (WebSocket) |
| **Domain** | Notifications |

> As a user, I want notifications delivered in real-time without refreshing the page, so that I see updates instantly while using the platform.

## Acceptance Criteria

- WebSocket connection: established on successful login/page load. Endpoint: `wss://{domain}/ws/notifications`. Authentication via JWT access token in connection handshake (query param or header)
- Auto-reconnect: if connection drops, client retries with exponential backoff (1s, 2s, 4s, 8s, max 30s). Visual indicator during reconnection: subtle "Đang kết nối lại…" in footer or near bell icon
- Events pushed via WebSocket:
- Event payload: `{ type: string, data: object, timestamp: ISO string }`. Data contains enough info for UI update without additional API call
- Fallback: if WebSocket connection fails after 3 reconnection attempts, fall back to long-polling with 30-second interval: `GET /api/notifications/poll?since={last_timestamp}`. Seamless to user — same UI behavior
- Server-side: WebSocket server (NestJS Gateway or Socket.IO). Each user subscribes to their own channel (`user:{user_id}`). Server pushes events to specific user channels
- Connection limit: max 5 concurrent WebSocket connections per user (multiple tabs). Excess connections gracefully closed with message "Quá nhiều kết nối đồng thời"
- Heartbeat: ping/pong every 30 seconds to keep connection alive. No response to 2 consecutive pings → close connection, trigger reconnect
- Security: WebSocket messages are read-only for client (no bidirectional data mutation via WS). All mutations still go through REST API
- Performance: WebSocket server handles up to 10,000 concurrent connections (pilot scale). Scale horizontally via Redis Pub/Sub for multi-server deployment
