# US-LIST-05 — Practice individual listening sections (Part 1/2/3/4) sep...

| Field | Value |
|-------|-------|
| **Feature** | Section-Level Practice |
| **Domain** | Listening |

> As a learner, I want to practice individual listening sections (Part 1/2/3/4) separately, so that I can focus on specific difficulty levels.

## Acceptance Criteria

- Listening browse page at `/listening`. Shows available listening exercises with filter tabs: "Tất cả" / "Part 1" / "Part 2" / "Part 3" / "Part 4" / "Thi thử (đầy đủ)"
- Each section type explained (first visit tooltip or permanent label):
- Content card per exercise: title, section type badge (colored: Part 1 green, Part 2 blue, Part 3 orange, Part 4 red), duration (~5-8 min), question count, "Đã làm ✓" indicator if previously attempted, best score if attempted
- Click card → practice mode (F-LIST-01) for that specific section
- Individual sections extracted from full tests: a 4-section test also appears as 4 separate section-level practices. Instructor can also create standalone single-section exercises
- Section-level accuracy tracked in analytics (F-LIST-04): per-section-type accuracy over time. Displayed in dashboard (if listening analytics built): "Part 1: {avg}% | Part 2: {avg}% | Part 3: {avg}% | Part 4: {avg}%"
- Recommendation: if accuracy for a section type is < 60% over last 5 attempts → "Nên luyện thêm Part {n}" badge on that tab in browse page
- Sort on browse page: "Mới nhất" (default), "Phổ biến nhất" (by attempt count), "Chưa làm" (unattempted first)
- Empty state per section type: "Chưa có bài nghe Part {n}. Hãy liên hệ giáo viên để thêm nội dung" (for classroom learners) or "Chưa có nội dung" (for self-study)
- Depends on: F-LIST-01 (practice mode), F-LIST-03 (content with section_type metadata), F-LIST-04 (per-section accuracy)
