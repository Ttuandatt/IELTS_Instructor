# US-READ-09 — Search and filter passages by difficulty, topic, or source

| Field | Value |
|-------|-------|
| **Feature** | Passage Search & Filter |
| **Domain** | Reading |

> As a learner, I want to search and filter passages by difficulty, topic, or source, so that I can find practice material matching my current level and interests.

## Acceptance Criteria

- AC1: Browse page route: `/reading`. Shows all published passages accessible to the learner
- AC2: Search bar: text input at top, placeholder "Tìm kiếm bài đọc…". Searches by passage `title` and `source` fields. Substring match (case-insensitive, `ILIKE %query%` in PostgreSQL). Minimum 2 characters to trigger search; debounce 300ms
- AC3: Filter chips (combinable, AND logic):
- AC4: Active filters shown as chips with "×" remove button. "Xóa bộ lọc" link clears all filters
- AC5: Sort options: "Mới nhất" (default, `created_at DESC`), "Cũ nhất", "Dễ → Khó", "Khó → Dễ"
- AC6: Results display: card grid (2 columns desktop, 1 column mobile). Each card shows: title, source badge, difficulty badge (color-coded: green/yellow/red), tag chips, question count, "Luyện tập" button
- AC7: Pagination: 12 passages per page (fits 2-column grid). Infinite scroll or "Xem thêm" button. API returns `{ items, total, hasMore }`
- AC8: Empty state (no results): "Không tìm thấy bài đọc phù hợp" with suggestion to clear filters
- AC9: Empty state (no passages at all): "Chưa có bài đọc nào. Giáo viên của bạn sẽ thêm bài đọc sớm!" (for classroom learners) or "Chưa có bài đọc công khai" (for self-study)
- AC10: Filter state reflected in URL query params (e.g., `?q=cambridge&difficulty=hard&type=tfng`) for bookmarking/sharing
- AC11: Response time: < 300ms for filtered queries (indexed on `status`, `difficulty`, `created_at`)
