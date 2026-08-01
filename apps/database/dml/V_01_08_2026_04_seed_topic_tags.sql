-- Seed: topic tags

INSERT INTO "topic_tags" (id, name)
VALUES
  ('6b250005-3e7a-4bf7-a85b-ffa581bf0456', 'academic'),
  ('9843f44e-2046-4a06-89e8-b4831aa3361e', 'general-training')
ON CONFLICT (name) DO NOTHING;
