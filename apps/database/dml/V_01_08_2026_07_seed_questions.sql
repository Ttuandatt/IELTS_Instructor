-- Seed: reading questions

INSERT INTO "questions" (id, passage_id, type, prompt, options, answer_key, explanation, order_index)
VALUES
  ('05f1d9d2-cb40-4f63-a640-85c90c28e1d2', '1d394451-2430-41bb-abd5-e872ae6d3ac0',
   'mcq', 'Where were the earliest known glass objects found?',
   '["A. China", "B. Mesopotamia and Egypt", "C. Rome", "D. Greece"]',
   '"B"', 'Passage states earliest glass objects date to ~3500 BC in Mesopotamia and Egypt.', 0),
  ('16480c3f-ed28-4fc3-b4bd-c27d164f3e93', '1d394451-2430-41bb-abd5-e872ae6d3ac0',
   'true_false_notgiven', 'Glass-making techniques have remained unchanged since 3500 BC.',
   NULL, '"FALSE"', 'Passage implies techniques evolved over time.', 1),
  ('5749df29-de9c-4d23-a273-74216a8cc0ee', '7b93bc92-ddb6-4b29-8f6f-c2315b103c76',
   'short', 'Which continent do Arctic terns migrate to for the winter?',
   NULL, '["Antarctic", "Antarctica"]', 'Passage states they travel to the Antarctic each year.', 0)
ON CONFLICT (id) DO NOTHING;
