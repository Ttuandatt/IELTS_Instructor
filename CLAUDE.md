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

| Prefix | Purpose | Branch from | PR into | Example |
|---|---|---|---|---|
| `main` | Production-ready, protected | — | — | — |
| `development` | Integration branch | `main` | `main` (via `release/`) | — |
| `feat/` | New feature | `development` | `development` | `feat/auth-jwt` |
| `fix/` | Bug fix | `development` | `development` | `fix/login-redirect` |
| `chore/` | Non-functional (deps, CI, docs, refactor) | `development` | `development` | `chore/upgrade-spring-boot` |
| `hotfix/` | Critical production fix | `main` | `main` + `development` | `hotfix/sql-injection` |
| `release/` | Release prep (version bump, changelog) | `development` | `main` + `development` | `release/1.0.0` |

**Rules:**
- Never commit directly to `main` or `development` — always via PR
- Branch naming: `<type>/<short-kebab-description>` — max 4 words
- One concern per branch — don't mix a feature with an unrelated fix
- Delete branch after merge
- Rebase or squash merge into `development`; merge commit from `development` → `main`

**Hotfix flow:** `main` → `hotfix/xxx` → PR into `main` → cherry-pick or merge back into `development`

**Release flow:** `development` → `release/x.y.z` → final QA/fixes → PR into `main` (tag `vx.y.z`) + PR back into `development`

**Protection rules** (when team joins):
- `main`: require PR review, no force push, require CI pass
- `development`: require PR review, no force push

**Commit message title** — Conventional Commits:

```
<type>(<scope>): <imperative, lowercase summary>
```

- `type`: `feat` | `fix` | `docs` | `style` | `refactor` | `chore` | `test` | `wip`
- `scope`: optional — the module/feature touched (`reading`, `writing`, `dashboard`, `auth`, `lesson`, `scoring`, `prd`, `classroom`...). Omit for repo-wide changes.
- Examples: `feat(auth): add JWT refresh token rotation`, `fix(reading): null check on empty passage body`

**Commit message body:**
- One or two sentences on *why*, not *what* — the diff already shows what changed
- Call out anything a reviewer must know that isn't obvious from the diff: schema/migration changes, files moved/renamed, breaking API changes
- **Never add a `Co-Authored-By: Claude` trailer** — explicitly opted out for this repo

## Dev environment quirks

- **Shell:** PowerShell (Windows). Use `Remove-Item -Recurse -Force <path>`, not `rm -rf`. Forward slashes work in most paths.
- **Next.js 16 Turbopack:** CSS HMR sometimes does NOT pick up DELETED rules. After deleting CSS, hard-refresh (Ctrl+Shift+R) or `Remove-Item -Recurse -Force apps/frontend/.next` + restart.
- **Uploads folder:** `apps/backend/uploads/` is gitignored. Files referenced from DB may not exist on disk after cleanup → 404. Defensive UI for missing PDFs is open work.
- **Static serving:** `app.useStaticAssets(uploadsDir, { prefix: '/uploads/' })` in main.ts — no `/api/` prefix on uploads. Frontend resolves via `BACKEND_ORIGIN` (strips `/api`).
