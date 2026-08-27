# US-CLASS-11 — Set due dates on lessons and have the system remind students

| Field | Value |
|-------|-------|
| **Feature** | Lesson Due Dates & Reminders |
| **Domain** | Classroom |

> As an instructor, I want to set due dates on lessons and have the system remind students, so that assignments are submitted on time.

## Acceptance Criteria

- `due_at` field on lesson: datetime picker in lesson edit form. Format displayed to learners: "Hạn nộp: DD/MM/YYYY lúc HH:mm" (Vietnam timezone, UTC+7)
- Validation: `due_at` must be in the future when creating/editing. Past date → "Hạn nộp phải là thời điểm trong tương lai". Setting `due_at = null` removes the deadline
- Lesson card (learner view): deadline shown as badge. Color coding:
- Reminder notification: 24 hours before `due_at`, system sends in-app notification to students who have NOT yet submitted for this lesson: "⏰ Bài '{lesson_title}' sắp hết hạn vào ngày mai lúc {time}". Batch processed by daily cron job at ~midnight + hourly check for approaching deadlines
- Overdue lessons: still accept submissions (no hard cutoff). Instructor can see "late" indicator on submission detail: "Nộp muộn {n} ngày" badge
- Instructor dashboard (F-DASH-02): section "Bài sắp đến hạn" showing lessons with `due_at` within next 7 days, with count of students who haven't submitted yet
- Calendar view (F-DASH-08): `due_at` dates shown as event dots on learner's study calendar
- Bulk set due dates: "Đặt hạn nộp hàng loạt" option — select multiple lessons → set relative deadline (e.g., "7 ngày sau khi xuất bản")
