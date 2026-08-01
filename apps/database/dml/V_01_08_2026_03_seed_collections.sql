-- Seed: content collections

INSERT INTO "collections" (id, name, description, created_at, updated_at)
VALUES
  ('b46a5ecc-3149-404d-8b4e-593cba53f0b2', 'Reading Practice Set', 'Passages cho luyện Reading', now(), now()),
  ('22b4408a-f1cf-4ad0-8ab8-609f77eeee1f', 'Writing Task Bank', 'Đề bài Task 1 & Task 2', now(), now())
ON CONFLICT (name) DO NOTHING;
