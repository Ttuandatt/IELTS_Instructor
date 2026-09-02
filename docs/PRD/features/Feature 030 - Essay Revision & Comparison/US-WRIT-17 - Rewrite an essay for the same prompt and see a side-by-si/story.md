# US-WRIT-17 — Rewrite an essay for the same prompt and see a side-by-si...

| Field | Value |
|-------|-------|
| **Feature** | Essay Revision & Comparison |
| **Domain** | Writing |

> As a learner, I want to rewrite an essay for the same prompt and see a side-by-side comparison with AI feedback on what improved, so that I learn through deliberate iteration.

## Acceptance Criteria

- AC1: "Viết lại" button on submission detail page (only for `released_ai` or `finalized` states). Creates new submission with `parent_submission_id = original.id`, same `prompt_id`, `lesson_id`
- AC2: New submission starts as `draft` with empty content (not pre-filled with original text — learner should write fresh). Prompt shown at top as usual
- AC3: After the revision is scored, comparison view available at `/writing/compare/{originalId}/{revisionId}`:
- AC4: AI comparison feedback: additional Gemini API call with both essays, returns structured analysis:
- AC5: Revision chain: submission detail page shows "Lịch sử viết lại" section listing all versions chronologically: v1 (original), v2, v3… Each linkable to its detail page. Max 5 revisions per prompt per learner (prevent abuse)
- AC6: Revision count shown on history page: "Lần {n}" column
- AC7: Comparison API call costs additional tokens — counts toward daily rate limit (F-WRIT-09)
- AC8: Depends on: F-WRIT-02 (scoring), F-WRIT-09 (rate limit)
