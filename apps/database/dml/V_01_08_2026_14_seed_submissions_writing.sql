-- Seed: demo learner's writing submission — already AI-scored, released to learner (instant mode)

INSERT INTO "submissions_writing" (
  id, user_id, prompt_id, content, word_count, scores, feedback, model_tier, model_name,
  turnaround_ms, processing_status, created_at, scored_at, lesson_id,
  state, instructor_scores, updated_at, prompt_version, tokens_input, tokens_output
)
VALUES (
  '0ef656dc-d036-43ab-9390-1f0f97eeaa27',
  '35848a78-09b7-4121-b3ba-bb362e69afa7',
  '0440f91b-7f51-484c-a03a-81bd67823b1c',
  'In today''s world, technology plays a huge role in how people communicate with each other...',
  262,
  '{"TR": 6.0, "CC": 6.5, "LR": 6.0, "GRA": 6.5, "overall": 6.0}',
  '{"summary": "Solid attempt with clear position.", "strengths": ["Clear thesis", "Good paragraph structure"], "improvements": ["Broaden vocabulary range", "Vary sentence structure"]}',
  'cheap', 'gemini-2.5-flash', 4200, 'done', now(), now(), '394d721e-557c-45f3-9846-f910f22ceb8e',
  'released_ai', NULL, now(), 'v1', 850, 320
)
ON CONFLICT (id) DO NOTHING;
