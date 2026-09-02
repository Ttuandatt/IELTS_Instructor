# US-READ-12 — Auto-generate a mock test by selecting criteria (difficul...

| Field | Value |
|-------|-------|
| **Feature** | Randomized Test Generator |
| **Domain** | Reading |

> As an instructor, I want to auto-generate a mock test by selecting criteria (difficulty, question types, passage count), so that I can quickly create varied assessments for my class without manual assembly.

## Acceptance Criteria

- AC1: UI: "Tạo đề thi ngẫu nhiên" button on instructor's passage management page. Opens configuration modal/page
- AC2: Configuration options:
- AC3: Generation logic: server-side query selects matching published passages, randomized with `ORDER BY RANDOM()`. If fewer matching passages than requested → show warning "Chỉ tìm thấy {n} bài phù hợp (cần {requested})" with option to proceed with fewer or adjust criteria
- AC4: Preview: generated test shown in read-only preview mode (same layout as learner would see). Instructor can:
- AC5: Deterministic seed: each generation uses a random seed stored with the test. Same seed + same passage bank = same test (for reproducibility if needed)
- AC6: Generated test saved as `reading_tests` record with `{ passages: [id1, id2, id3], criteria, seed, created_by, created_at }`
- AC7: Edge case: DB has fewer published passages than needed → clear message before generation starts. Minimum: 1 published passage with at least 1 question
- AC8: Depends on: F-READ-05 (passage must be published), F-CLASS-04 (lesson assignment)
