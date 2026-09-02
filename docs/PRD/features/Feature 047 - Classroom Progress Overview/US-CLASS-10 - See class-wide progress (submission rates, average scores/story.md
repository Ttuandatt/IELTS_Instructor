# US-CLASS-10 — See class-wide progress (submission rates, average scores...

| Field | Value |
|-------|-------|
| **Feature** | Classroom Progress Overview |
| **Domain** | Classroom |

> As an instructor, I want to see class-wide progress (submission rates, average scores, inactive students), so that I can identify who needs help and who is falling behind.

## Acceptance Criteria

- AC1: Progress tab at `/instructor/classrooms/{id}/progress`. Requires classroom owner or co-teacher
- AC2: Summary cards at top:
- AC3: Student progress table: one row per student. Columns:
- AC4: Inactive students highlighted: rows with 🔴 shown with light red background. Sortable to bring inactive students to top
- AC5: Sort by any column; default: inactive first, then by name
- AC6: "Nhắc nhở" button per student row → sends nudge notification: "Giáo viên {name} nhắc bạn nộp bài!" (rate limited: max 1 nudge per student per day)
- AC7: Export: "Xuất báo cáo CSV" button → downloads CSV with all columns. Filename: `{classroom_name}_progress_{date}.csv`
- AC8: Date range filter: restrict progress data to a time range (e.g., "Tuần này", "Tháng này", "Tất cả")
- AC9: Empty state (no students): "Lớp chưa có học sinh. Chia sẻ mã lớp để mời!"
- AC10: Performance: progress data precomputed/cached, refreshed every 15 minutes. Manual refresh button "🔄" forces recalculation (rate limited: 1/min)
- AC11: Depends on: F-READ-03 (reading scores), F-WRIT-06 (writing scores), F-CLASS-04 (lesson completion)
