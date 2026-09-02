# US-ENGAGE-03 — See a leaderboard for my classroom

| Field | Value |
|-------|-------|
| **Feature** | Classroom Leaderboard |
| **Domain** | Engagement & Gamification |

> As a learner, I want to see a leaderboard for my classroom, so that I'm motivated by friendly competition.

## Acceptance Criteria

- AC1: Leaderboard tab on classroom page: `/classrooms/{id}/leaderboard`. Only visible if instructor enables it (see below)
- AC2: Instructor toggle: classroom settings → "Bảng xếp hạng" toggle (default: OFF). When OFF, leaderboard tab hidden for all classroom members. When ON: visible to all members
- AC3: Scoring metric (configurable by instructor):
- AC4: Leaderboard display: ranked list (#1, #2, #3…). Each row: rank badge (🥇🥈🥉 for top 3), display name, score value, trend arrow (↑↓ vs previous week)
- AC5: Privacy protections:
- AC6: Time period: "Tuần này" / "Tháng này" / "Tất cả" toggle (default: "Tháng này")
- AC7: Tie-breaking: same score → earlier achiever ranked higher (first to reach that score)
- AC8: Empty states: < 3 students → "Cần ít nhất 3 học sinh để hiển thị bảng xếp hạng". Student with no submissions → not ranked (excluded, not shown as 0)
- AC9: No cross-classroom leaderboard (privacy). Each classroom has its own ranking
- AC10: Depends on: F-CLASS-01 (classroom), F-READ-03 (reading scores), F-WRIT-06 (writing scores)
