# US-WRIT-17 — Rewrite an essay for the same prompt and see a side-by-si...

| Field | Value |
|-------|-------|
| **Feature** | Essay Revision & Comparison |
| **Domain** | Writing |

> As a learner, I want to rewrite an essay for the same prompt and see a side-by-side comparison with AI feedback on what improved, so that I learn through deliberate iteration.

## Acceptance Criteria

- "Viết lại" button on submission detail page (only for `released_ai` or `finalized` states). Creates new submission with `parent_submission_id = original.id`, same `prompt_id`, `lesson_id`
- New submission starts as `draft` with empty content (not pre-filled with original text — learner should write fresh). Prompt shown at top as usual
- After the revision is scored, comparison view available at `/writing/compare/{originalId}/{revisionId}`:
- AI comparison feedback: additional Gemini API call with both essays, returns structured analysis:
- Revision chain: submission detail page shows "Lịch sử viết lại" section listing all versions chronologically: v1 (original), v2, v3… Each linkable to its detail page. Max 5 revisions per prompt per learner (prevent abuse)
- Revision count shown on history page: "Lần {n}" column
- Comparison API call costs additional tokens — counts toward daily rate limit (F-WRIT-09)
- Depends on: F-WRIT-02 (scoring), F-WRIT-09 (rate limit)
