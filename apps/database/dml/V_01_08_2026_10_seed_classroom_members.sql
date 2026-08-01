-- Seed: demo learner joins the demo classroom

INSERT INTO "classroom_members" (id, classroom_id, user_id, role, joined_at)
VALUES (
  '9f91cfd2-b61c-417d-aa8d-f66294076dc6',
  '23213a89-4c00-43b9-b682-10bcc501fe43',
  '35848a78-09b7-4121-b3ba-bb362e69afa7',
  'student', now()
)
ON CONFLICT (id) DO NOTHING;
