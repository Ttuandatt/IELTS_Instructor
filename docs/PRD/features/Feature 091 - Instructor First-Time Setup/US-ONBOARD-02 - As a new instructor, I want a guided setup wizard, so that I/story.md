# US-ONBOARD-02 — As a new instructor, I want a guided setup wizard, so that I

| Field | Value |
|-------|-------|
| **Feature** | Instructor First-Time Setup |
| **Domain** | Onboarding |

> As a new instructor, I want a guided setup wizard, so that I can create my first classroom and start assigning content quickly.

## Acceptance Criteria

- AC1: Wizard triggers on first login after instructor registration (detected by: `users.onboarding_completed = false` or `classrooms_count = 0 AND is_first_login = true`). Route: `/instructor/onboarding`
- AC2: Wizard is a multi-step flow (stepper UI with numbered steps at top, current step highlighted):
- AC3: "Bỏ qua" link available on every step (no forced completion). Skipping marks wizard as completed. Instructor can access all features regardless
- AC4: Back button on each step to go to previous step. Progress not lost when going back
- AC5: Wizard skippable entirely: "Tôi đã biết Langy — Bỏ qua hướng dẫn" link on step 1. Sets `onboarding_completed = true`
- AC6: Re-access: "Xem lại hướng dẫn" link in Settings → redirects to wizard. Can be re-run at any time (but doesn't reset data — existing classroom remains)
- AC7: Completion: after last step (or skip), redirect to instructor dashboard. One-time celebration toast: "Chào mừng đến Langy! 🎉" (emoji allowed in toast)
- AC8: Tracking: `users.onboarding_completed` boolean + `users.onboarding_completed_at` timestamp. Used in admin analytics (F-ADMIN-05): "% of instructors who completed onboarding"
- AC9: Depends on: F-AUTH-01 (registration), F-CLASS-01 (classroom creation), F-CLASS-02 (invite code)
