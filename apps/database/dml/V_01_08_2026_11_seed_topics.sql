-- Seed: topic (unit) inside the demo classroom

INSERT INTO "topics" (id, classroom_id, title, description, order_index, status, created_at)
VALUES (
  '19fb365e-c4d4-4259-9fa6-7c049451bcdb',
  '23213a89-4c00-43b9-b682-10bcc501fe43',
  'Week 1 — Reading & Writing Basics',
  'Bài tập tuần đầu tiên',
  0, 'PUBLISHED', now()
)
ON CONFLICT (id) DO NOTHING;
