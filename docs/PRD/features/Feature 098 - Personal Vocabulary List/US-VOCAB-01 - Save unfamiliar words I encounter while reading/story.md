# US-VOCAB-01 — Save unfamiliar words I encounter while reading

| Field | Value |
|-------|-------|
| **Feature** | Personal Vocabulary List |
| **Domain** | Vocabulary & Language Tools |

> As a learner, I want to save unfamiliar words I encounter while reading, so that I can review them later.

## Acceptance Criteria

- AC1: Save word flow (from reading test page, F-READ-10 dictionary tooltip):
- AC2: Vocabulary record: `{ id, user_id, word (lowercase, trimmed), definition (from dictionary API or manual edit), part_of_speech (noun/verb/adj/adv/etc.), phonetic_ipa (IPA pronunciation), example_sentence (auto-filled from passage context — the sentence containing the word), source_passage_id (nullable — link to reading passage where word was encountered), notes (user-editable, 0-500 chars), mastery_level (new/learning/known, default: new), next_review_date (DATE, for spaced repetition), review_count (int), created_at }`
- AC3: Vocabulary list page at `/vocabulary`:
- AC4: Manual add: "Thêm từ mới" button → modal: word (required), definition (required), part of speech (dropdown), example sentence (optional), notes (optional). Saves with `source_passage_id = null`
- AC5: Edit word: click word → edit modal with all fields editable. "Lưu" / "Hủy"
- AC6: Delete word: trash icon → confirmation "Xóa '{word}' khỏi danh sách?" → delete. No soft-delete (vocabulary is personal, low audit need)
- AC7: Pagination: 50 words per page. Total count shown: "Tổng: {n} từ"
- AC8: Max vocabulary list size: 5,000 words per user. Approaching limit (4,500+): warning "Bạn sắp đạt giới hạn 5.000 từ. Hãy xóa từ đã thuộc để thêm từ mới"
- AC9: Data export: vocabulary included in F-COMP-04 data export. Also standalone CSV export: "Xuất CSV" button → downloads `vocabulary_{date}.csv` with all fields
- AC10: Depends on: F-READ-10 (dictionary tooltip save trigger)
