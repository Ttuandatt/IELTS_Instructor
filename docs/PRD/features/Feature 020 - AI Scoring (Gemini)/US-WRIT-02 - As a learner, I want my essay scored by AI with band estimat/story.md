# US-WRIT-02 — As a learner, I want my essay scored by AI with band estimat

| Field | Value |
|-------|-------|
| **Feature** | AI Scoring (Gemini) |
| **Domain** | Writing |

> As a learner, I want my essay scored by AI with band estimates and detailed feedback per criterion, so that I understand specifically what to improve.

## Acceptance Criteria

- Scoring triggered automatically when submission state → `submitted`. Job queued in BullMQ `scoring` queue with `{ submissionId, promptId, essayContent, taskType }`
- Gemini model selection: `gemini-2.5-flash` (cheap tier, ~120đ/essay) by default. Premium tier uses `gemini-2.5-pro` (~1200đ/essay) — selected per-classroom setting or user subscription level
- Scoring prompt includes: essay text (no PII — no user name/email), task type (1 or 2), the writing prompt text, rubric description for each criterion. `prompt_version` field tracks template version (e.g., "v3.2")
- AI returns structured JSON (Gemini structured output mode):
- Band values: float in range 0.0–9.0, in 0.5 increments (e.g., 5.0, 5.5, 6.0). Values outside range → validation failure → ai_failed
- Overall band: average of 4 criteria, rounded to nearest 0.5 (standard IELTS rounding: .25 rounds up, e.g., 5.875 → 6.0; 5.625 → 5.5)
- Feedback per criterion: 50-500 chars, in Vietnamese or English (matches prompt language). Includes specific quotes from the essay as evidence
- `strengths`: 2-4 bullet points highlighting what the learner did well
- `improvements`: 2-4 bullet points with specific, actionable suggestions
- All scores displayed with "Ước lượng" (estimate) label prominently. Disclaimer text: "Điểm số do AI ước lượng, không phải điểm IELTS chính thức" shown at top of score card
- Scoring time: target < 30 seconds (p95). Loading state: skeleton UI with animated pulse on score cards + "Đang chấm bài…" message. Progress indicator optional (BullMQ job progress events)
- On success: state → `ai_scored`. Scores persisted in `ai_scores` JSON field on submission record. Notification sent to learner (if scoring was async and they navigated away)
- On failure: state → `ai_failed`. Error logged with Gemini response details (status code, error message, latency). Learner sees generic "Không thể chấm bài lúc này" — no internal error details exposed
