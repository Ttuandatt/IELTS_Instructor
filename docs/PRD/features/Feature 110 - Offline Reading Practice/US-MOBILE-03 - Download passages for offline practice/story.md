# US-MOBILE-03 — Download passages for offline practice

| Field | Value |
|-------|-------|
| **Feature** | Offline Reading Practice |
| **Domain** | Mobile & PWA |

> As a learner, I want to download passages for offline practice, so that I can study without internet (e.g., on commute).

## Acceptance Criteria

- AC1: Download button: "⬇️ Tải về" button on passage card (browse page) and passage detail page. Only available for HTML text passages (NOT PDF-only passages — PDFs too large for reliable caching)
- AC2: Download flow:
- AC3: Cached data: stored in Cache Storage (service worker API). Per-passage cache entry: `{ passage_id, title, content_html, questions_json, cached_at }`
- AC4: Offline mode behavior:
- AC5: Sync on reconnect: when device comes back online (detected via `navigator.onLine`), automatic sync:
- AC6: Downloaded passages page at `/reading/offline` (or section on browse page): "Bài đã tải" section showing all cached passages with: title, download date, size, "Xóa" button
- AC7: Storage management:
- AC8: Cache staleness: if passage is updated on server after download, next online visit shows: "Bài đọc đã được cập nhật. Tải lại?" with "Cập nhật" button
- AC9: Edge case: passage deleted on server while cached locally → learner can still practice offline. On sync attempt: server returns 404 → local cache marked as "Bài đọc không còn tồn tại" but practice data (answers) preserved in attempt history
- AC10: Depends on: F-MOBILE-02 (service worker infrastructure), F-READ-01 (reading test UI), F-READ-03 (grading on sync)
