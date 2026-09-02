# US-COMM-03 — Highlight specific sentences in a student's essay and lea...

| Field | Value |
|-------|-------|
| **Feature** | Inline Essay Annotation |
| **Domain** | Communication |

> As an instructor, I want to highlight specific sentences in a student's essay and leave comments, so that my feedback is precise and contextual.

## Acceptance Criteria

- AC1: Available on: submission review page (instructor view of a writing submission in `pending_review` or `finalized` state). Annotation toolbar appears above essay text
- AC2: Annotation flow:
- AC3: Annotation display: highlighted text with colored underline matching annotation type. Small numbered badge at start of highlight (e.g., ①②③). Click/tap highlight → expand comment below the text in a floating card
- AC4: Multiple annotations per essay: no overlap restriction (two annotations can cover the same text range). Numbered in order of creation
- AC5: Annotation record: `{ id, submission_id, instructor_id, start_offset (character position in essay text), end_offset, selected_text (denormalized for display), comment, annotation_type (enum), created_at, updated_at }`
- AC6: Stored in `instructor_annotations` JSONB field on submission record (or separate table for better querying — prefer separate table). NOT mixed with AI feedback (F-WRIT-06)
- AC7: Edit annotation: instructor can click own annotation → edit comment or type. "Cập nhật" / "Xóa" buttons
- AC8: Delete annotation: removes highlight and comment. No confirmation needed (low-risk, instructor's own annotation)
- AC9: Learner view: when learner views their submission (after instructor review), they see all annotations as colored highlights with comments. Read-only — learner cannot respond to individual annotations (use DM for discussion)
- AC10: Annotation count: submission card in review queue shows "📝 {n} nhận xét" badge indicating how many annotations the instructor has added
- AC11: Annotation summary: below essay, collapsible "Tổng hợp nhận xét" section lists all annotations as a numbered list with type badge + comment text. Useful for learners to review all feedback at once
- AC12: Export: annotations included in learner's data export (F-COMP-04). PDF report (F-DASH-07) includes essay with annotation highlights
- AC13: Depends on: F-WRIT-08 (review flow — instructor accesses submission), F-WRIT-06 (submission detail page where annotations appear)
