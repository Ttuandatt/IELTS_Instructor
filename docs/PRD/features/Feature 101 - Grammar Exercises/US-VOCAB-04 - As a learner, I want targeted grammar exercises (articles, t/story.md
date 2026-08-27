# US-VOCAB-04 — As a learner, I want targeted grammar exercises (articles, t

| Field | Value |
|-------|-------|
| **Feature** | Grammar Exercises |
| **Domain** | Vocabulary & Language Tools |

> As a learner, I want targeted grammar exercises (articles, tenses, conditionals), so that I can improve my Grammatical Range score.

## Acceptance Criteria

- Grammar section at `/vocabulary/grammar`. Organized by topic (accordion or card grid):
- Exercise types per topic:
- Each exercise: question displayed, input field, "Kiểm tra" button. Correct → green ✅ with explanation. Incorrect → red ❌ with correct answer + grammar rule explanation in Vietnamese
- Exercise content: stored in DB as `grammar_exercises` table: `{ id, topic, exercise_type, question_text, correct_answer (supports |), explanation_vi, difficulty (easy/medium/hard), created_by }`
- Seeding: initial exercise bank created by admin/instructor. Future: AI-generated exercises from reading passage sentences
- Progress tracking per topic: `{ user_id, topic, exercises_attempted, exercises_correct, last_practiced_at }`. Accuracy percentage shown per topic on grammar overview page
- Linked to writing feedback: if AI scoring feedback identifies grammar weakness (e.g., "Cần cải thiện articles"), dashboard shows: "Luyện thêm: Articles" with link to `/vocabulary/grammar?topic=articles`
- Exercises per session: 10 questions per set (random from selected topic + difficulty). "Kết quả" summary at end: score, weak areas, "Luyện lại" button
- Depends on: F-WRIT-06 (scoring feedback linking to grammar), admin content management for exercise bank
