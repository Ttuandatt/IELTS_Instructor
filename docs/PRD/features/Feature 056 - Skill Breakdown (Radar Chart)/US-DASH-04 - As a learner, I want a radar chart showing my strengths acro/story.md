# US-DASH-04 — As a learner, I want a radar chart showing my strengths acro

| Field | Value |
|-------|-------|
| **Feature** | Skill Breakdown (Radar Chart) |
| **Domain** | Dashboard & Analytics |

> As a learner, I want a radar chart showing my strengths across all 4 IELTS skills, so that I know where to focus my practice.

## Acceptance Criteria

- Chart type: radar/spider chart with 4 axes: Reading, Writing, Listening, Speaking
- Axis values:
- "Last 10 attempts" basis: uses most recent 10 scores for each skill. If fewer than 10, uses all available. If zero → axis grayed out with "Chưa có dữ liệu"
- Chart displays: filled polygon with semi-transparent fill + solid border line
- Legend: below chart, shows each skill with its numeric value
- Hover/tap axis: tooltip shows exact value and recommendation: "Reading: 75% — Tập trung vào câu hỏi True/False/Not Given" (based on weakest question type from F-DASH-05)
- Empty state (no data for any skill): "Bắt đầu luyện tập để xem biểu đồ kỹ năng!" with links to each skill's practice page
- Responsive: radar chart scales with container. Minimum size: 250×250px. Below that → switch to simple bar chart
- Depends on: F-READ-03 (reading scores), F-WRIT-06 (writing scores), F-LIST-04 (listening scores), F-SPEAK-02 (speaking scores)
