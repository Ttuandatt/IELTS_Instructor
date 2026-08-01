-- Seed: 3 lessons under the demo topic — one per content_type used elsewhere in this seed set
-- (passage → submissions_reading, prompt → submissions_writing, text → lesson_submissions)

INSERT INTO "lessons" (id, topic_id, title, content, content_type, linked_entity_id, attachment_url, order_index, status, allow_submit, allow_checkscore, due_at, created_at)
VALUES
  ('a8ee6b80-9e47-4656-b99c-c9b0f822eb5f', '19fb365e-c4d4-4259-9fa6-7c049451bcdb',
   'Reading: The History of Glass', NULL, 'passage', '1d394451-2430-41bb-abd5-e872ae6d3ac0', NULL,
   0, 'published', true, true, now() + interval '7 days', now()),
  ('394d721e-557c-45f3-9846-f910f22ceb8e', '19fb365e-c4d4-4259-9fa6-7c049451bcdb',
   'Writing: Technology and Communication', NULL, 'prompt', '0440f91b-7f51-484c-a03a-81bd67823b1c', NULL,
   1, 'published', true, true, now() + interval '7 days', now()),
  ('cd352d41-b45e-4587-b441-4b248022613d', '19fb365e-c4d4-4259-9fa6-7c049451bcdb',
   'Warm-up: Introduce yourself', 'Viết 3-5 câu giới thiệu bản thân và mục tiêu học IELTS.', 'text', NULL, NULL,
   2, 'published', true, false, now() + interval '3 days', now())
ON CONFLICT (id) DO NOTHING;
