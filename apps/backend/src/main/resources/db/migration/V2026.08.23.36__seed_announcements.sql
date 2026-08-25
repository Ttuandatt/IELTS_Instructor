-- Seed: instructor's welcome announcement to the demo classroom

INSERT INTO "announcements" (id, classroom_id, author_id, message, created_at)
VALUES (
  'f289c64a-55ce-4d31-8eec-e075abfe832c',
  '23213a89-4c00-43b9-b682-10bcc501fe43',
  'fdc761e3-8a84-4110-b41c-d87d27f71a2b',
  'Chào cả lớp! Tuần này mình có 3 bài tập: 1 bài Reading, 1 bài Writing, và phần giới thiệu bản thân. Deadline cuối tuần nhé.',
  now()
)
ON CONFLICT (id) DO NOTHING;
