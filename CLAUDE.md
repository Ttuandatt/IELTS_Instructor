# IELTS Instructor — Project Map

Monorepo: NestJS backend + Next.js 14 frontend (App Router, Turbopack).

## Data flow — Reading passage upload to learner display

1. **Upload** (admin or learner): `POST /api/uploads` (file) or `/api/reading/parse-docx` (admin preview)
   - `apps/backend/src/upload/upload.controller.ts` — receives multipart, dispatches by extension
   - PDF → `parsing.service.ts:parsePdf` → Gemini multimodal API
   - DOCX → `mammoth-parser.service.ts` first; if confidence < 0.6 → `parsing.service.ts:parseDocx` (Gemini fallback)
   - TXT → simple paragraph wrap
2. **Adapt** (legacy → unified shape): `apps/backend/src/reading/parse-adapter.ts:adaptLegacyGeminiResult`
   - Flattens `question_groups[].questions[]` → flat `ParsedQuestion[]`
   - Each ParsedQuestion has `group_instruction`, `stem`, `options`, `correct_answer`
3. **Import** (admin saves to DB): `POST /api/admin/passages/import`
   - `apps/backend/src/admin/admin.service.ts:importPassage`
   - **Quirk:** prepends `group_instruction` into `prompt` of the FIRST question of each group as `<div class="border-l-4 ...">...</div>`. Frontend must extract this back out (see `extractGroupInstruction` helper in reading test page).
4. **Serve** (learner takes test): `GET /api/reading/passages/:id`
   - `apps/backend/src/reading/reading.service.ts:getPassage` — returns passage + questions WITHOUT `answer_key`
5. **Render** (learner UI): `apps/frontend/src/app/reading/[id]/page.tsx`
   - Two views: practice mode + simulation mode
   - Passage left panel, questions right panel
   - PDF passage → iframe with `#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
   - HTML passage → `<div class="passage-body" dangerouslySetInnerHTML>`

## Key files

### Frontend
- **Reading test page** (learner take-test): `apps/frontend/src/app/reading/[id]/page.tsx`
  - Custom design system: CSS variables (`var(--primary)`, `var(--ink)`, …) in globals.css, NOT Tailwind
  - Helpers at top: `stripOptionPrefix`, `extractGroupInstruction`
- **Admin upload preview**: `apps/frontend/src/app/admin/passages/upload/page.tsx`
  - Uses `<TestRunner>` → `<PassageViewer>` (Tailwind-styled, separate UI)
- **Passage display component** (admin): `apps/frontend/src/components/reading/PassageViewer.tsx`
- **Global styles**: `apps/frontend/src/app/globals.css` (~3000 lines)
  - Reading test scoped styles: line 944+ (`.test-passage .passage-body`)
  - Avoid `:first-letter` rules on passage body — looks bad for IELTS reading

### Backend
- **Reading endpoints**: `apps/backend/src/reading/reading.controller.ts` + `reading.service.ts`
- **Admin endpoints**: `apps/backend/src/admin/admin.controller.ts` + `admin.service.ts`
- **Parser system prompt** (Gemini): `apps/backend/src/reading/parsing.service.ts:SYSTEM_PROMPT`
  - Defines question_groups schema; LLM may return options with letter prefixes (`"A. ..."`) — frontend strips for display

## Conventions

- **Frontend styling:** Reading test page uses CSS variables + custom classes. Admin pages and reusable components use Tailwind. Don't mix randomly.
- **Question type taxonomy:** `LEGACY_TYPE_MAP` in `parse-adapter.ts` maps Gemini's free-form types to the unified `IeltsQuestionType` enum.
- **Status field:** `passage.status` in `{ draft, published }`. Learners only see `published`.
- **PRD-first workflow:** Update relevant PRD docs before changing implementation (per user feedback memory).

## Git Workflow

**Branches:**
- `main` — stable, deployable. Never commit directly.
- `development` — integration branch. Every `feat/*`/`fix/*` branch PRs into `development` first; `development` PRs into `main` once stable.
- `feat/<short-kebab-name>` — new feature work, e.g. `feat/m1-schema-migration`
- `fix/<short-kebab-name>` — bug fixes
- `backup/<description>` — ad hoc snapshot before a risky batch of changes (rare)

**Commit message title** — Conventional Commits, already the convention throughout this repo's history:

```
<type>(<scope>): <imperative, lowercase summary>
```

- `type`: `feat` | `fix` | `docs` | `style` | `refactor` | `chore` | `test` | `wip`
- `scope`: optional — the module/feature touched (`reading`, `writing`, `dashboard`, `auth`, `lesson`, `scoring`, `prd`, `classroom`...). Omit for repo-wide changes.
- Examples from history: `feat(reading): split result into /reading/attempts/[id]`, `refactor(reading): strategy pattern grading for 13 IELTS question types`, `docs: merge PRD refresh into staged docs/PRD structure`

**Commit message body:**
- One or two sentences on *why*, not *what* — the diff already shows what changed
- Call out anything a reviewer must know that isn't obvious from the diff: schema/migration changes, files moved/renamed, breaking API changes
- **Never add a `Co-Authored-By: Claude` trailer** — explicitly opted out for this repo, don't reintroduce it

**PR flow:** `feat/*`/`fix/*` → PR into `development` → review → PR `development` → `main` when stable. No fixed cadence — merge to `main` at milestone boundaries, not per-commit.

## Dev environment quirks

- **Shell:** PowerShell (Windows). Use `Remove-Item -Recurse -Force <path>`, not `rm -rf`. Forward slashes work in most paths.
- **Next.js 16 Turbopack:** CSS HMR sometimes does NOT pick up DELETED rules. After deleting CSS, hard-refresh (Ctrl+Shift+R) or `Remove-Item -Recurse -Force apps/frontend/.next` + restart.
- **Uploads folder:** `apps/backend/uploads/` is gitignored. Files referenced from DB may not exist on disk after cleanup → 404. Defensive UI for missing PDFs is open work.
- **Static serving:** `app.useStaticAssets(uploadsDir, { prefix: '/uploads/' })` in main.ts — no `/api/` prefix on uploads. Frontend resolves via `BACKEND_ORIGIN` (strips `/api`).
