# US-AUTH-04 — Update display name and avatar

| Field | Value |
|-------|-------|
| **PRD Ref** | US-104 |
| **Priority** | P0 |
| **Story Points** | 2 |

> As a user, I want to update my display name and avatar, so that my profile reflects who I am.

## Acceptance Criteria

- Settings page accessible at `/settings/profile`; requires authentication (redirect to login if not authenticated)
- Display name field: required, min 2 chars, max 50 chars, trimmed; on violation show "Tên hiển thị phải từ 2 đến 50 ký tự"
- Display name sanitized server-side: strip HTML tags, no script injection
- Avatar: accepts URL input (max 500 chars, must match `^https?://`) OR file upload (JPEG/PNG/WebP, max 2MB); on invalid format show "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP, tối đa 2MB"
- Avatar upload: resized server-side to 200x200px, stored in uploads directory; old avatar file deleted on replacement
- Save button disabled when no changes detected; shows loading spinner during save
- On success: HTTP 200, toast "Đã lưu thay đổi"; updated display name reflected immediately in navbar without page refresh
- On validation error: HTTP 400 with field-level error messages; form fields retain their values
- Empty state: if no avatar set, show initials-based placeholder (first letter of display name, colored background based on user ID hash)
