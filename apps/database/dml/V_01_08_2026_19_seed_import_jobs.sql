-- Seed: completed import job for the source document that produced passage_1

INSERT INTO "import_jobs" (id, user_id, document_id, status, parsed_raw_data, error_message, created_at, updated_at)
VALUES (
  '77b69091-1263-409b-984a-34701441112b',
  'fdc761e3-8a84-4110-b41c-d87d27f71a2b',
  'c89b9152-8708-41d4-a9a3-f0d79a85a82e',
  'done',
  '{"passage_id": "1d394451-2430-41bb-abd5-e872ae6d3ac0", "question_count": 2}',
  NULL, now(), now()
)
ON CONFLICT (id) DO NOTHING;
