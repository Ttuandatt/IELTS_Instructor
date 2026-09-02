# US-ONBOARD-03 — As a new learner, I want a guided flow to join my teacher's 

| Field | Value |
|-------|-------|
| **Feature** | Learner First-Time Setup |
| **Domain** | Onboarding |

> As a new learner, I want a guided flow to join my teacher's classroom or start self-study, so that I can begin practicing immediately.

## Acceptance Criteria

- AC1: Flow triggers on first login after learner registration (detected by: `users.onboarding_completed = false`). Route: `/onboarding`
- AC2: Step 1 — Path choice: "Bạn có mã lớp học không?" with two large buttons:
- AC3: **Step 2A — Classroom join:**
- AC4: **Step 2B — Self-study setup:**
- AC5: Quick-start prompts on dashboard (first 3 sessions or until dismissed):
- AC6: Empty-state messaging: every feature page (reading, writing, vocabulary, classrooms) has an encouraging empty state for new users, NOT just a blank page. Example reading: "Chưa có bài đọc nào. Bắt đầu luyện tập!" with CTA
- AC7: Tracking: same as instructor — `onboarding_completed` + `onboarding_completed_at`. Also track path chosen (`onboarding_path: "classroom" | "self_study"`) for analytics
- AC8: Learner who registers with invite code link (`/join/{code}`): skip step 1, go directly to step 2A with code pre-filled. Seamless experience from teacher's shared link
- AC9: Depends on: F-AUTH-01 (registration), F-CLASS-02 (join classroom), F-DASH-08 (target date)
