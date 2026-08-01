-- Seed: demo learner's reading submission (2/3 correct)

INSERT INTO "submissions_reading" (id, user_id, passage_id, answers, score_pct, correct_count, total_questions, duration_sec, timed_out, test_mode, completed_at, lesson_id)
VALUES (
  '3b72cec2-7cae-4bc6-98b6-9445d5ee250a',
  '35848a78-09b7-4121-b3ba-bb362e69afa7',
  '1d394451-2430-41bb-abd5-e872ae6d3ac0',
  '[{"question_id": "05f1d9d2-cb40-4f63-a640-85c90c28e1d2", "value": "B"}, {"question_id": "16480c3f-ed28-4fc3-b4bd-c27d164f3e93", "value": "TRUE"}]',
  50.0, 1, 2, 620, false, 'practice', now(), 'a8ee6b80-9e47-4656-b99c-c9b0f822eb5f'
)
ON CONFLICT (id) DO NOTHING;
