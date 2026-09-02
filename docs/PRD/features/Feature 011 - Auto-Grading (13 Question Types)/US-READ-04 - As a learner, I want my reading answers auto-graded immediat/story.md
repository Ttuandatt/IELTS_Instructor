# US-READ-04 — As a learner, I want my reading answers auto-graded immediat

| Field | Value |
|-------|-------|
| **Feature** | Auto-Grading (13 Question Types) |
| **Domain** | Reading |

> As a learner, I want my reading answers auto-graded immediately after submission, so that I get instant feedback and can learn from mistakes.

## Acceptance Criteria

- AC1: Grading executed server-side via strategy pattern: each question type has its own grading strategy class implementing `grade(userAnswer, correctAnswer): boolean`
- AC2: 13 question type strategies:
- AC3: Text answer matching rules: case-insensitive, trim leading/trailing whitespace, collapse multiple spaces to single, ignore articles ("the", "a", "an") at start if correct answer doesn't start with article. Spelling must be exact (no fuzzy matching)
- AC4: Multiple acceptable answers: correct_answer field supports `|` delimiter for alternatives. All alternatives checked; any match = correct
- AC5: Grading response time: < 200ms for 40 questions (synchronous, no AI involved)
- AC6: After grading, response includes per-question: `{ questionId, userAnswer, correctAnswer, isCorrect, explanation? }`. Frontend renders green checkmark (correct) or red X (incorrect) with correct answer shown in green text below
- AC7: Score calculation: `correct_count / total_questions`, stored as both integers and percentage (float, 2 decimal places)
- AC8: Edge cases: empty answer → incorrect (not skipped); question with no correct_answer in DB → flagged as error in admin, skipped in grading (not counted in total)
