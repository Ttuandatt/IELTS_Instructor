-- Seed: writing prompts

INSERT INTO "prompts" (id, task_type, title, prompt_text, level, collection_id, status, min_words, created_by, created_at, updated_at)
VALUES
  ('0440f91b-7f51-484c-a03a-81bd67823b1c', 'task2',
   'Technology and Communication',
   'Some people believe that technology has made communication between people less personal. To what extent do you agree or disagree?',
   'B2', '22b4408a-f1cf-4ad0-8ab8-609f77eeee1f', 'published', 250,
   'fdc761e3-8a84-4110-b41c-d87d27f71a2b', now(), now()),
  ('45303274-480e-4df3-ba86-2aa9e5da5df0', 'task1',
   'Bar Chart: University Enrollment',
   'The chart below shows the number of students enrolled in three university faculties between 2015 and 2025. Summarise the information by selecting and reporting the main features.',
   'B1', '22b4408a-f1cf-4ad0-8ab8-609f77eeee1f', 'published', 150,
   'fdc761e3-8a84-4110-b41c-d87d27f71a2b', now(), now())
ON CONFLICT (id) DO NOTHING;
