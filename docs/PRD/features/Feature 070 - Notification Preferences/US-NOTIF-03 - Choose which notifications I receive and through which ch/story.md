# US-NOTIF-03 — Choose which notifications I receive and through which ch...

| Field | Value |
|-------|-------|
| **Feature** | Notification Preferences |
| **Domain** | Notifications |

> As a user, I want to choose which notifications I receive and through which channels, so that I'm not overwhelmed by notifications I don't care about.

## Acceptance Criteria

- Settings page: `/settings/notifications`. Requires authentication
- Preferences matrix: table with rows = notification types, columns = channels (In-App, Email). Each cell is a toggle switch
- Notification types (rows):
- Defaults (new users):
- In-App column: all toggles ON by default. Turning off in-app notification for a type means that type will not appear in bell dropdown at all. Warning if turning off critical type: "Bạn sẽ không nhận thông báo khi bài viết được chấm. Tiếp tục?"
- Email column: only toggleable if user email is verified (F-AUTH-04). Unverified → email toggles disabled with tooltip "Xác nhận email để nhận thông báo"
- Changes saved on toggle (auto-save, no submit button). Toast: "Đã lưu cài đặt thông báo"
- Preferences stored in `notification_preferences` table: `{ user_id, type, channel_in_app, channel_email }`. Default row created on user registration
- "Tắt tất cả email" master toggle at top of email column → turns off all email notifications with single click. Warning: "Tắt tất cả thông báo email?"
- API: `GET /api/notifications/preferences` returns current settings; `PATCH /api/notifications/preferences` updates. Response < 100ms
