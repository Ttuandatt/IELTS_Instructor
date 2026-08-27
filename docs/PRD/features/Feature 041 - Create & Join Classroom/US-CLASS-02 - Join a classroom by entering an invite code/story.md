# US-CLASS-02 — Join a classroom by entering an invite code

| Field | Value |
|-------|-------|
| **Feature** | Create & Join Classroom |
| **Domain** | Classroom |

> As a learner, I want to join a classroom by entering an invite code, so that I can access my teacher's lessons and assignments.

## Acceptance Criteria

- Join page at `/classrooms/join`. Also accessible from sidebar "➕ Tham gia lớp học" button
- Input: single text field for invite code, 6 chars, auto-uppercase on input. Submit button "Tham gia"
- On valid code: show confirmation modal — "Bạn muốn tham gia lớp '{classroom_name}' của giáo viên {instructor_name}?" with "Tham gia" (primary) and "Hủy" (secondary). This prevents accidental joins
- On join success: learner added to `classroom_members` table with `{ classroom_id, user_id, role: 'learner', joined_at }`. Redirect to classroom page. Toast: "Đã tham gia lớp '{name}'!". Classroom appears in learner's sidebar immediately
- Invalid code (no classroom found): "Mã lớp không hợp lệ. Vui lòng kiểm tra lại" — no info about whether code existed before
- Already a member: "Bạn đã tham gia lớp này rồi" with link to existing classroom. No duplicate `classroom_members` record created
- Archived classroom: "Lớp học này đã được lưu trữ" — cannot join
- A learner can belong to multiple classrooms (no limit during pilot). All classrooms shown in sidebar grouped under "Lớp học của tôi"
- Instructor is notified when a new learner joins: in-app notification "Học sinh {display_name} đã tham gia lớp {classroom_name}"
- Rate limit: max 10 join attempts per user per hour (prevent brute-force code guessing). Exceeded → "Bạn đã thử quá nhiều lần"
