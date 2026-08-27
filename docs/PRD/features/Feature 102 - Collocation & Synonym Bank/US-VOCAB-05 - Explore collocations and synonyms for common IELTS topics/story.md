# US-VOCAB-05 — Explore collocations and synonyms for common IELTS topics

| Field | Value |
|-------|-------|
| **Feature** | Collocation & Synonym Bank |
| **Domain** | Vocabulary & Language Tools |

> As a learner, I want to explore collocations and synonyms for common IELTS topics, so that I can expand my vocabulary range.

## Acceptance Criteria

- Collocation bank page at `/vocabulary/collocations`. Organized by IELTS topic (collapsible sections):
- Each topic section contains keyword entries. Each entry:
- Search: global search bar on page. Searches across all topics: keywords, collocations, and synonyms. Results highlighted with context. Debounced 300ms
- "Lưu vào từ vựng" button per keyword or collocation → saves to personal vocabulary list (F-VOCAB-01) with definition auto-filled from the bank entry
- Content source: pre-loaded database of ~500 entries across topics. Admin/instructor can add new entries via content management. Entries curated for IELTS relevance (not generic dictionary data)
- Content record: `{ id, topic, keyword, collocations (JSONB array), synonyms (JSONB array with formality), example_sentence, band_level (5-9), created_by, is_published }`
- Learner browsing: read-only. No editing of bank entries (only personal vocabulary is editable)
- Related prompts: each topic section shows "Đề viết liên quan" link → filters writing prompts by matching topic tag. Encourages practice using the vocabulary just learned
- Statistics: "Bạn đã lưu {n}/{total} từ trong chủ đề này" progress bar per topic
- Mobile: collocation chips wrap naturally. Example sentences expandable (collapsed by default on mobile to save space)
- Depends on: F-VOCAB-01 (save to personal list), F-WRIT-01 (writing prompts by topic for related prompts link)
