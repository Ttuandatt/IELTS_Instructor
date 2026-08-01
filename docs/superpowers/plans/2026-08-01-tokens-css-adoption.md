# Tokens.css Design System Adoption — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three competing styling systems currently in `apps/frontend` (ad-hoc custom classes on ~15 pages, plain unstyled Tailwind on ~12 pages, and the unused `.design-bundle/` tokens system) with a single consistent design system — parchment/indigo, Inter + JetBrains Mono, "calm/academic/editorial" — sourced from `.design-bundle/ielts-instructor/project/src/tokens.css`, matching the mockups in `screens-*.jsx` in the same folder.

**Architecture:** Import `tokens.css`'s CSS custom properties and component classes (`.card`, `.btn`, `.stat`, `.data-table`→`.table`, `.badge`, `.field`, `.mcq-option`, `.test-*`, etc.) into `apps/frontend/src/app/globals.css`, replacing the old ad-hoc `--color-primary`/`.page-title`/`.content-card` token set 1:1. Pages keep their existing React/data logic — only JSX className and markup structure change to match the mockup screens. No mockup exists for some routes (classroom sub-pages, admin/instructor CRUD detail/edit/upload) — those get the same primitives applied without a literal reference file.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind (utility escape hatch only, not the primary system), plain CSS custom properties (no CSS-in-JS).

**Out of scope (per Langy decision log D7 — do not build):** Listening, Speaking, Placement test, Assignment/Gradebook. No design-bundle mockup exists for these and the product has explicitly cut them from pilot scope.

**Verification approach:** This is a visual restyle of already-functional pages — business logic does not change. Each task's "test" is: `npm run build` (or `next dev` + Ctrl+Shift+R hard refresh per this repo's known Turbopack CSS-HMR quirk) compiles clean, then a manual visual check against the matching `screens-*.jsx` mockup (open both side by side). No new unit tests are introduced by this plan; existing tests must still pass (`npm test` in `apps/frontend` if present).

---

## Phase 0: Foundation — tokens + kill dead CSS

Must land first; every later phase depends on the token variables existing and on the two known CSS bugs not silently reappearing.

### Task 0.1: Fix the two live CSS bugs found in audit

**Files:**
- Modify: `apps/frontend/src/app/globals.css:2046-2103` (delete — dead, superseded block)
- Modify: `apps/frontend/src/app/globals.css:813-817` (delete — conflicting `.form-group`, superseded by 1224-1226)

- [ ] **Step 1: Delete the dead `.writing-layout` block**

Delete lines 2046-2103 in full (the block under the `/* Writing Practice */` comment at line 2044) — it is fully superseded by the `/* Writing Layout (Sprint 3) */` block at 2129-2279, which the cascade already picks. Confirm no class defined only in the deleted block is still referenced in `apps/frontend/src/app/writing/[id]/page.tsx` before deleting (grep the page for each selector name first).

- [ ] **Step 2: Delete the stale `.form-group` rule**

Delete lines 813-817 (`display:flex; flex-direction:column; gap:var(--space-xs)` under `.auth-form`). Keep the `/* Forms */`-section definition at 1224-1226. After deleting, grep `apps/frontend/src` for `form-group` usage on auth pages specifically and re-check their layout still looks right (auth pages relied on the flex-column behavior — Phase 2 rewrites them anyway, but don't leave a visibly broken auth page in the interim).

- [ ] **Step 3: Verify**

Run: `npm run dev` (apps/frontend), open `/login` and `/writing/<any-id>` — layout should not visibly break (auth may look slightly off until Phase 2, that's expected).

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app/globals.css
git commit -m "fix(css): remove dead .writing-layout block and conflicting .form-group rule"
```

### Task 0.2: Import tokens.css variables into globals.css

**Files:**
- Modify: `apps/frontend/src/app/globals.css` (top of file, `:root` block)
- Reference: `.design-bundle/ielts-instructor/project/src/tokens.css` (full file — already read, copy verbatim)

- [ ] **Step 1: Replace the existing `:root` and `[data-theme]` blocks**

Find the current root variable block (contains `--color-primary: #6366f1` at line 10, and the dark-mode `--color-primary: #818cf8` block around line 77). Replace both with the exact `:root` block and `[data-theme="dark"]` block from `.design-bundle/ielts-instructor/project/src/tokens.css` lines 6-100 (verbatim — this repo does not currently use `data-color` theme variants, so lines 102-151 of tokens.css can be skipped unless Task 0.4 decides to keep the tweaks panel).

- [ ] **Step 2: Append the base reset + layout primitives + component classes**

Append tokens.css lines 153-837 (base reset, `.sidebar`/`.topbar`/`.content`, `.card`/`.btn`/`.badge`/`.field`/`.input`/`.tabs`/`.table`/`.stat`/`.mcq-option`/`.test-*`) to the end of `globals.css`, after the existing content. Do not delete old classes yet (`.page-title`, `.content-card`, `.stat-card`, `.data-table`, `.empty-state`, `.filters-row`, `.rp-*`, `.writing-*`, `.auth-*`, `.settings-*`) — later phases retire them page by page as each page is migrated; deleting now would break every unmigrated page immediately.

- [ ] **Step 3: Resolve the one real naming collision**

Both the old system and tokens.css define `.page-title` and `.badge` — old CSS occurs earlier in the file, tokens.css block appended after wins by cascade (correct — new pages should get the new look). Grep `apps/frontend/src/app` for `page-title` and `badge` usage; note (don't fix yet) which files will visually shift the moment this task lands vs. which are migrated deliberately in later phases. Any page using `.page-title` will immediately get tokens.css's serif-display 28px style instead of the old one — acceptable since Phase 3+ intentionally moves every page there anyway.

- [ ] **Step 4: Add font loading**

Check `apps/frontend/src/app/layout.tsx` for the current font setup (likely `next/font/google` for a different font, or a `font-sans` CSS var). Add `Inter` and `JetBrains_Mono` via `next/font/google`, exposed as CSS variables matching `--ff-display`/`--ff-body`/`--ff-mono` in the new `:root` block, e.g.:

```ts
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });
```

Apply both variable classes to `<html>` or `<body>` in `layout.tsx`, and set `--ff-display`/`--ff-body: var(--font-inter)` and `--ff-mono: var(--font-jetbrains-mono)` in `globals.css` (rather than the literal `'Inter'`/`'JetBrains Mono'` strings from tokens.css, so Next.js font optimization applies).

- [ ] **Step 5: Verify**

Run: `npm run build` — must compile with no CSS/type errors. Run `npm run dev`, open any page, confirm base body font is now Inter and background is parchment `#faf8f4` (even though most pages don't use the new component classes yet, body/background should already shift).

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/app/globals.css apps/frontend/src/app/layout.tsx
git commit -m "feat(design): import tokens.css variables, base reset, and component classes"
```

### Task 0.3: Rebuild the shared AppShell to match `shell.jsx`

**Files:**
- Reference: `.design-bundle/ielts-instructor/project/src/shell.jsx` (`Sidebar`, `Topbar`, `TweaksPanel`, `Icon`/`Icons`)
- Modify: whichever component currently renders the app frame — locate via `grep -rn "IconSidebar\|AppShell\|Navbar" apps/frontend/src/components` (built during the earlier Teachy pass; confirm exact path before editing, do not assume file names below are current)
- Modify: every `apps/frontend/src/app/**/layout.tsx` that wraps pages in the shell (if the shell is applied per-route-group rather than globally)

- [ ] **Step 1: Read the current shell component(s)**

Before writing anything, read the actual current AppShell/Navbar/IconSidebar files (found via the grep above) to see what props/behavior they already support (auth state, role-based nav items, active route highlighting) — this logic must be preserved, only markup/classes change.

- [ ] **Step 2: Rewrite markup to use `.sidebar`, `.sidebar-logo`, `.sidebar-section-label`, `.nav-link`/`.nav-link.is-active`, `.sidebar-user`, `.avatar`, `.topbar`, `.breadcrumb`, `.topbar-search`, `.topbar-actions`, `.icon-btn`, `.content`**

Follow `shell.jsx`'s `Sidebar` and `Topbar` component structure exactly for markup nesting; keep existing React logic (role-based nav item lists, auth context, router) wired to the new markup.

- [ ] **Step 3: Wrap the whole app in `.app` grid container**

Per tokens.css: `.app { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }` — sidebar as first grid child, `.main` (containing `.topbar` + `.content`) as second.

- [ ] **Step 4: Decide on the Tweaks panel (color/theme switcher)**

`shell.jsx` includes a `TweaksPanel` for switching `data-color`/`data-theme` live. Confirm with product owner whether this ships to end users or is dev-only; if dev-only, gate it behind `process.env.NODE_ENV === 'development'`. Do not skip silently — this is a visible feature in the mockup, not a styling footnote.

- [ ] **Step 5: Verify**

Run: `npm run dev`, check every top-level route still renders inside the shell with no broken layout, nav highlighting works for the current route, role-based nav items still show/hide correctly per role.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/components apps/frontend/src/app/layout.tsx
git commit -m "feat(design): rebuild app shell (sidebar/topbar) to match tokens.css shell.jsx"
```

---

## Phase 1: Auth pages

### Task 1.1: Rewrite login + register

**Files:**
- Modify: `apps/frontend/src/app/login/page.tsx` (currently `.auth-page`/`.auth-card`/`.auth-header`/`.auth-logo`/`.auth-title`/`.auth-form`/`.auth-btn`/`.auth-footer` — bespoke class family, not in tokens.css)
- Modify: `apps/frontend/src/app/register/page.tsx` (same bespoke class family)
- Reference: `.design-bundle/ielts-instructor/project/src/screens-auth.jsx` (`AuthShell`, `LoginScreen`, `RegisterScreen`)

- [ ] **Step 1: Read both current page files in full** (needed before editing — preserve existing form validation, submit handlers, error states, i18n keys)

- [ ] **Step 2: Replace `.auth-*` classes with tokens.css primitives per `AuthShell`/`LoginScreen`**

Use `.card`/`.card-pad` for the auth card, `.field`/`.field-label`/`.input` for form fields, `.btn`/`.btn-primary`/`.btn-lg` for the submit button, `.page-title`/`.page-subtitle` for the heading block. Keep the centered-card layout pattern from `AuthShell`.

- [ ] **Step 3: Same for register**, including the placement-test prompt fragment noted in `screens-auth.jsx:111,121` (informational copy only — no placement test screen is being built per the out-of-scope note above).

- [ ] **Step 4: Delete now-orphaned `.auth-*` CSS rules from `globals.css`**

Grep confirms no other file uses `.auth-*` before deleting (login/register are the only consumers per the audit).

- [ ] **Step 5: Verify**

`npm run dev`, visually compare `/login` and `/register` against `LoginScreen`/`RegisterScreen` in the mockup. Confirm form submission still works (existing auth flow, not touched).

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/app/login apps/frontend/src/app/register apps/frontend/src/app/globals.css
git commit -m "feat(design): migrate auth pages to tokens.css"
```

---

## Phase 2: Dashboard (Learner / Instructor / Admin)

### Task 2.1: Rewrite `dashboard/page.tsx`

**Files:**
- Modify: `apps/frontend/src/app/dashboard/page.tsx` (currently `.stat-card`/`.stats-grid`/`.stat-card-label`/`.stat-card-value`/`.btn-primary`/`.btn-secondary`, dispatches `LearnerDashboard`/`InstructorDashboard`/`AdminDashboard` internally at lines ~105/252/299 per role check at ~346-348)
- Reference: `.design-bundle/ielts-instructor/project/src/screens-learner.jsx` (`Sparkline`, `BarChart`, `RadarChart`, `LearnerDashboard`)
- Reference: `.design-bundle/ielts-instructor/project/src/screens-staff.jsx` (`InstructorDashboard`, `AdminDashboard`)

- [ ] **Step 1: Read the current file in full** — it's large (3 role-variants in one file); understand the existing data-fetching per role before touching markup.

- [ ] **Step 2: Migrate the Learner variant**

Replace `.stats-grid`/`.stat-card` with tokens.css `.grid.g-16` + `.card` + `.stat`/`.stat-label`/`.stat-value`/`.stat-unit`/`.stat-delta`. Port the `Sparkline`/`BarChart`/`RadarChart` SVG components from `screens-learner.jsx` verbatim (they're presentational, no data-fetching inside) — wire them to the existing chart data already computed in the current dashboard code.

- [ ] **Step 3: Migrate the Instructor variant** per `InstructorDashboard` in `screens-staff.jsx`, same card/stat primitives.

- [ ] **Step 4: Migrate the Admin variant** per `AdminDashboard` in `screens-staff.jsx`.

- [ ] **Step 5: Verify**

Log in as each of the 3 roles (or mock role state), confirm each dashboard variant renders correctly with real data plugged into the new chart components.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/app/dashboard
git commit -m "feat(design): migrate dashboard (learner/instructor/admin) to tokens.css"
```

---

## Phase 3: Reading module

### Task 3.1: Reading list

**Files:**
- Modify: `apps/frontend/src/app/reading/page.tsx` (currently plain Tailwind: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`, `text-3xl font-bold text-gray-900` — zero custom classes)
- Reference: `.design-bundle/ielts-instructor/project/src/screens-reading.jsx` (`ReadingList`)

- [ ] **Step 1: Read current file in full.**
- [ ] **Step 2: Replace Tailwind utility soup with `.content` wrapper, `.page-title`/`.page-subtitle`, `.card` list items, `.badge` for difficulty/status tags, `.btn-primary` CTA** per `ReadingList` layout.
- [ ] **Step 3: Verify** — `npm run dev`, `/reading` matches mockup.
- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app/reading/page.tsx
git commit -m "feat(design): migrate reading list to tokens.css"
```

### Task 3.2: Reading test-taking + results (`[id]/page.tsx`)

**Files:**
- Modify: `apps/frontend/src/app/reading/[id]/page.tsx` (currently `.rp-*` family + `.page-title` + `.app-loading-spinner`)
- Reference: `.design-bundle/ielts-instructor/project/src/screens-reading.jsx` (`ReadingTest`)
- Reference: `.design-bundle/ielts-instructor/project/src/screens-results.jsx` (`ReadingResults`)
- Reference (already-implemented pattern per CLAUDE.md): `.test-head`/`.test-body`/`.test-passage`/`.test-questions`/`.test-footer`/`.q-pal`/`.q-pal-cell` — these tokens.css classes are the exact ones CLAUDE.md's "Reading test page" section already describes as scoped custom CSS; check whether this file already implements the intended layout and just needs class-name/variable alignment rather than a structural rewrite.

- [ ] **Step 1: Read current file in full**, including `stripOptionPrefix`/`extractGroupInstruction` helpers at the top (per CLAUDE.md — do not remove, they handle the `group_instruction` backend quirk).
- [ ] **Step 2: Align practice-mode + simulation-mode markup to `.test-head`/`.test-body`/`.test-passage`/`.test-questions`/`.test-footer`/`.q-pal-cell`** classes already defined in tokens.css (imported in Task 0.2) — per CLAUDE.md, avoid adding `:first-letter` drop-cap rules if they were previously flagged as "looks bad for IELTS reading"; confirm with a visual check before keeping tokens.css's `.passage-body p:first-letter` rule (it's in tokens.css by default — evaluate, don't blindly keep).
- [ ] **Step 3: Migrate `ReadingResults` portion** to `.card`/`.stat`/`.badge` per `screens-results.jsx`.
- [ ] **Step 4: Verify** — take a real reading test end-to-end in the browser (practice + simulation mode), confirm PDF iframe and HTML passage rendering both still work (CLAUDE.md notes both passage types exist).
- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/app/reading/[id]/page.tsx
git commit -m "feat(design): migrate reading test + results to tokens.css"
```

### Task 3.3: Reading history

**Files:**
- Modify: `apps/frontend/src/app/reading/history/page.tsx` (currently `.page-title`/`.empty-state`/`.data-table-wrapper`/`.data-table`/`.pagination`)

- [ ] **Step 1: Read current file.**
- [ ] **Step 2: Replace `.data-table` with tokens.css `.table`, keep `.empty-state`/`.pagination` if not redefined by tokens.css (tokens.css has no `.empty-state`/`.pagination` — these stay as-is, only their surrounding container classes change to `.card`).**
- [ ] **Step 3: Verify + Commit** (same pattern as above)

```bash
git add apps/frontend/src/app/reading/history/page.tsx
git commit -m "feat(design): migrate reading history to tokens.css table"
```

---

## Phase 4: Writing module

### Task 4.1: Writing list

**Files:** `apps/frontend/src/app/writing/page.tsx` (`.page-title`/`.filters-row`/`.filter-select`/`.content-card*`)
**Reference:** `screens-writing.jsx` (`WritingList`)

- [ ] Read file, replace `.content-card` → `.card`, `.filter-select` → `.select`, verify, commit.

```bash
git add apps/frontend/src/app/writing/page.tsx
git commit -m "feat(design): migrate writing list to tokens.css"
```

### Task 4.2: Writing editor

**Files:** `apps/frontend/src/app/writing/[id]/page.tsx` (post-Task-0.1 cleanup, only the Sprint-3 `.writing-*` block remains)
**Reference:** `screens-writing.jsx` (`WritingEditor`)

- [ ] Read file, replace `.writing-prompt-card` → `.card`, `.essay-textarea` → `.textarea`, keep word-count/model-tier badges but restyle with `.badge`, verify against mockup, commit.

```bash
git add apps/frontend/src/app/writing/[id]/page.tsx
git commit -m "feat(design): migrate writing editor to tokens.css"
```

### Task 4.3: Writing history + submission detail

**Files:**
- `apps/frontend/src/app/writing/history/page.tsx` (`.data-table` family — same pattern as Task 3.3)
- `apps/frontend/src/app/writing/submissions/[id]/page.tsx` (`.result-card`/`.error-text`/`.submission-pending`/`.scoring-spinner`)
**Reference:** `screens-results.jsx` (`WritingHistory`)

- [ ] Read both files, migrate history table same as Task 3.3, migrate submission detail's `.result-card` → `.card` + `.stat` for the 4 IELTS criteria scores (TR/CC/LR/GRA), keep loading/error state components structurally but restyle. Verify + commit.

```bash
git add apps/frontend/src/app/writing/history apps/frontend/src/app/writing/submissions
git commit -m "feat(design): migrate writing history + submission detail to tokens.css"
```

---

## Phase 5: Classrooms module

No mockup exists for `edit`/`members`/`progress`/`lessons/[lessonId]`/`new` — these get tokens.css primitives applied consistently without a reference screen; keep existing structure/logic, only swap classes.

### Task 5.1: Classrooms list

**Files:** `apps/frontend/src/app/classrooms/page.tsx` (`.app-loading`/`.page-title`/`.content-card`/`.empty-state`)
**Reference:** `screens-classroom.jsx` (`ClassroomsList`)

- [ ] Read, migrate `.content-card` → `.card`, verify, commit.

### Task 5.2: Classroom detail

**Files:** `apps/frontend/src/app/classrooms/[id]/page.tsx` (currently plain Tailwind — `flex pt-20 justify-center`, `container mx-auto px-4 py-8 max-w-7xl`, zero custom classes)
**Reference:** `screens-classroom.jsx` (`ClassroomDetail`)

- [ ] Read, rebuild with `.content`/`.card`/`.tabs`(if the detail page has tabbed sections)/`.table` per mockup, verify, commit.

### Task 5.3: Classroom edit / members / progress / lessons / new / join (no mockup)

**Files:**
- `apps/frontend/src/app/classrooms/[id]/edit/page.tsx`
- `apps/frontend/src/app/classrooms/[id]/members/page.tsx`
- `apps/frontend/src/app/classrooms/[id]/progress/page.tsx`
- `apps/frontend/src/app/classrooms/[id]/lessons/[lessonId]/page.tsx`
- `apps/frontend/src/app/classrooms/new/page.tsx` (currently inline `style={{maxWidth:720}}`, no classes at all)
- `apps/frontend/src/app/classrooms/join/[code]/page.tsx`

- [ ] Read each file. Apply `.content` wrapper, `.page-title`, `.card`/`.card-pad` for forms, `.field`/`.input`/`.select`/`.textarea` for form fields, `.table` for any member/progress lists, `.btn`/`.btn-primary` for actions — consistent with the primitives established in Tasks 5.1/5.2, since no literal mockup exists. One commit per file (6 separate small commits, not one giant one — keeps each reviewable).

```bash
# repeat per file:
git add apps/frontend/src/app/classrooms/<path>/page.tsx
git commit -m "feat(design): migrate classroom <name> page to tokens.css"
```

- [ ] **Verify all classroom sub-routes** end-to-end (create classroom → join via code → view members → edit → view progress → open a lesson) — this module has the most routes with zero prior styling pass, highest regression risk.

---

## Phase 6: Admin & Instructor CRUD

Covers passages + prompts (list/detail/edit/new/upload for both `admin/` and `instructor/` variants — note these appear to be parallel route trees serving the same features per-role; confirm during Step 1 whether they share a component or are truly duplicated).

### Task 6.1: Passages & Prompts list pages (already have custom classes)

**Files:**
- `apps/frontend/src/app/admin/passages/page.tsx`, `apps/frontend/src/app/instructor/passages/page.tsx`
- `apps/frontend/src/app/admin/prompts/page.tsx`, `apps/frontend/src/app/instructor/prompts/page.tsx`
**Reference:** `screens-misc.jsx` (`PromptsAdmin`, `PassagesList`)

- [ ] Read all 4, migrate `.page-title`/`.btn`/`.empty-state` to tokens.css equivalents (`.btn` classes are already named the same in both systems — verify tokens.css `.btn-primary`/`.btn-secondary` visually match before assuming no change needed). Verify, commit (can be one commit if truly near-identical files, otherwise one per pair).

### Task 6.2: Passages & Prompts detail/edit/new/upload (currently plain Tailwind, zero custom classes)

**Files:**
- `admin/passages/[id]/page.tsx`, `admin/passages/[id]/edit/page.tsx`, `admin/passages/new/page.tsx`, `admin/passages/upload/page.tsx`
- `instructor/passages/[id]/page.tsx`, `instructor/passages/[id]/edit/page.tsx`, `instructor/passages/new/page.tsx`, `instructor/passages/upload/page.tsx`
- `admin/prompts/[id]/edit/page.tsx`, `admin/prompts/new/page.tsx`
- `instructor/prompts/[id]/edit/page.tsx`, `instructor/prompts/new/page.tsx`

No design-bundle mockup covers editor/create screens (audit confirmed `screens-misc.jsx` only has list screens). Apply the same form primitives as Task 5.3 (`.card-pad`/`.field`/`.input`/`.textarea`/`.btn-primary`) for consistency.

Per CLAUDE.md: `admin/passages/upload/page.tsx` uses `<TestRunner>` → `<PassageViewer>` (a separate Tailwind-styled component in `apps/frontend/src/components/reading/PassageViewer.tsx`) — check whether `PassageViewer` should also migrate or intentionally stays Tailwind as a "preview widget" distinct from the app chrome; ask before changing it blindly since CLAUDE.md explicitly calls out this file as an existing, deliberate exception to the "don't mix styling systems" rule.

- [ ] Read each file (12 files), apply consistent primitives, verify each renders + existing upload/parse flows still work (these pages have real upload logic — don't just restyle blindly, re-test the docx/pdf upload path per file per CLAUDE.md's upload pipeline). One commit per logical group (passages-admin, passages-instructor, prompts-admin, prompts-instructor — 4 commits).

### Task 6.3: Admin Users, Instructor Learners, Instructor Submissions (list + review)

**Files:**
- `apps/frontend/src/app/admin/users/page.tsx` (`.page-title`/`.filters-row`/`.filter-input/-select`/`.empty-state`)
- `apps/frontend/src/app/instructor/learners/page.tsx` (same family)
- `apps/frontend/src/app/instructor/submissions/page.tsx` (`.page-title`/`.tab-bar`/`.empty-state`/`.data-table-wrapper`/`.data-table`)
- `apps/frontend/src/app/instructor/submissions/[id]/page.tsx` (`.app-loading`/`.empty-state`/`.page-title`/`.form-card`)
**Reference:** `screens-misc.jsx` (`UsersAdmin`, `LearnersPage`, `SubmissionsList`), `screens-staff.jsx` (`SubmissionReview`)

- [ ] Read all 4, migrate `.filter-input`/`.filter-select` → `.input`/`.select`, `.data-table` → `.table`, `.tab-bar` → `.tabs`/`.tab`, `.form-card` → `.card`. Verify submission review page's score-editing form still submits correctly (real business logic — GV override scores). Commit per file.

---

## Phase 7: Settings + remaining pages

### Task 7.1: Settings

**Files:** `apps/frontend/src/app/settings/page.tsx` (`.settings-page`/`.settings-section`/`.settings-section-title`/`.settings-row`)
**Reference:** `screens-misc.jsx` (`SettingsPage`)

- [ ] Read, migrate to `.card`/`.tabs` (if sectioned) + `.field`/`.input`, verify, commit.

### Task 7.2: Any `.../new` pages not yet covered

**Files:** `admin/prompts/[id]/edit/page.tsx` and `instructor/prompts/[id]/edit/page.tsx` if not already done in Task 6.2 (audit flagged these as "custom classes (partial)" — re-check during execution which ones still need work after Phase 6 lands).

---

## Phase 8: Cleanup & final verification

### Task 8.1: Delete every retired old-system CSS rule from `globals.css`

**Files:** `apps/frontend/src/app/globals.css`

- [ ] **Step 1: Grep for each old class family** (`page-title` already migrated by tokens.css itself so skip; `content-card`, `stat-card`, `stats-grid`, `data-table`, `filters-row`, `filter-input`, `filter-select`, `rp-*`, `settings-*`, `form-card`, `tab-bar`) across `apps/frontend/src` — confirm zero remaining usages (Phases 1-7 should have migrated every consumer).
- [ ] **Step 2: Delete the corresponding dead rule blocks** from `globals.css` for each class confirmed unused.
- [ ] **Step 3: Verify** — full `npm run build`, then click through every route in the app (or run existing e2e/smoke tests if any exist under `apps/frontend`) to confirm nothing silently broke.
- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app/globals.css
git commit -m "chore(css): remove retired pre-tokens.css classes after full migration"
```

### Task 8.2: Update CLAUDE.md

**Files:** `CLAUDE.md` (repo root)

- [ ] Update the "Frontend styling" convention line and the reading-test CSS reference (currently says "line 944+" — will have shifted after this plan's edits) to reflect the new single design system and correct line numbers. Commit alone.

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md styling conventions for tokens.css adoption"
```

---

## Execution Summary

9 phases (0-8), ~25 tasks, one PR-sized branch per phase recommended (`feat/tokens-phase-0-foundation`, `feat/tokens-phase-1-auth`, ... merging each into `development` per the repo's new branch strategy) rather than one giant branch — phases 3-6 alone touch ~20 files and should not land as a single unreviewable diff.

**Sequencing constraint:** Phase 0 must land and be merged before any other phase starts (later phases depend on the token variables and shell existing). Phases 1-7 are otherwise independent of each other and can be parallelized across sessions/agents. Phase 8 must be last.
