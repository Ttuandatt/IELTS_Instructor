# US-CLASS-13 — Add a co-teacher or teaching assistant to my classroom

| Field | Value |
|-------|-------|
| **Feature** | Co-Teacher / TA Role |
| **Domain** | Classroom |

> As an instructor, I want to add a co-teacher or teaching assistant to my classroom, so that we can share the workload of content creation and grading.

## Acceptance Criteria

- Invite co-teacher: settings page → "Thêm đồng giáo viên" button → email input field. Email must belong to a registered user with `role=instructor`. Non-existent email → "Không tìm thấy giáo viên với email này". Learner email → "Người dùng này không phải giáo viên"
- Invitation flow: `POST /api/classrooms/{id}/co-teachers` with `{ email }`. Creates `classroom_members` record with `role=co_teacher`, `status=invited`. Invitee receives notification: "Giáo viên {owner_name} mời bạn làm đồng giáo viên cho lớp '{classroom_name}'" with "Chấp nhận" / "Từ chối" buttons
- Accept: invitee added as co-teacher. Classroom appears in their sidebar. Can create/edit lessons, review writing submissions, post announcements, view member list + progress
- Decline: invitation deleted. Owner notified: "{name} đã từ chối lời mời"
- Co-teacher permissions (CAN do): create/edit/delete lessons (own + shared), create/edit topics, post/edit/delete own announcements, review and release writing submissions, view member list + progress, access library, set due dates
- Co-teacher restrictions (CANNOT do): delete classroom, archive classroom, change classroom settings (name, writing_mode, invite code), remove the owner, remove other co-teachers, change billing
- Owner can revoke co-teacher: member list → "Xóa đồng giáo viên" button on co-teacher row → confirmation → removed. Co-teacher loses access immediately
- Max co-teachers per classroom: 5 (pilot limit). Exceeded → "Lớp chỉ được có tối đa 5 đồng giáo viên"
- Co-teacher badge: shown next to their name in member list and on their authored content. "Đồng GV" tag
- Transfer ownership: owner can transfer classroom ownership to a co-teacher. "Chuyển quyền quản lý" → confirmation → new owner gets full control, old owner becomes co-teacher
