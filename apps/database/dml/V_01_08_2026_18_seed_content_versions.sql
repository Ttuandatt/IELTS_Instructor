-- Seed: audit-log entry for the instructor publishing passage_1

INSERT INTO "content_versions" (id, entity_id, entity_type, action, editor_id, version, changes, created_at)
VALUES (
  'ac9e956c-b550-44ea-b968-092c4e98925d',
  '1d394451-2430-41bb-abd5-e872ae6d3ac0',
  'passage',
  'publish',
  'fdc761e3-8a84-4110-b41c-d87d27f71a2b',
  1,
  '{"status": {"from": "draft", "to": "published"}}',
  now()
)
ON CONFLICT (id) DO NOTHING;
