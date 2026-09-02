# US-NOTIF-03 — Choose which notifications I receive and through which ch...

| Field | Value |
|-------|-------|
| **Feature** | Notification Preferences |
| **Domain** | Notifications |

> As a user, I want to choose which notifications I receive and through which channels, so that I'm not overwhelmed by notifications I don't care about.

## Acceptance Criteria

- AC1: Settings page: `/settings/notifications`. Requires authentication
- AC2: Preferences matrix: table with rows = notification types, columns = channels (In-App, Email). Each cell is a toggle switch
- AC3: Notification types (rows):
- AC4: Defaults (new users):
- AC5: In-App column: all toggles ON by default. Turning off in-app notification for a type means that type will not appear in bell dropdown at all. Warning if turning off critical type: "Bạn sẽ không nhận thông báo khi bài viết được chấm. Tiếp tục?"
- AC6: Email column: only toggleable if user email is verified (F-AUTH-04). Unverified → email toggles disabled with tooltip "Xác nhận email để nhận thông báo"
- AC7: Changes saved on toggle (auto-save, no submit button). Toast: "Đã lưu cài đặt thông báo"
- AC8: Preferences stored in `notification_preferences` table: `{ user_id, type, channel_in_app, channel_email }`. Default row created on user registration
- AC9: "Tắt tất cả email" master toggle at top of email column → turns off all email notifications with single click. Warning: "Tắt tất cả thông báo email?"
- AC10: API: `GET /api/notifications/preferences` returns current settings; `PATCH /api/notifications/preferences` updates. Response < 100ms
