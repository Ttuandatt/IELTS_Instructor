-- Seed: reading passages

INSERT INTO "passages" (id, title, body, level, collection_id, source_document_id, status, created_by, created_at, updated_at)
VALUES
  ('1d394451-2430-41bb-abd5-e872ae6d3ac0',
   'The History of Glass',
   '<p>Glass has been made for thousands of years. The earliest known glass objects date back to around 3500 BC in Mesopotamia and Egypt...</p>',
   'B2', 'b46a5ecc-3149-404d-8b4e-593cba53f0b2', 'c89b9152-8708-41d4-a9a3-f0d79a85a82e',
   'PUBLISHED', 'fdc761e3-8a84-4110-b41c-d87d27f71a2b', now(), now()),
  ('7b93bc92-ddb6-4b29-8f6f-c2315b103c76',
   'Migration Patterns of Arctic Terns',
   '<p>The Arctic tern is a seabird famous for its long-distance migration, travelling from its Arctic breeding grounds to the Antarctic each year...</p>',
   'C1', 'b46a5ecc-3149-404d-8b4e-593cba53f0b2', NULL,
   'PUBLISHED', 'fdc761e3-8a84-4110-b41c-d87d27f71a2b', now(), now())
ON CONFLICT (id) DO NOTHING;
