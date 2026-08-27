# US-INT-01 — Import my Google Classroom roster into Langy

| Field | Value |
|-------|-------|
| **Feature** | Google Classroom Sync |
| **Domain** | Integration |

> As an instructor, I want to import my Google Classroom roster into Langy, so that I don't have to manually share invite codes.

## Acceptance Criteria

- Connect flow: Settings → "Kết nối" section → "Google Classroom" card with "Kết nối" button → initiates Google OAuth2 flow
- OAuth2 scopes requested:
- After OAuth2 consent: "Chọn lớp Google Classroom" page showing instructor's Google Classroom courses as a list. Each course: name, section, student count. Checkbox to select which course(s) to import
- Import flow per selected course:
- Mapping: Google Classroom course → Langy classroom. Instructor selects which Langy classroom to import into (existing) or "Tạo lớp mới từ Google Classroom" (creates new Langy classroom with Google Classroom course name)
- One-time import (v1): sync is a manual action, NOT continuous. Instructor clicks "Đồng bộ lại" to re-import (adds new students, skips existing). No auto-sync on Google Classroom roster changes
- Future: continuous sync via Google Classroom API push notifications (post-v1)
- Token storage: Google OAuth2 refresh token stored encrypted in DB (`user_integrations` table: `{ user_id, provider, access_token_encrypted, refresh_token_encrypted, scopes, expires_at, connected_at }`). Auto-refresh access token on expiry
- Disconnect: "Ngắt kết nối Google Classroom" button → revokes token, deletes integration record. Students already imported remain in Langy classroom (no cascade removal)
- Error handling:
- Privacy: only email and display name imported from Google. No grades, no Google Classroom assignments, no files imported. Consent: instructor accepts during OAuth2 flow
- Depends on: F-AUTH-05 (Google OAuth2 infrastructure reused), F-CLASS-01 (Langy classroom), F-CLASS-02 (member management), F-NOTIF-02 (invitation emails)
