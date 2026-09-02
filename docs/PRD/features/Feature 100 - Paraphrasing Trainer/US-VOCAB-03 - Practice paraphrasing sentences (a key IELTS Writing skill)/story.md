# US-VOCAB-03 — Practice paraphrasing sentences (a key IELTS Writing skill)

| Field | Value |
|-------|-------|
| **Feature** | Paraphrasing Trainer |
| **Domain** | Vocabulary & Language Tools |

> As a learner, I want to practice paraphrasing sentences (a key IELTS Writing skill), so that I can improve my lexical range.

## Acceptance Criteria

- AC1: Paraphrasing page at `/vocabulary/paraphrase`. Entry: sidebar menu item under "Từ vựng" group
- AC2: Exercise flow:
- AC3: AI evaluation (Gemini API):
- AC4: "Thử lại" button: clears input, same sentence shown for another attempt
- AC5: "Câu tiếp theo" button: loads next random sentence
- AC6: Session stats: sentences practiced today, average score, improvement over time
- AC7: History: `/vocabulary/paraphrase/history` shows past attempts with original → paraphrase → score. Sortable by date, score
- AC8: Token cost: Gemini API call per evaluation, logged in scoring_logs. Rate limit: 20 evaluations per day (learner). Exceeds → "Bạn đã hết lượt luyện paraphrase hôm nay. Quay lại ngày mai!"
- AC9: Sentence pool: curated from passages in the platform. Admin can mark sentences as "suitable for paraphrasing" (optional curation). Fallback: random sentence selection from published passages
- AC10: Depends on: F-READ-05 (passage content as sentence source), F-WRIT-05 (Gemini API pattern)
