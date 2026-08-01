-- Seed: classroom owned by the demo instructor

INSERT INTO "classrooms" (id, name, description, invite_code, owner_id, status, max_members, writing_mode, created_at, updated_at)
VALUES (
  '23213a89-4c00-43b9-b682-10bcc501fe43',
  'IELTS B2 Morning Class',
  'Lớp luyện thi IELTS buổi sáng — band mục tiêu 6.5+',
  'DEMO0001',
  'fdc761e3-8a84-4110-b41c-d87d27f71a2b',
  'active', 50, 'instant', now(), now()
)
ON CONFLICT (id) DO NOTHING;
