# US-READ-11 — Click any word in an HTML passage to see its definition a...

| Field | Value |
|-------|-------|
| **Feature** | Clickable Dictionary / Glossary |
| **Domain** | Reading |

> As a learner, I want to click any word in an HTML passage to see its definition and pronunciation, so that I can build vocabulary while reading without leaving the test page.

## Acceptance Criteria

- AC1: Activation: double-click (desktop) or long-press 500ms (mobile) on any word within `.passage-body` container. Single-click does NOT trigger (would interfere with text selection)
- AC2: Word extraction: selected text cleaned — strip punctuation, lowercase, take first word if multi-word selection. Max word length: 45 chars (longest English words)
- AC3: Tooltip popup: positioned near the clicked word (above or below depending on viewport space). Contains:
- AC4: Dictionary source: bundled offline dictionary (English-Vietnamese, ~50k entries). No external API call required. Lookup time: < 50ms
- AC5: Word not found in dictionary: tooltip shows "Không tìm thấy nghĩa của '{word}'" with "Tìm trên Google" link (opens new tab with `https://www.google.com/search?q=define+{word}`)
- AC6: "Lưu từ vựng" behavior: saves `{ word, definition, example, source_passage_id, saved_at }` to user's vocabulary list. If already saved → button shows "Đã lưu ✓" (disabled, green). Toast: "Đã lưu '{word}' vào danh sách từ vựng"
- AC7: Only available for HTML-rendered passages. PDF passages (iframe) cannot support text interaction → show info tooltip on first load: "Tra từ không khả dụng cho bài dạng PDF"
- AC8: Tooltip dismissal: click outside, press Escape, scroll passage, or open another word lookup
- AC9: Accessibility: tooltip has `role="tooltip"`, is keyboard-focusable (Tab into tooltip, Enter to save), Escape to close
- AC10: Performance: dictionary loaded lazily on first word click (not on page load). Bundle size: < 2MB compressed
- AC11: Depends on: F-VOCAB-01 (vocabulary list storage)
