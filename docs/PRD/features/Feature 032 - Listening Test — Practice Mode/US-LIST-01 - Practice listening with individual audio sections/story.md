# US-LIST-01 — Practice listening with individual audio sections

| Field | Value |
|-------|-------|
| **Feature** | Listening Test — Practice Mode |
| **Domain** | Listening |

> As a learner, I want to practice listening with individual audio sections, so that I can improve specific listening skills.

## Acceptance Criteria

- AC1: Practice page at `/listening/{id}`. Layout: audio player (top), questions (below)
- AC2: Audio player: custom HTML5 audio player with:
- AC3: Audio replay: unlimited replays in practice mode (unlike exam). No restriction on seeking. Learner can replay specific sections as many times as needed
- AC4: Questions displayed below player: same question type UI as reading test (F-READ-04) — MCQ, fill-in-blank, matching, etc. Scrollable question list. Question numbering continues across sections if multi-section
- AC5: Submit: "Nộp bài" button at bottom. Confirmation: "Nộp câu trả lời? Bạn có thể nghe lại và sửa trước khi nộp." → submit → grading
- AC6: Auto-grade on submit: same grading logic as reading (exact match, case-insensitive, trim whitespace, `|` delimiter for alternatives). Score: `correct / total × 100%` displayed as percentage (consistent with reading, not band — per decision D6)
- AC7: Results page: per-question review with: question text, learner's answer, correct answer, ✅/❌ indicator. For incorrect: answer highlighted in red with correct answer shown in green
- AC8: Transcript reveal (if transcript uploaded): "Xem transcript" toggle after submission. Shows full audio transcript with timestamps. Incorrect answers' relevant sections highlighted in transcript
- AC9: Listening attempt record: `{ id, user_id, listening_test_id, section_id (nullable — all sections or specific), answers (JSONB), score_correct, score_total, percentage, duration_seconds (time from first play to submit), created_at }`
- AC10: Depends on: F-LIST-03 (content must exist), F-LIST-04 (score stored for history)
