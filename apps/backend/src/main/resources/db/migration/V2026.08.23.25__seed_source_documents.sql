-- Seed: source document (docx upload that seeded passage_1 below)

INSERT INTO "source_documents" (id, file_name, file_url, uploaded_by, status, created_at)
VALUES (
  'c89b9152-8708-41d4-a9a3-f0d79a85a82e',
  'cam18_reading_test_1.docx',
  '/uploads/cam18_reading_test_1.docx',
  'fdc761e3-8a84-4110-b41c-d87d27f71a2b', -- instructor
  'DONE',
  now()
)
ON CONFLICT (id) DO NOTHING;
