# US-DASH-06 — Compare individual student performance against the class ...

| Field | Value |
|-------|-------|
| **Feature** | Class Comparative Analytics |
| **Domain** | Dashboard & Analytics |

> As an instructor, I want to compare individual student performance against the class average, so that I can identify who needs extra support and who is excelling.

## Acceptance Criteria

- AC1: Route: `/instructor/classrooms/{id}/analytics`. Requires classroom owner or co-teacher
- AC2: Chart type: grouped bar chart. X-axis = students (display names, max 30 shown — paginated if more). Y-axis = selected metric value. Two bars per student: student value (colored) + class average (gray dashed line or translucent bar)
- AC3: Metric selector dropdown: "Writing Band (avg)", "Reading Accuracy (%)", "Submission Count", "Lesson Completion (%)". Default: Writing Band
- AC4: Sort options: "Most Improved" (largest positive Δ from first to last submission), "Lowest Score" (ascending), "Most Active" (by submission count DESC), "Name A-Z"
- AC5: Click student bar → popup with student details: name, email, recent submissions, average scores. "Xem chi tiết" link → student's full profile for this classroom
- AC6: Class average line: horizontal dashed line across the chart at the class average value. Label: "Trung bình lớp: {value}"
- AC7: Highlight: students below class average by > 1 band (writing) or > 20% (reading) shown in red; above average by > 1 band / > 20% shown in green; within range shown in default color
- AC8: Date range filter: "Tuần này", "Tháng này", "Tất cả"
- AC9: Minimum data: student must have at least 1 submission in the selected metric to appear. Students with no data shown at bottom with "—" value
- AC10: Export: "Xuất PNG" downloads chart as image. "Xuất CSV" downloads raw data
- AC11: Depends on: F-CLASS-07 (progress data)
