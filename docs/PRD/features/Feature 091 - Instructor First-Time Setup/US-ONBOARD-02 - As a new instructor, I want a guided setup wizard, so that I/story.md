# US-ONBOARD-02 — As a new instructor, I want a guided setup wizard, so that I

| Field | Value |
|-------|-------|
| **Feature** | Instructor First-Time Setup |
| **Domain** | Onboarding |

> As a new instructor, I want a guided setup wizard, so that I can create my first classroom and start assigning content quickly.

## Acceptance Criteria

- Wizard triggers on first login after instructor registration (detected by: `users.onboarding_completed = false` or `classrooms_count = 0 AND is_first_login = true`). Route: `/instructor/onboarding`
- Wizard is a multi-step flow (stepper UI with numbered steps at top, current step highlighted):
- "Bỏ qua" link available on every step (no forced completion). Skipping marks wizard as completed. Instructor can access all features regardless
- Back button on each step to go to previous step. Progress not lost when going back
- Wizard skippable entirely: "Tôi đã biết Langy — Bỏ qua hướng dẫn" link on step 1. Sets `onboarding_completed = true`
- Re-access: "Xem lại hướng dẫn" link in Settings → redirects to wizard. Can be re-run at any time (but doesn't reset data — existing classroom remains)
- Completion: after last step (or skip), redirect to instructor dashboard. One-time celebration toast: "Chào mừng đến Langy! 🎉" (emoji allowed in toast)
- Tracking: `users.onboarding_completed` boolean + `users.onboarding_completed_at` timestamp. Used in admin analytics (F-ADMIN-05): "% of instructors who completed onboarding"
- Depends on: F-AUTH-01 (registration), F-CLASS-01 (classroom creation), F-CLASS-02 (invite code)
