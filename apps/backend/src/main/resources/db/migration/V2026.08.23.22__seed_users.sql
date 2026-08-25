-- Seed: dev accounts (1 per role) — admin/instructor/learner
-- Admin mirrors apps/backend/src/seeds/seed.ts (ADMIN_EMAIL / ADMIN_PASSWORD env defaults).
-- Password hashes are bcrypt(cost=12) of the plaintext noted per row — regenerate if you
-- change these in your env / want different dev passwords.

INSERT INTO "users" (id, email, password_hash, display_name, role, language, theme, created_at, updated_at)
VALUES
  ('d41889cb-9bab-436e-a57d-7e56e5881720', 'admin@ieltshelper.local',
   '$2b$12$ruVMrd8fzw6qpJGMOuHdKepwZZF.O0AjsPQ8FZCKdrEsgRGqNmj0S', -- Admin1234!
   'Admin', 'ADMIN', 'vi', 'light', now(), now()),
  ('fdc761e3-8a84-4110-b41c-d87d27f71a2b', 'instructor@ieltshelper.local',
   '$2b$12$./6Yqzkt/z3vcinDc5dJ3uJiWHvvdaIcIGwwlJeCA/KCS7Da.jBWa', -- Instructor1234!
   'Instructor Demo', 'INSTRUCTOR', 'vi', 'light', now(), now()),
  ('35848a78-09b7-4121-b3ba-bb362e69afa7', 'learner@ieltshelper.local',
   '$2b$12$9czpt/ZBA1BYOE9HgTQlPudFvBWinHIWBKgyon0mE9CKso/D6keWG', -- Learner1234!
   'Learner Demo', 'LEARNER', 'vi', 'light', now(), now())
ON CONFLICT (email) DO NOTHING;
