# US-ENGAGE-03 — See a leaderboard for my classroom

| Field | Value |
|-------|-------|
| **Feature** | Classroom Leaderboard |
| **Domain** | Engagement & Gamification |

> As a learner, I want to see a leaderboard for my classroom, so that I'm motivated by friendly competition.

## Acceptance Criteria

- Leaderboard tab on classroom page: `/classrooms/{id}/leaderboard`. Only visible if instructor enables it (see below)
- Instructor toggle: classroom settings → "Bảng xếp hạng" toggle (default: OFF). When OFF, leaderboard tab hidden for all classroom members. When ON: visible to all members
- Scoring metric (configurable by instructor):
- Leaderboard display: ranked list (#1, #2, #3…). Each row: rank badge (🥇🥈🥉 for top 3), display name, score value, trend arrow (↑↓ vs previous week)
- Privacy protections:
- Time period: "Tuần này" / "Tháng này" / "Tất cả" toggle (default: "Tháng này")
- Tie-breaking: same score → earlier achiever ranked higher (first to reach that score)
- Empty states: < 3 students → "Cần ít nhất 3 học sinh để hiển thị bảng xếp hạng". Student with no submissions → not ranked (excluded, not shown as 0)
- No cross-classroom leaderboard (privacy). Each classroom has its own ranking
- Depends on: F-CLASS-01 (classroom), F-READ-03 (reading scores), F-WRIT-06 (writing scores)
