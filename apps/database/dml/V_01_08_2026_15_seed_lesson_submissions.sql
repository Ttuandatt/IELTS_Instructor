-- Seed: demo learner's submission for the text-type warm-up lesson (teacher-graded, not AI)

INSERT INTO "lesson_submissions" (id, lesson_id, user_id, content, word_count, status, score, feedback, created_at)
VALUES (
  '81feeb2d-d3b9-4ee6-bb6e-e047bd9bd54b',
  'cd352d41-b45e-4587-b441-4b248022613d',
  '35848a78-09b7-4121-b3ba-bb362e69afa7',
  'Hi, my name is Learner Demo. I am preparing for IELTS and my target band is 6.5.',
  17, 'graded', 8.0, 'Nice and concise, well done!', now()
)
ON CONFLICT (id) DO NOTHING;
