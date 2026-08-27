# US-ONBOARD-01 — Select my role (learner or instructor) during registration

| Field | Value |
|-------|-------|
| **Feature** | Role Selection |
| **Domain** | Onboarding |

> As a new user, I want to select my role (learner or instructor) during registration, so that the platform shows me the right interface.

## Acceptance Criteria

- Registration form includes role selector as prominent card-based choice (not a small dropdown): two cards side by side — "Tôi là Giáo viên" (instructor icon, brief description: "Tạo lớp học, quản lý học sinh, chấm bài") and "Tôi là Học sinh" (learner icon, brief description: "Luyện tập IELTS, nộp bài, xem điểm"). One must be selected before form can be submitted
- Role determines:
- Role stored in `users.role` field (enum: `learner`, `instructor`, `admin`). Default: `learner` (if somehow bypassed without selection)
- Role changeable only by admin (F-ADMIN-01). No self-service role change. Reason: prevents learners from self-promoting to instructor to access features. Learner UI has no "become instructor" option
- If user selects instructor but behaves as learner (no classrooms, only takes tests): allowed. No forced re-classification. Instructors can use all learner features too
- Admin role: not selectable during registration. Only assignable by existing admin via F-ADMIN-01
- Post-registration: role selection cannot be changed by the user. If a user registers as the wrong role → contact support or admin changes it. Error message if user tries to access wrong-role pages: "Trang này dành cho {correct_role}"
