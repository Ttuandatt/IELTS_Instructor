# US-ADMIN-01 — View and manage all users (search, change role, ban/unban)

| Field | Value |
|-------|-------|
| **Feature** | User Management |
| **Domain** | Admin |

> As an admin, I want to view and manage all users (search, change role, ban/unban), so that I can maintain platform integrity and handle support requests.

## Acceptance Criteria

- Admin user management at `/admin/users`. Requires `role=admin`; non-admin → 403 redirect
- User list: paginated table (50 per page) with columns: Avatar, Display Name, Email, Role (badge), Status (active/banned/soft_deleted), Registered Date, Last Login, Submissions Count
- Search: text input, searches by `display_name` and `email` (case-insensitive substring, debounced 300ms). Minimum 2 chars
- Filters: Role dropdown ("Tất cả" / "Learner" / "Instructor" / "Admin"), Status ("Tất cả" / "Active" / "Banned" / "Deleted")
- Sort: by name, email, registered date, last login, submissions count. Default: registered date DESC
- Click user row → user detail panel/page showing: profile info, classroom memberships, recent submissions (last 20), login history (last 10), role change history
- Change role: dropdown selector on user detail → confirmation modal "Đổi vai trò {name} từ {current} sang {new}?". Audit logged: `{ admin_id, user_id, old_role, new_role, timestamp, reason (optional text field in modal) }`
- Ban user: "Khóa tài khoản" button → confirmation with required reason field (5-500 chars, stored in audit log). Banned: user cannot login (JWT validation checks `status=banned` → 403), active sessions invalidated immediately. Banner shown on attempted login: "Tài khoản bị khóa. Lý do: {reason}. Liên hệ: {support_email}"
- Unban: "Mở khóa" button → confirmation → `status=active`. User can login again. Audit logged
- View user's submissions: link to filtered submission list (reading + writing) for that user. Admin can view any submission detail
- Admin cannot: delete user accounts directly (use F-AUTH-07 deletion flow), change own role to non-admin (prevent lockout)
- Performance: user list query indexed on `email`, `display_name`, `role`, `status`. Response < 500ms for 100k users
