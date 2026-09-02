# US-LIST-04 — View my listening attempt history and scores

| Field | Value |
|-------|-------|
| **Feature** | Listening Score & History |
| **Domain** | Listening |

> As a learner, I want to view my listening attempt history and scores, so that I can track improvement.

## Acceptance Criteria

- AC1: History page at `/listening/history`. Table with columns: Test Title, Section (if single-section practice: "Section {n}", if full test: "Toàn bài"), Score (correct/total), Percentage, Date (DD/MM/YYYY HH:mm), Duration. Sorted by date DESC
- AC2: Click attempt row → review page showing: audio player (replay available for review), each question with learner's answer + correct answer + ✅/❌, transcript (if available) with relevant sections highlighted
- AC3: Filters: "Tất cả" / "Thi thử" (simulation) / "Luyện tập" (practice). Date range: "7 ngày" / "30 ngày" / "3 tháng" / "Tất cả"
- AC4: Score trend chart: line chart showing percentage score over time (consistent with reading trend). X-axis: attempt date. Y-axis: 0-100%. Data point: hover shows test title + score
- AC5: Per-section accuracy (if enough data, ≥ 3 attempts per section): bar chart showing average accuracy per section type (Part 1/2/3/4). Helps identify which section types need more practice
- AC6: Statistics summary: total attempts, average score, best score, most-practiced section, improvement trend (arrow ↑↓ vs previous 10 attempts)
- AC7: Empty state: "Chưa có bài nghe nào. Bắt đầu luyện tập!" with CTA → listening browse page
- AC8: Pagination: 20 per page
- AC9: Data included in: F-DASH-04 (radar chart — listening axis), F-COMP-04 (data export)
- AC10: Depends on: F-LIST-01 (practice scores), F-LIST-02 (simulation scores)
