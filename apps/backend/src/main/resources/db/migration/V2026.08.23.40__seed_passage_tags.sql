-- Seed: tag passage_1 as "academic"

INSERT INTO "passage_tags" ("passage_id", "tag_id")
VALUES ('1d394451-2430-41bb-abd5-e872ae6d3ac0', '6b250005-3e7a-4bf7-a85b-ffa581bf0456')
ON CONFLICT DO NOTHING;
