# US-VOCAB-03 — Practice paraphrasing sentences (a key IELTS Writing skill)

| Field | Value |
|-------|-------|
| **Feature** | Paraphrasing Trainer |
| **Domain** | Vocabulary & Language Tools |

> As a learner, I want to practice paraphrasing sentences (a key IELTS Writing skill), so that I can improve my lexical range.

## Acceptance Criteria

- Paraphrasing page at `/vocabulary/paraphrase`. Entry: sidebar menu item under "Từ vựng" group
- Exercise flow:
- AI evaluation (Gemini API):
- "Thử lại" button: clears input, same sentence shown for another attempt
- "Câu tiếp theo" button: loads next random sentence
- Session stats: sentences practiced today, average score, improvement over time
- History: `/vocabulary/paraphrase/history` shows past attempts with original → paraphrase → score. Sortable by date, score
- Token cost: Gemini API call per evaluation, logged in scoring_logs. Rate limit: 20 evaluations per day (learner). Exceeds → "Bạn đã hết lượt luyện paraphrase hôm nay. Quay lại ngày mai!"
- Sentence pool: curated from passages in the platform. Admin can mark sentences as "suitable for paraphrasing" (optional curation). Fallback: random sentence selection from published passages
- Depends on: F-READ-05 (passage content as sentence source), F-WRIT-05 (Gemini API pattern)
