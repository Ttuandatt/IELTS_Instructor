# US-CLASS-03 — See all members and remove a student if needed

| Field | Value |
|-------|-------|
| **Feature** | Member Management |
| **Domain** | Classroom |

> As an instructor, I want to see all members and remove a student if needed, so that I can manage my class roster.

## Acceptance Criteria

- AC1: Members tab at `/instructor/classrooms/{id}/members`. Requires classroom owner or co-teacher role
- AC2: Member list: table with columns: Avatar (initials), Display Name (clickable → student's submission history for this classroom), Email, Joined Date (DD/MM/YYYY), Submissions Count (reading + writing total), Last Active (relative time: "3 ngày trước" or "Chưa hoạt động")
- AC3: Sort: by name (A-Z/Z-A), join date, submissions count, last active. Default: name A-Z
- AC4: Search: text input above table, searches by name and email (substring, case-insensitive, debounced 300ms)
- AC5: Member count: shown in tab label "Thành viên ({count})"
- AC6: Remove member: trash icon on row → confirmation modal "Xóa {display_name} khỏi lớp? Họ sẽ mất quyền truy cập nội dung lớp. Các bài nộp của họ sẽ được giữ lại." with "Xóa" (red, destructive) and "Hủy"
- AC7: On removal: `classroom_members` record soft-deleted (`removed_at = now()`). Learner loses access immediately — classroom disappears from their sidebar. Learner's existing submissions remain in DB and are visible to instructor in review queue/history
- AC8: Removed learner receives notification: "Bạn đã bị xóa khỏi lớp {classroom_name}"
- AC9: Removed learner can rejoin with the same invite code (not permanently banned). To permanently ban: admin-level action (see F-ADMIN-01)
- AC10: Instructor cannot remove themselves. Cannot remove co-teachers (owner-only action)
- AC11: Export member list: "Xuất danh sách" button → CSV download with columns: Name, Email, Join Date, Submissions, Last Active
- AC12: Empty class: "Chưa có học sinh. Chia sẻ mã {CODE} để mời học sinh tham gia." with copy button
