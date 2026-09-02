# US-READ-01 — Practice a reading passage without time pressure

| Field | Value |
|-------|-------|
| **Feature** | Reading Test — Practice Mode |
| **Domain** | Reading |

> As a learner, I want to practice a reading passage without time pressure, so that I can focus on comprehension skills without the stress of a countdown.

## Acceptance Criteria

- AC1: Page route: `/reading/{passageId}` with `?mode=practice` (default). Requires authentication; unauthenticated → redirect to login
- AC2: Layout: split-view — passage rendered on the left panel (55% width), questions on the right panel (45% width). Panels separated by a draggable divider (resize handle)
- AC3: Passage panel: HTML content rendered via `dangerouslySetInnerHTML` inside `.passage-body` container. PDF passages rendered in iframe with `#toolbar=0&navpanes=0&scrollbar=0&view=FitH`. Both scrollable independently from question panel
- AC4: Question panel: questions grouped by `group_instruction` — each group shows instruction header (styled as `<div class="border-l-4 ...">`) followed by its questions. Groups separated by horizontal divider
- AC5: Supports all 13 IELTS question types: Multiple Choice (single), Multiple Choice (multi-select), True/False/Not Given, Yes/No/Not Given, Matching Headings, Matching Information, Matching Features, Matching Sentence Endings, Sentence Completion, Summary Completion (word list), Summary Completion (no word list), Short Answer, Diagram/Flow-chart/Table Completion
- AC6: No timer displayed in practice mode; no auto-submit; learner can leave and return (answers NOT persisted across sessions in practice — only submitted answers saved)
- AC7: Each question shows: question number (sequential across groups), stem text, input appropriate to type (radio buttons for MCQ single, checkboxes for MCQ multi, text input for fill-in, dropdown for matching)
- AC8: Text input answers: max 3 words by default (configurable per question via `max_words` field); character limit shown as hint "Không quá 3 từ". Input auto-trims whitespace
- AC9: Submit button: fixed at bottom of question panel; label "Nộp bài"; disabled until at least 1 question is answered. Click → confirmation modal "Bạn có chắc muốn nộp bài? Có {n} câu chưa trả lời." with "Nộp" (primary) and "Quay lại" (secondary)
- AC10: After submit: all inputs become read-only; each question shows ✓ (green) or ✗ (red) indicator; correct answer revealed below each question; overall score shown as banner: "{correct}/{total} câu đúng ({percentage}%)"
- AC11: Unanswered questions counted as incorrect (0 marks)
- AC12: Attempt saved to DB: `reading_attempts` table with `user_id`, `passage_id`, `score`, `total`, `answers` (JSON), `mode=practice`, `submitted_at`, `time_spent_seconds` (tracked via client-side timer from page load to submit)
- AC13: Mobile (< 768px): panels stack vertically — passage on top (collapsible), questions below. Toggle button "Xem bài đọc / Xem câu hỏi" switches between panels
