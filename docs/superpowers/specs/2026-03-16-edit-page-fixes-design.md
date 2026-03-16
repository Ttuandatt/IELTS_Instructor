# Edit Page Fixes — Design Spec

**Date:** 2026-03-16
**Status:** Draft
**Scope:** Fix 3 missing/incomplete edit features across admin and instructor panels

## Problem Statement

Audit on 2026-03-15 revealed three gaps in the content management UI:

1. **Writing Prompts Edit page does not exist** — list page links to `/admin/prompts/:id/edit` and `/instructor/prompts/:id/edit` but no page file exists, resulting in 404.
2. **Reading Passage Edit page lacks file re-upload** — if a user uploads the wrong DOCX/PDF, they must delete the passage and re-create it. The edit page only supports manual HTML editing.
3. **Questions CRUD is incomplete** — passage detail page only allows inline answer_key editing. No UI to add, edit (full fields), or delete questions, despite backend endpoints being available.

## Fix 1: Writing Prompts Edit Page

### Scope

Create `[id]/edit/page.tsx` for both admin and instructor panels.

### Data Flow

1. `GET /admin/prompts/:id` (or `/instructor/prompts/:id`) → load prompt data
2. Populate form: title, prompt_text, task_type (disabled), level, status, min_words, topic_tags
3. Submit → `PATCH /admin/prompts/:id` (or `/instructor/prompts/:id`), excluding task_type

### UI

- Layout matches create page (`new/page.tsx`) — same CSS classes: `form-card`, `form-group`, `form-row`
- `task_type` select is rendered `disabled` with a tooltip: "Task type cannot be changed after creation"
- Loading/error states follow existing pattern from reading passage edit page (Loader2 spinner, error message)
- Success: toast + redirect to prompts list + invalidate query cache key `['admin-prompts']`
- Use `use(params)` pattern (React 19) for accessing route params, consistent with existing edit pages

### Files

| Action | Path |
|--------|------|
| Create | `apps/frontend/src/app/admin/prompts/[id]/edit/page.tsx` |
| Create | `apps/frontend/src/app/instructor/prompts/[id]/edit/page.tsx` |

### Backend

No changes needed. `PATCH /admin/prompts/:id` and `PATCH /instructor/prompts/:id` already exist and accept: title, prompt_text, level, status, min_words, topic_tags.

## Fix 2: Reading Edit Page — Tab-based with File Re-upload

### Scope

Refactor the edit passage page into a 2-tab layout: "Manual Edit" and "Replace via File".

### Tab 1: Manual Edit

Expands the current edit form with a questions management section below.

**Passage Metadata + Content (existing fields):**
- title (text input)
- passage content (textarea, HTML)
- level (select: A2, B1, B2, C1 — matching `CefrLevel` enum in Prisma schema)
- status (select: draft/published)
- topic_tags (text input, comma-separated)

**Questions Management (new section):**
- Header: "Questions (N)" + "Add Question" button
- Each question renders as a collapsed accordion card showing: `order_index. prompt | type | answer_key`
- Clicking a card expands it into an inline edit form:
  - type: **read-only display** (not editable — backend `updateQuestion` does not accept `type` changes, same rationale as locking `task_type` for prompts)
  - prompt (text input)
  - options (dynamic list with add/remove buttons — only visible when type requires options)
  - answer_key (text input)
  - explanation (textarea, optional)
  - order_index (number input)
  - Action buttons: Save | Cancel | Delete (with confirmation dialog)
- "Add Question" opens a new expanded card at the bottom with empty fields. For new questions, `type` IS selectable from the full QuestionType enum (see below)
- Each save/delete triggers its own API call and refreshes the question list
- No drag-to-reorder — order managed via order_index number field

**QuestionType enum values** (from Prisma schema):
`matching_headings`, `true_false_notgiven`, `yes_no_notgiven`, `mcq`, `matching_information`, `matching_features`, `matching_sentence_endings`, `sentence_completion`, `summary_completion`, `table_completion`, `flowchart_completion`, `diagram_label_completion`, `short`

**API calls:**
- `PATCH /admin/passages/:id` — update passage metadata + content
- `POST /admin/passages/:passageId/questions` — create question
- `PATCH /admin/questions/:id` — update question (prompt, options, answer_key, explanation, order_index)
- `DELETE /admin/questions/:id` — delete question

### Tab 2: Replace via File

Two-step flow for replacing passage content via file upload.

**Step 1 — Upload:**
- Drag-and-drop zone + "Browse Files" button (mirrors existing upload page UI)
- Accept `.docx`, `.pdf`
- "Parse Document" button → `POST /reading/parse-docx` with FormData

**Step 2 — Preview comparison:**
- 2-column layout: "Current" (left) vs "New from file" (right)
- Left column: current passage HTML + current questions list
- Right column: parsed passage HTML + parsed questions from file
- "Replace All" button with confirmation dialog: "This will replace the passage content AND all existing questions. This cannot be undone. Continue?"
- Replace flow:
  1. Delete all existing questions via `DELETE /admin/questions/:id` for each
  2. Update passage body via `PATCH /admin/passages/:id`
  3. Create new questions via `POST /admin/passages/:passageId/questions` for each
  4. Invalidate queries, show success toast, switch to Tab 1
- **Error handling:** If any step fails mid-way, show an error toast with the specific failure. The user can retry — the UI re-fetches current state and attempts only the remaining operations (idempotent: skip already-deleted questions, skip already-updated passage).

**Parse response shape** (`POST /reading/parse-docx` returns):
```json
{
  "passage": "<html string>",
  "question_groups": [
    {
      "type": "mcq",
      "instruction": "Questions 1-5: Choose the correct letter...",
      "group_options": ["A. Option", "B. Option"] or null,
      "questions": [
        { "order_index": 1, "prompt": "...", "options": [...] or null, "answer_key": "A" }
      ]
    }
  ]
}
```

**Data transformation** (question_groups → individual question create calls):
For each group, iterate through its questions. The first question in each group gets `instruction` and `group_options` prepended to its `prompt` as HTML (matching the existing `importPassage` logic in `admin.service.ts`). Each question maps to:
```
{ type: group.type, prompt: formattedPrompt, options: q.options, answer_key: q.answer_key, order_index: q.order_index }
```

### Files

| Action | Path |
|--------|------|
| Rewrite | `apps/frontend/src/app/admin/passages/[id]/edit/page.tsx` |
| Rewrite | `apps/frontend/src/app/instructor/passages/[id]/edit/page.tsx` |

### Backend

No new endpoints needed. All required endpoints exist:
- `PATCH /admin/passages/:id`
- `POST /admin/passages/:passageId/questions`
- `PATCH /admin/questions/:id`
- `DELETE /admin/questions/:id`
- `POST /reading/parse-docx`

## Shared Concerns

### Admin vs Instructor Parity

Both panels get identical UI. The only difference is the API base path:
- Admin: `/admin/...`
- Instructor: `/instructor/...`

**Bug fix included:** The current instructor edit page incorrectly calls `/admin/passages/:id` instead of `/instructor/passages/:id`. The rewrite must parameterize the base path. The same bug exists in the instructor passage detail page (`instructor/passages/[id]/page.tsx`) — fix that as well.

The instructor backend delegates to AdminService with role-based authorization (creator check).

### Styling

All new components use the existing design system:
- Fix 1 (prompts): `form-card`, `form-group`, `form-row` classes (matching create page)
- Fix 2 (passages): Tailwind utility classes with `rounded-xl`, `border-gray-200`, `shadow-sm` pattern (matching existing edit page)

### Content Versioning

The existing `ContentVersionService` automatically logs mutations (create/update/delete) when the backend service methods are called. No additional work needed.

## Out of Scope

- Rich text editor for passage content (remains raw HTML textarea)
- Drag-to-reorder questions (use order_index number field instead)
- Bulk question operations (import/export)
- Passage version history UI (backend tracks versions but no UI to view them)
- `collection` field (not exposed in create pages either — consistent omission)
- Fixing CefrLevel options in existing create pages (A1/C2 listed in UI but not in enum — separate issue)
