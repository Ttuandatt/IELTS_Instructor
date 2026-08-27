# US-DASH-05 — See my accuracy per reading question type (T/F/NG, matchi...

| Field | Value |
|-------|-------|
| **Feature** | Question-Type Accuracy Breakdown |
| **Domain** | Dashboard & Analytics |

> As a learner, I want to see my accuracy per reading question type (T/F/NG, matching, MCQ, etc.), so that I know which types I struggle with and should drill.

## Acceptance Criteria

- Chart location: reading analytics section at `/dashboard/analytics/reading` or expandable section on dashboard
- Chart type: horizontal bar chart. One bar per question type (up to 13 bars). Bar length = accuracy %. Label: type name (Vietnamese) + accuracy + attempt count
- Color coding per bar:
- Data source: `question_type_stats` aggregation. Each bar = `total_correct / total_attempted × 100%` for that type
- Minimum attempt threshold: 5 questions per type before showing accuracy. Fewer → bar shown as gray with "Chưa đủ dữ liệu ({n}/5 câu)"
- Hover/tap bar: tooltip with "Đúng: {correct}/{total} ({percentage}%) — {n} bài đọc". Click bar → navigates to targeted practice for that type (F-READ-09), pre-selecting the type filter
- Sort options: "Theo thứ tự" (alphabetical), "Thấp → Cao" (weakest first, default — highlights areas to improve), "Cao → Thấp"
- Date range filter: same as F-DASH-03 (7d / 30d / 3m / all)
- Recommendation section below chart: "Nên tập trung vào:" lists top 3 weakest types (< 60% accuracy) with "Luyện tập" button for each
- Empty state (no reading attempts): "Hoàn thành bài đọc để xem phân tích theo loại câu hỏi" with CTA → reading browse
- Depends on: F-READ-04 (grading tracks per-type results), F-READ-09 (targeted practice link)
