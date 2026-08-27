# US-SEARCH-02 — Filter content by multiple criteria (type, tag, difficult...

| Field | Value |
|-------|-------|
| **Feature** | Advanced Filters |
| **Domain** | Search |

> As an instructor, I want to filter content by multiple criteria (type, tag, difficulty, date), so that I can find specific material in a large library.

## Acceptance Criteria

- Filter panel: collapsible sidebar on browse/library pages (`/reading/browse`, `/writing/prompts`, `/instructor/content`). Toggle: "Bộ lọc" button with filter icon. Panel slides in from left (desktop) or bottom sheet (mobile)
- Filter criteria:
- Filter logic: all criteria combined with AND (except within multi-select fields which use OR). Example: tags=[Environment OR Education] AND difficulty=Hard AND date_range=[last 3 months]
- Active filter display: horizontal bar of chips above results showing active filters. Each chip: filter label + "×" to remove. "Xóa bộ lọc" link to reset all
- Filter state in URL: query parameters encode all active filters. Example: `?type=passage&tags=environment,education&difficulty=hard&from=2026-06-01`. Shareable and bookmarkable. Browser back/forward preserves filter state
- Results: filtered content list below filter bar. Sort dropdown: "Mới nhất" (default), "Cũ nhất", "Tên A-Z", "Phổ biến nhất" (by submission count). Pagination: 20 per page
- Result count: "{n} kết quả" shown above results. Updates live as filters change
- Empty filtered results: "Không có nội dung phù hợp với bộ lọc. Thử thay đổi điều kiện lọc" with "Xóa bộ lọc" button
- Performance: filter queries use indexed columns. Combined query with proper JOIN strategy — avoid N+1. Response < 500ms for 10,000 content items
- Depends on: F-SEARCH-01 (can be combined — search within filtered results), F-READ-05 (passage data), F-WRIT-01 (prompt data)
