# US-WRIT-15 — Read band-annotated model essays for each prompt after su...

| Field | Value |
|-------|-------|
| **Feature** | Model Essay Library |
| **Domain** | Writing |

> As a learner, I want to read band-annotated model essays for each prompt after submitting my own, so that I can learn what a high-scoring essay looks like.

## Acceptance Criteria

- Model essays stored in `model_essays` table: `{ id, prompt_id, band_level (float), content (text), annotations (JSON), created_by (instructor/admin), created_at }`
- Band levels: 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0. Each prompt can have 0-5 model essays at different band levels
- **Gate: learner must have at least one submitted (non-draft) submission for this prompt before seeing model essays.** If no submission: "Nộp bài trước khi xem bài mẫu" with disabled button. This prevents learners from copying model essays
- Model essay view: separate tab on submission detail page: "Bài mẫu ({count})". Shows list of available model essays sorted by band level
- Each model essay shows: band level badge, full essay text, per-criterion annotations (inline highlights with popover explanations: "Task Achievement: Band 8 — The response fully addresses all parts of the task…")
- Annotations stored as JSON array: `[{ start_offset, end_offset, criterion, comment }]`. Rendered as highlighted spans in the essay text with tooltip on hover/click
- Instructor uploads model essays via prompt edit page: "Bài mẫu" tab → "Thêm bài mẫu" → select band level + paste/type essay text + add annotations
- Admin can add platform-wide model essays (not scoped to a specific instructor). These appear for all prompts of matching task type
- Model essays are read-only for learners — no copy button (though they can still copy-paste from browser). Plagiarism detection is a separate concern
- Depends on: F-WRIT-01 (submission must exist), F-WRIT-05 (prompt must exist)
