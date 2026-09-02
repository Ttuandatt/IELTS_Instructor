# US-CLASS-12 — Configure classroom settings (name, description, writing ...

| Field | Value |
|-------|-------|
| **Feature** | Classroom Settings |
| **Domain** | Classroom |

> As an instructor, I want to configure classroom settings (name, description, writing mode, invite code), so that I can adapt the environment to my teaching needs.

## Acceptance Criteria

- AC1: Settings page at `/instructor/classrooms/{id}/settings`. Requires classroom owner (co-teachers can view but not edit most settings)
- AC2: Editable fields:
- AC3: Invite code section: displays current code prominently with "📋 Sao chép" button. "Tạo mã mới" button → confirmation "Tạo mã mới sẽ vô hiệu hóa mã cũ. Học sinh dùng mã cũ sẽ không tham gia được." → generates new 6-char code
- AC4: Archive classroom: "Lưu trữ lớp học" button (destructive style, at bottom). Confirmation: "Lưu trữ lớp '{name}'? Học sinh sẽ mất quyền truy cập. Bạn có thể khôi phục lớp bất kỳ lúc nào."
- AC5: Danger zone: delete classroom (permanent). Only available after archiving. "Xóa vĩnh viễn" → confirmation with classroom name typed to confirm: "Nhập '{name}' để xác nhận xóa". Hard deletes classroom, topics, lessons. Submissions retained (orphaned, visible in student history but not linked to classroom)
- AC6: Auto-save: settings changes saved on blur/toggle (no explicit save button needed). Toast: "Đã lưu" on each auto-save
- AC7: Settings only visible to owner and co-teachers. Learners cannot access this page (sidebar doesn't show settings link for learner role)
