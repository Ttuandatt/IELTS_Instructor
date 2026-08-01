-- Seed: notification to the demo learner about their AI-scored writing submission

INSERT INTO "notifications" (id, user_id, type, title, message, link, is_read, metadata, created_at)
VALUES (
  '52cede86-5378-436f-b85c-bd91cfb2727e',
  '35848a78-09b7-4121-b3ba-bb362e69afa7',
  'writing_scored',
  'Bài Writing đã được chấm',
  'AI đã chấm xong bài "Technology and Communication" của bạn — band ước lượng 6.0.',
  '/writing/submissions/0ef656dc-d036-43ab-9390-1f0f97eeaa27',
  false,
  '{"submission_id": "0ef656dc-d036-43ab-9390-1f0f97eeaa27"}',
  now()
)
ON CONFLICT (id) DO NOTHING;
