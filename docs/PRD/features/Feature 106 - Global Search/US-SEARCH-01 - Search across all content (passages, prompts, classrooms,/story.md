# US-SEARCH-01 — Search across all content (passages, prompts, classrooms,...

| Field | Value |
|-------|-------|
| **Feature** | Global Search |
| **Domain** | Search |

> As a user, I want to search across all content (passages, prompts, classrooms, lessons) from one search bar, so that I can find anything quickly.

## Acceptance Criteria

- AC1: Search trigger: `Ctrl+K` (Windows) / `Cmd+K` (macOS) keyboard shortcut opens search overlay modal. Also accessible via search icon (🔍) in navbar header. Overlay: centered modal with large text input, backdrop blur
- AC2: Input behavior: auto-focused on open. Debounced search: 300ms after last keystroke → triggers API call. Minimum 2 characters to trigger search. Empty input → show recent searches (last 5, stored in localStorage)
- AC3: Results displayed in grouped sections (order of relevance):
- AC4: Each result item: type icon (📖📝🏫📚), title (search term highlighted in bold), snippet (max 120 chars with `...` truncation), secondary info (e.g., passage → status badge, classroom → member count)
- AC5: Keyboard navigation: ↑↓ arrows move selection highlight through results. Enter opens selected item. Escape closes overlay
- AC6: Click result → navigate to item's page. Overlay closes. Recent search term stored in localStorage (max 10, FIFO)
- AC7: Access control:
- AC8: Search implementation: PostgreSQL full-text search using `tsvector` columns on `passages.title`, `passages.content`, `prompts.title`, `prompts.prompt_text`, `classrooms.name`, `lessons.title`. `ts_rank` for relevance scoring. Language config: `english` (content is English despite UI being Vietnamese)
- AC9: Performance: search API response < 300ms for up to 10,000 content items. Index: GIN index on tsvector columns. If scale grows: consider pg_trgm extension for fuzzy/partial matching
- AC10: No search results: "Không tìm thấy kết quả cho '{query}'" with suggestions: "Thử tìm với từ khóa khác" or "Kiểm tra chính tả"
- AC11: Search analytics: log search queries (anonymized: query text + result count + clicked result, without user_id) for improving content discoverability. Admin analytics (F-ADMIN-05): "Top 10 tìm kiếm phổ biến", "Tìm kiếm không có kết quả"
- AC12: API: `GET /api/search?q={query}&types=passage,prompt,classroom,lesson&limit=20`. Response: `{ results: [{ type, id, title, snippet, score }], total_per_type: { passage: n, prompt: n, ... } }`
- AC13: Depends on: F-READ-05 (passages), F-WRIT-01 (prompts), F-CLASS-01 (classrooms), F-CLASS-05 (lessons)
