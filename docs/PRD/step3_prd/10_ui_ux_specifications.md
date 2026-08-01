# 🎨 UI/UX Specifications — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-10  
> **Phiên bản:** 1.1  
> **Ngày tạo:** 2025-02-21  
> **Cập nhật:** 2026-04-14  
> **Trạng thái:** Draft  
> **Tham chiếu:** [03_user_personas_roles](03_user_personas_roles.md) | [04_user_stories](04_user_stories.md)
>
> **Changelog:**
> - v1.1 (2026-04-14): Đổi Import Modal từ NotebookLM URL → DOCX/PDF file upload. Cập nhật nav tree, modal trigger label, section 4.11.

---

## 1. Design System

### 1.1 Color Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--bg-primary` | `#FFFFFF` | `#1A1A2E` | Main background |
| `--bg-secondary` | `#F5F5F5` | `#16213E` | Card backgrounds, sidebars |
| `--bg-tertiary` | `#E8E8E8` | `#0F3460` | Hover states, borders |
| `--text-primary` | `#1A1A2E` | `#E8E8E8` | Main text |
| `--text-secondary` | `#6B7280` | `#9CA3AF` | Subtitles, labels |
| `--text-muted` | `#9CA3AF` | `#6B7280` | Hints, placeholders |
| `--accent-primary` | `#3B82F6` | `#60A5FA` | Buttons, links, active states |
| `--accent-success` | `#10B981` | `#34D399` | Correct answers, high scores (>6) |
| `--accent-warning` | `#F59E0B` | `#FBBF24` | Medium scores (5–6), warnings |
| `--accent-danger` | `#EF4444` | `#F87171` | Wrong answers, low scores (<5), errors |
| `--accent-info` | `#6366F1` | `#818CF8` | Tips, informational badges |
| `--border` | `#E5E7EB` | `#374151` | Borders, dividers |

### 1.2 Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-family` | `'Inter', -apple-system, sans-serif` | All text |
| `--heading-1` | `28px / 700 / 1.3` | Page titles |
| `--heading-2` | `22px / 600 / 1.4` | Section titles |
| `--heading-3` | `18px / 600 / 1.4` | Card titles |
| `--body` | `16px / 400 / 1.6` | Paragraphs, passage text |
| `--body-small` | `14px / 400 / 1.5` | Labels, secondary info |
| `--caption` | `12px / 400 / 1.5` | Timestamps, hints |
| `--mono` | `'JetBrains Mono', monospace / 14px` | Scores, code, timer |

### 1.3 Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Inline spacing |
| `--space-2` | `8px` | Tight gaps |
| `--space-3` | `12px` | Default gap |
| `--space-4` | `16px` | Card padding |
| `--space-6` | `24px` | Section spacing |
| `--space-8` | `32px` | Page margins |
| `--space-12` | `48px` | Section dividers |

### 1.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Inputs, badges |
| `--radius-md` | `8px` | Cards, buttons |
| `--radius-lg` | `12px` | Modals, panels |
| `--radius-full` | `9999px` | Avatars, pills |

### 1.5 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards in light mode |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns, modals |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Popovers |

---

## 2. Component Library

### 2.1 Buttons

| Variant | Usage | States |
|---------|-------|--------|
| Primary | Main actions (Submit, Save, Publish) | default, hover, active, disabled, loading |
| Secondary | Secondary actions (Cancel, Back) | default, hover, active, disabled |
| Danger | Destructive actions (Delete, Unpublish) | default, hover with confirm dialog |
| Ghost | Tertiary actions (filters, toggles) | default, hover |
| Icon | Compact actions (theme toggle, settings) | default, hover, active |

### 2.2 Form Inputs

| Component | Usage | States |
|-----------|-------|--------|
| Text Input | Email, display name, search | default, focus, error, disabled |
| Password Input | Login/register password | with show/hide toggle |
| Textarea | Essay editor, passage body | with char/word counter |
| Select/Dropdown | Level, task type, role | single-select; filterable for tags |
| Multi-select Tag Input | Topic tags | add/remove tags; autocomplete |
| Radio Group | MCQ answers | default, selected, correct, incorrect |
| Toggle Switch | Dark/light, vi/en, publish | on/off with smooth transition |

### 2.3 Data Display

| Component | Usage |
|-----------|-------|
| Card | Passage list item, prompt list item, dashboard metric |
| Table | Admin lists (passages, users, submissions) |
| Badge | Level (A2–C1), status (draft/published), task type |
| Score Bar | Writing criterion scores (0–9) with color fill |
| Progress Ring | Reading completion %, dashboard overview |
| Stat Card | Dashboard KPI (number + label + trend arrow) |
| Timeline | Recent submissions list |

### 2.4 Feedback & Overlay

| Component | Usage |
|-----------|-------|
| Toast | Success/error notifications (auto-dismiss 5s) |
| Skeleton | Loading state for lists and cards |
| Spinner | Loading state for form submissions |
| Progress Bar | Scoring in progress (indeterminate) |
| Empty State | No data (illustration + message + CTA) |
| Confirm Dialog | Destructive actions (delete, log out) |
| Modal | Import DOCX/PDF, create content |
| Mode Selector | Practice vs Simulation mode modal (S22) |

### 2.5 Navigation

| Component | Usage |
|-----------|-------|
| Sidebar Nav | Main navigation (desktop): Dashboard, Reading, Writing, Admin |
| Bottom Nav | Mobile navigation: same items as sidebar |
| Breadcrumb | Context trail (Admin > Passages > Edit "Climate Change") |
| Tabs | Sub-navigation within pages (e.g., History tabs) |
| Header | Logo, user menu, theme toggle, language toggle |

---

## 3. Sitemap

```
IELTS Helper
├── 🔐 /login ........................ Login page
├── 📝 /register ..................... Register page
├── 📊 /dashboard .................... Learner dashboard
│   ├── Progress summary cards
│   ├── Recent submissions
│   └── Trend charts
├── 📖 /reading ...................... Reading practice
│   ├── /reading ..................... Passage catalog (list + filters)
│   ├── /reading/:id ................ Passage detail + questions + timer
│   ├── /reading/:id/result/:subId .. Submission result (score + explanations)
│   └── /reading/history ............ Reading attempt history
├── ✍️ /writing ...................... Writing practice
│   ├── /writing ..................... Prompt catalog (list + filters)
│   ├── /writing/:id ................ Prompt + essay editor
│   ├── /writing/submissions/:id .... Submission detail (scores + feedback)
│   └── /writing/history ............ Writing submission history
├── ⚙️ /settings ..................... Profile settings
│   ├── Display name
│   ├── Language toggle (vi/en)
│   └── Theme toggle (dark/light)
├── 🔧 /admin ....................... Admin CMS (admin role only)
│   ├── /admin/passages ............. Passage management
│   │   ├── /admin/passages/new ..... Create passage + questions
│   │   └── /admin/passages/:id ..... Edit passage + questions
│   ├── /admin/prompts .............. Prompt management
│   │   ├── /admin/prompts/new ...... Create prompt
│   │   └── /admin/prompts/:id ...... Edit prompt
│   ├── /admin/sources .............. Imported sources
│   │   └── /admin/sources/import ... Upload DOCX/PDF (Gemini parser)
│   ├── /admin/users ................ User management
│   ├── /admin/stats ................ Usage statistics
├── 👨‍🏫 /instructor ................... Instructor panel (instructor role)
│   ├── /instructor/writing-submissions  Learner submission list
│   └── /instructor/writing-submissions/:id  Review + override
├── 🏫 /classrooms .................... Classroom management
│   ├── /classrooms ................... My classrooms (owned + joined)
│   ├── /classrooms/new ............... Create new classroom
│   ├── /classrooms/:id ............... Classroom detail (Tabs: Syllabus | Announcements + Lesson Viewer)
│   ├── /classrooms/:id/edit .......... Edit classroom settings
│   ├── /classrooms/:id/members ....... Members management + invite modal
│   ├── /classrooms/:id/progress ...... Student progress tracking (instructor)
│   └── /classrooms/join/:code ........ Join classroom (invite landing page)
└── 🚫 /404 ......................... Not found page
```

---

## 4. Page Specifications

### 4.1 Login Page

| Element | Spec |
|---------|------|
| Layout | Centered card (max-width 400px) on gradient background |
| Fields | Email input, Password input (with show/hide), Login button |
| Links | "Don't have an account? Register" → /register |
| Error | Inline error message below form |
| i18n | Language toggle in top-right corner |

### 4.2 Dashboard Page

| Element | Spec |
|---------|------|
| Layout | 2-column grid (cards); 1-column on mobile |
| Section 1 | Reading stat card (avg score, completion rate, total) |
| Section 2 | Writing stat card (avg scores per criterion, total) |
| Section 3 | Recent submissions (timeline list, 10 items) |
| Section 4 | Trend chart (line chart, 4-week default) |
| Empty state | "Welcome! Start your first practice →" buttons to Reading/Writing |
| CTA buttons | "Practice Reading" / "Practice Writing" |

### 4.3 Reading Catalog

| Element | Spec |
|---------|------|
| Layout | Stacked sections grouped by Collection (e.g. "IELTS Mock Test 2025"). Inside each group: Grid of cards (3 per row desktop, 1 mobile) |
| Card | Title (e.g. "January Practice Test 1"), level badge, topic tags, question count, source icon |
| Filters bar | Collection dropdown, Level dropdown, topic search, sort dropdown |
| Social proof | Submission count badge per card: "✅ X lượt thi" (IOT-inspired) |
| Pagination | Infinite scroll or pagination at bottom |

### 4.4 Reading Practice (passage detail)

| Element | Spec |
|---------|------|
| Layout | Split view (desktop): passage left (60%), questions right (40%). Stacked on mobile. |
| Passage pane | Scrollable text with heading-3 title |
| Questions pane | Scrollable list; each question:—MCQ = radio group; short = text input |
| Timer | Pinned at top; mm:ss; dropdown presets (5/10/15/20/30/60/no timer) |
| Progress | "8/13 answered" badge; turns green when ≥80% |
| Submit button | Bottom-right; disabled until ≥80% answered; loading state on click |
| Timer warning | Background pulse red animation when < 3 min |

### 4.4b Mode Selector Modal (IOT-inspired)

| Element | Spec |
|---------|------|
| Layout | Centered modal (max-width 500px); two cards side by side |
| Practice card | Icon 📝, title "Practice", bullets: no timer, choose parts, pause/resume, Start button |
| Simulation card | Icon 🎯, title "Simulation", bullets: 60 min timer, full test, auto-submit, Start button |
| Cancel | "✕ Cancel" link below cards |

### 4.5 Reading Results

| Element | Spec |
|---------|------|
| Score header | Large score (e.g., "77%") + correct count (10/13) + duration + timed_out badge |
| Question list | Each question: number, prompt, your answer, correct answer, ✅/❌, expandable explanation |
| Actions | "Retry" button, "Back to catalog" link, "View History" link |

### 4.6 Writing Prompt + Editor

| Element | Spec |
|---------|------|
| Layout | Split: prompt (left 40%), editor (right 60%). Stacked on mobile. |
| Prompt pane | Task type badge, title, full prompt text, min words hint |
| Editor pane | Textarea (min-height 400px); live word count below |
| Word count | Format: "267 words" → green if ≥ min, red if < min |
| Model tier | Small dropdown near Submit: "Standard" / "Premium" |
| Submit button | Primary button; disabled when empty; loading state |
| Rate limit | Show remaining submissions: "3 of 10 remaining today" |

### 4.7 Writing Scoring Progress

| Element | Spec |
|---------|------|
| Layout | Centered card replacing editor after submit |
| Content | Animated progress bar (indeterminate); "Scoring your essay..." text |
| Timer | Elapsed time display: "Processing... (00:24)" |
| Estimated | "Usually takes 1–3 minutes" |

### 4.8 Writing Feedback

| Element | Spec |
|---------|------|
| Score panel | 4 horizontal bars: TR, CC, LR, GRA (each 0–9 with color fill) + overall score large |
| Color coding | < 5.0 = red / 5.0–6.0 = yellow / > 6.0 = green |
| Summary | 1–3 sentence summary paragraph |
| Strengths | Green checklist items (bullet points) |
| Improvements | Orange/red checklist items with suggestions |
| Metadata | Model used, turnaround time, word count |
| Actions | "Write Again" button, "View History" link |

### 4.8b Instructor Review Page (Sprint 5)

| Element | Spec |
|---------|------|
| Layout | Split view: AI scores + override panel (left 35%), Essay content (right 65%) |
| AI Scores | 4 score bars (TR/CC/LR/GRA) + overall; read-only |
| Override panel | Number input (0–9) for override score; textarea for instructor comment |
| Actions | "Save Review" button; "Back to list" link |
| History | Show original AI score preserved even after override |

### 4.9 Admin — Content List

| Element | Spec |
|---------|------|
| Layout | Full-width table |
| Columns | Title, Level, Tags, Status (badge), Questions Count, Submissions, Updated |
| Actions | Edit, Publish/Unpublish toggle, Delete |
| Filters | Level dropdown, status dropdown, search bar |
| CTA | "Create Passage" / "Create Prompt" button (top-right) |

### 4.10 Admin — Content Form

| Element | Spec |
|---------|------|
| Layout | Form card (max-width 800px centered) |
| Passage fields | Title input, Body textarea (tall), Level dropdown, Tags multi-select |
| Questions section | Accordion/list; each question: type toggle, prompt, options (MCQ), answer_key, explanation |
| Add question | "+" button to add question to passage |
| Sources section | Attached sources with "Search & attach" autocomplete |
| Actions | Save (draft), Publish, Cancel |

### 4.11 Admin — DOCX/PDF Import Modal

| Element | Spec |
|---------|------|
| Trigger | "Upload DOCX/PDF" button in sources section |
| Modal content | File picker (accept `.docx,.pdf`, max 10MB), Title input, Tags multi-select, Level dropdown |
| Parse button | Primary; loading state with progress indicator during Gemini call (~5–15s) |
| Success | Preview panel: parsed passage body (sanitized HTML) + extracted questions (by type). Buttons: "Save as Draft", "Discard" |
| Error | Inline error (unsupported type / file too large / parse failure) with retry option |

---

## 5. Responsive Behavior

| Breakpoint | Layout Changes |
|------------|---------------|
| **Mobile (360–767px)** | Single column; stacked reading passage/questions; bottom nav; collapsible filters; full-width cards |
| **Tablet (768–1023px)** | Two-column where useful; sidebar collapses to hamburger; medium cards |
| **Desktop (1024–1440px)** | Full split views; persistent sidebar; 3-column card grids; full tables |
| **Wide (>1440px)** | Content max-width 1440px centered; extra padding |

---

## 6. Animation & Transitions

| Element | Animation | Duration |
|---------|-----------|----------|
| Theme toggle | Smooth color transition | 200ms |
| Page transitions | Fade in | 200ms |
| Card hover | Subtle lift (translateY -2px) + shadow | 150ms |
| Toast | Slide in from top-right + fade out | 300ms in / 200ms out |
| Skeleton loader | Shimmer animation | Continuous |
| Score bars | Width fill from 0 → value | 800ms ease-out |
| Submit loading | Spinner rotation | Continuous |
| Timer warning | Background pulse | 1s interval |
| Modal | Fade + scale (0.95 → 1) | 200ms |

---

## 7. Accessibility Requirements

| Aspect | Requirement |
|--------|-------------|
| Keyboard nav | All interactive elements reachable via Tab; Enter/Space to activate |
| Focus indicators | Visible outline (2px solid accent-primary) on focus |
| ARIA labels | All icon buttons have aria-label; form fields have aria-describedby for errors |
| Color contrast | ≥ 4.5:1 for normal text; ≥ 3:1 for large text |
| Screen reader | Semantic HTML (nav, main, header, section); role attributes where needed |
| Reduced motion | Respect prefers-reduced-motion: disable animations |
| Error announcements | aria-live="polite" for toast notifications |

---

## 8. Loading & Error State Matrix

| Page | Loading State | Empty State | Error State |
|------|--------------|-------------|-------------|
| Catalog (Reading/Writing) | Skeleton grid (6 cards) | "No passages found..." + CTA | Toast + retry |
| Passage Detail | Skeleton (left pane + right pane) | N/A (404 redirect) | 404 page |
| Submit (Reading) | Button spinner; disabled | N/A | Inline error + toast |
| Submit (Writing) | Progress card; poll indicator | N/A | "Scoring failed" + retry button |
| Dashboard | Skeleton cards | "Welcome!" + practice CTAs | Toast |
| Admin Lists | Skeleton table rows | "No content yet" + create CTA | Toast + retry |
| Import Modal | Button spinner | N/A | Inline error in modal |
| My Classrooms | Skeleton grid (4 cards) | "No classrooms yet" + create CTA | Toast + retry |
| Classroom Detail | Skeleton sidebar + main | N/A (404 redirect) | 404 page |
| Members List | Skeleton table rows | "No members yet" | Toast |
| Join Classroom | Button spinner | N/A | Inline error (full/invalid code) |

---

## 9. Classroom Screens

### S30 — My Classrooms (`/classrooms`)

| Element | Spec |
|---------|------|
| Layout | Grid 3 columns (responsive) |
| Card | Cover image (150px) + name + member count + role badge ("Owner" / "Student") |
| Actions (Owner) | Edit, Archive |
| Actions (All) | Click → Classroom Detail |
| FAB | "+ Tạo lớp mới" (only instructor/admin) |
| Empty state | "Bạn chưa có lớp nào. Tạo lớp mới hoặc tham gia lớp qua mã mời." |

### S31 — Create / Edit Classroom (`/classrooms/new`, `/classrooms/:id/edit`)

| Element | Spec |
|---------|------|
| Form fields | name (required), description (textarea), cover_image_url, max_members |
| Buttons | Save (primary), Cancel (secondary) |
| Redirect | On success → `/classrooms/:id` |

### S32 — Classroom Detail (`/classrooms/:id`)

| Element | Spec |
|---------|------|
| Header | Classroom name + description + member count + status badge |
| Sidebar | Topics list (accordion/collapsible) with + button to create Topic |
| Main panel | Selected Topic's Lessons list |
| Owner bar | "Invite" (modal), "Members" (link), "Edit" (link), "Archive" (button) |
| Lesson card | Title + content_type badge + status indicator + link to view |

### S33 — Invite Modal

| Element | Spec |
|---------|------|
| QR Code | Generated from invite_url, 200x200px |
| Invite link | Text field with "Copy" button |
| Invite code | Display the 8-char code |
| Regenerate button | "Tạo mã mới" with confirm dialog |

### S34 — Members List (`/classrooms/:id/members`)

| Element | Spec |
|---------|------|
| Table columns | Avatar, Display Name, Email, Role (teacher/student), Joined Date, Actions |
| Actions (Owner) | Remove button (with confirm) |
| Add member | Text input (email) + "Thêm" button |

### S35 — Join Classroom (`/classrooms/join/:code`)

| Element | Spec |
|---------|------|
| Layout | Centered card |
| Content | Classroom name, description, member count, "Tham gia" button |
| Auth guard | If not logged in → redirect to login → return |
| Error states | "Lớp đã đầy", "Mã không hợp lệ", "Bạn đã là thành viên" |

### S36 — Lesson View (within Classroom Detail)

| Element | Spec |
|---------|------|
| Layout | Embedded in right panel of Classroom Detail page (not a separate route) |
| Smart Renderer | Tự động hiển thị nội dung theo `content_type`: |
| — `text` | Rendered HTML/Markdown với prose styling |
| — `video` | YouTube/Vimeo iframe embed (auto-detect URL) |
| — `passage`/`prompt` | Launch card với gradient colors, icon, nút "Start Reading" hoặc "Start Writing" |
| Image handling | Nếu `content` đã chứa `<img>`, hiển thị via prose content. Nếu chỉ có `attachment_url` (standalone image), chèn `<img>` riêng với border + shadow |
| Status badge | Published (green) / Draft (yellow) trong header |
| Teacher actions | Edit button, Toggle status (Publish/Draft) |
| View Full Lesson | Button mở `/classrooms/:id/lessons/:lessonId` khi lesson có content hoặc image |

### S36b — Lesson Detail Page (`/classrooms/:id/lessons/:lessonId`)

| Element | Spec |
|---------|------|
| Layout | Full page, max-width 4xl centered |
| Header bar | Sticky: back arrow, lesson title, content_type icon, type badge (Writing/Reading) |
| Image | Standalone image from `attachment_url` (only if content doesn't embed `<img>`); `max-height: 65vh`, border + shadow |
| Content | Rendered HTML via prose styling; `fixContentUrls` converts relative `/uploads/` paths |
| **Essay section** (Writing only) | White card with textarea (12 rows), live word count, submit/check-score buttons |
| Word count | "{N} words" — emerald when ≥150, gray otherwise; "(X more needed)" hint |
| Submit button | Enabled when ≥10 words + `allow_submit = true`; loading state |
| Check Score button | Grayed out "coming soon" when `allow_checkscore = true` |
| **Your Submissions** (Student) | List of own past submissions (newest first); each: status badge (⏳ Submitted / ✓ Graded), time ago, word count, score; expand/collapse to read essay + teacher feedback |
| **Student Submissions** (Teacher) | List of all student submissions; each: avatar + name + email, status, word count, time ago; expand/collapse to read essay |
| Empty state (Teacher) | "No student submissions yet." with file icon |

### S37 — Student Progress (`/classrooms/:id/progress`)

| Element | Spec |
|---------|------|
| Layout | Full page, table layout |
| Header | Classroom name + "Student Progress" title |
| Table columns | Student name, email, joined date, reading count, reading avg, writing count, writing avg, recent activity |
| Empty state | "Chưa có học viên nào trong lớp." |
| Access | Instructor only |

### S38 — Announcements Tab (within Classroom Detail sidebar)

| Element | Spec |
|---------|------|
| Layout | Tab "Announcements" bên cạnh tab "Syllabus" trong sidebar |
| List | Chat-style cards (orange accent) với author name, timestamp |
| Compose | Textarea + Send button (instructor only); Cmd+Enter shortcut |
| Delete | Hover → trash icon (instructor only), confirm dialog |
| Empty state | Megaphone icon + "No announcements yet." |

### S39 — Instructor Dashboard (enhanced)

| Element | Spec |
|---------|------|
| Stats cards | Total Classrooms, Total Students, Pending Reviews (3 stat cards) |
| Quick actions | "Create Classroom" shortcut card, "View Classrooms" link |
| Data source | `GET /dashboard/instructor-stats` |

---

> **Tham chiếu:** [04_user_stories](04_user_stories.md) | [05_functional_requirements](05_functional_requirements.md)

---

# ══════════════════════════════════════════════════════
# BỔ SUNG: UI/UX SPEC MỚI (Design-bundle, 07/2026)
# Tài liệu dưới đây thay thế phần Design System của bản trên
# (đã áp dụng cho code hiện tại — xem tokens-css-adoption.md)
# ══════════════════════════════════════════════════════

# IELTS Instructor — UI/UX Specification

**Version:** 1.0 · **Last updated:** July 2026
**Reference prototype:** `IELTS Instructor Prototype.html`

This document is the design reference for the IELTS Instructor platform. It covers the visual design system, layout patterns, component library, and the full screen inventory across all three user roles (Learner, Instructor, Admin). Use it to keep new screens and engineering handoff consistent with what's already built.

---

## 1. Design Direction

**Aesthetic:** Calm & academic — an editorial "study journal" feel rather than a generic SaaS dashboard. Warm parchment background, indigo/violet accent, restrained use of color and iconography.

**Density:** Compact / information-dense. Base font size 13px, tight line-heights, small paddings (8–16px). Built for power users (learners doing daily practice, instructors triaging queues), not a marketing site.

**Tone of copy:** Encouraging but not saccharine. Section labels use an em-dash prefix ("— Recent activity") and italic serif captions for a journal-like rhythm. Avoid emoji except the 🇻🇳 flag (Vietnamese-language toggle) and sparingly in flashcards.

---

## 2. Design Tokens (`src/tokens.css`)

### 2.1 Typography
| Token | Value | Usage |
|---|---|---|
| `--ff-display` | Inter (headings) | Page titles, section titles — NOT serif despite "editorial" direction; kept sans for consistency with body/UI |
| `--ff-body` | Inter | All body text, inputs, buttons |
| `--ff-mono` | JetBrains Mono | Scores, bands, timers, IDs, IPA transcriptions, metadata |

Font sizes range `--fs-12` (12px) through `--fs-36` (36px). Never go below 12px; mobile hit targets (buttons) are 30–36px tall minimum.

### 2.2 Color
Base palette is **warm parchment + indigo**, defined in OKLCH for perceptual uniformity:

| Token | Light | Role |
|---|---|---|
| `--bg` | `#faf8f4` | Page background (warm off-white) |
| `--bg-sunk` | `#f3efe6` | Recessed panels, table zebra, input backgrounds |
| `--bg-raised` | `#ffffff` | Cards, modals |
| `--ink` / `-2` / `-3` / `-4` / `-5` | `#1a1625` → `#c8c4d0` | Text hierarchy (primary → disabled) |
| `--border` / `--border-strong` | `#e4dfd3` / `#d1cabb` | Hairlines |
| `--primary` | `oklch(0.48 0.18 280)` (indigo) | CTAs, active states, links |
| `--success` / `--warn` / `--danger` | green / amber / red | Status, correctness, scoring |

**Dark mode** (`[data-theme="dark"]`): inverts to inky background `#14121c`, raised `#1c1a26`. All tokens have dark equivalents — never hardcode a light color in a component.

**Tweakable accent** (`[data-color="..."]`): 5 presets — `indigo` (default), `blue`, `warm`, `cool`, `green`. Swaps `--primary`/`--primary-soft`/`--primary-softer` only; never touches neutrals.

### 2.3 Geometry & Elevation
- Radii: `--r-sm` 4px, `--r-md` 6px (default for buttons/inputs), `--r-lg` 10px (cards), `--r-xl` 16px (large panels)
- Shadows are deliberately subtle (`--shadow-sm/md/lg`) — no glow/blur-heavy "AI slop" shadows
- Borders are 1px hairlines, not shadow-only separation

---

## 3. Layout System

### 3.1 App Shell
```
┌─────────────┬──────────────────────────────────────┐
│             │  Topbar (52px): breadcrumb, search,   │
│  Sidebar    │  theme toggle, notifications, tweaks  │
│  (220px,    ├──────────────────────────────────────┤
│  fixed)     │                                        │
│             │  Content (padded 24px/32px, scrolls)   │
│             │                                        │
└─────────────┴──────────────────────────────────────┘
```
- **Sidebar**: logo mark, role-based nav sections ("Workspace" / "Account"), active item gets a 2px left accent bar + soft background, user card pinned to bottom.
- **Topbar**: breadcrumb trail (`Workspace / Reading / Results`), global search with `⌘K` hint, theme toggle, notification bell (with red dot), Tweaks trigger (sparkles icon).
- Nav items and sidebar sections differ per role — see §5.

### 3.2 Full-bleed screens
Certain flows intentionally **escape the app shell** (no sidebar/topbar) because they need full attention and their own header/footer chrome:
- Reading Test, Writing Editor, Listening Test, Speaking Practice
- Passage/Prompt Editor, Assignment Create, Lesson Builder, Announcements Composer
- Submission Review (writing/reading), Bulk Grading
- Mock Test (all stages), Flashcard Drill
- Auth screens (Login, Register, Forgot/Reset Password, Email Verify, Placement Test)

These use a consistent **`.test-head` / content / `.test-footer`** pattern: a 48–52px header bar with Exit/Close on the left, contextual title in the middle, primary actions on the right.

### 3.3 Grid conventions
- Card grids: `repeat(3, 1fr)` for list pages (passages, prompts, classrooms)
- Detail pages: `2fr 1fr` (main content + right rail) or `1.5fr 1fr`
- Split-screen tests: `1fr 1fr` (passage | questions) or `1.3fr 1fr` (essay | feedback)

---

## 4. Component Library

All components are plain CSS classes in `tokens.css` (no CSS-in-JS framework) so they're directly portable to any implementation.

| Component | Class(es) | Notes |
|---|---|---|
| Card | `.card`, `.card-tight`, `.card-pad` | Base surface; tight=12px pad, pad=20px pad |
| Button | `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-lg`, `.btn-sm` | 30px default height, 26px sm, 36px lg |
| Badge | `.badge`, `.badge-primary/success/warn/danger/outline` | Mono font, pill-ish, used for status/counts |
| Level dot | `.level-dot.level-{A2..C2}` | Color-coded CEFR indicator (green→blue→purple) |
| Tag | `.tag` | Italic serif-style, `#`-prefixed topic tags |
| Input/Select/Textarea | `.input`, `.select`, `.textarea` | 32px height, focus ring uses `--primary-softer` |
| Tabs | `.tabs` / `.tab.is-active` | Underline style, used for classroom/lesson sub-views |
| Table | `.table` | Uppercase mono headers, row hover, sticky-left column pattern for gradebooks |
| Progress bar | `.progress` | 4px thin bar, color varies by threshold (success/warn/danger) |
| Stat block | `.stat`, `.stat-label`, `.stat-value` | Editorial numeric display, italic label + large mono/serif number |
| MCQ option | `.mcq-option.is-selected` | Lettered marker + selectable row, used across Reading/Listening/Placement |
| Question palette | `.q-pal-cell.is-answered/.is-current` | Grid of numbered cells for test navigation, flag dot overlay |
| Toggle switch | inline-styled pill (36×20px) | Used in Settings/Notifications — not yet a shared class, kept inline |
| Icon | `<Icon d={Icons.x} size={16} stroke={1.5}/>` | Custom lucide-style stroke icon set in `shell.jsx`, ~35 icons |

---

## 5. Information Architecture (by role)

### 5.1 Learner
Dashboard · Reading (list → preview → test → results → history) · Writing (list → preview → editor → result → history) · Listening (list → preview → test → results) · Speaking (list → preview → practice → result → history) · Classrooms (list → detail → members/progress/lessons) · Progress Analytics · Vocabulary (list → detail → flashcard drill) · AI Tutor · Mock Test (intro → sections → results) · Leaderboard · Settings · Notifications

### 5.2 Instructor
Dashboard · Classrooms (list → create/edit → detail → members/progress) · Lesson Builder · Announcements Composer · Submissions (list → review, bulk grading) · Learners (list → profile) · Gradebook · Assignment Create · Messages · Calendar · Passages/Prompts (shared with Admin views, read/create access)

### 5.3 Admin
Dashboard · Analytics · Passages/Prompts (list → editor with question/rubric builder) · Users (list → detail) · Content Moderation · Roles & Permissions · System Settings · Audit Log

### 5.4 Shared / cross-cutting
Login · Register · Placement Test · Welcome Tour · Forgot/Reset Password · Email Verification · Settings (Profile/Preferences/Notifications/Goals/Security tabs) · Search Results · 404/Empty/Error states

---

## 6. Screen Inventory

Legend: 🟢 built in prototype · 🟡 partially specified / stub · ⚪ not yet designed

| # | Screen | Role(s) | Status | File |
|---|---|---|---|---|
| 1 | Login | All | 🟢 | screens-auth.jsx |
| 2 | Register (+ level picker) | Learner | 🟢 | screens-auth.jsx |
| 3 | Forgot Password | All | 🟢 | screens-auth2.jsx |
| 4 | Reset Sent / Reset Password | All | 🟢 | screens-auth2.jsx |
| 5 | Email Verification | Learner | 🟢 | screens-auth2.jsx |
| 6 | Placement Test | Learner | 🟢 | screens-onboarding.jsx |
| 7 | Welcome Tour (tooltip overlay) | Learner | 🟢 | screens-auth2.jsx |
| 8 | Learner Dashboard | Learner | 🟢 | screens-learner.jsx |
| 9 | Reading List | Learner | 🟢 | screens-reading.jsx |
| 10 | Passage Preview | Learner | 🟢 | screens-learner2.jsx |
| 11 | Reading Test (split-view) | Learner | 🟢 | screens-reading.jsx |
| 12 | Reading Results | Learner | 🟢 | screens-results.jsx |
| 13 | Reading History | Learner | 🟢 | screens-results.jsx |
| 14 | Writing List | Learner | 🟢 | screens-writing.jsx |
| 15 | Prompt Preview | Learner | 🟢 | screens-learner2.jsx |
| 16 | Writing Editor (+ AI feedback) | Learner | 🟢 | screens-writing.jsx |
| 17 | Writing Result | Learner | 🟢 | screens-results.jsx |
| 18 | Writing History | Learner | 🟢 | screens-results.jsx |
| 19 | Listening List | Learner | 🟢 | screens-listening.jsx |
| 20 | Listening Preview | Learner | 🟢 | screens-mock.jsx |
| 21 | Listening Test | Learner | 🟢 | screens-listening.jsx |
| 22 | Listening Results | Learner | 🟢 | screens-learner2.jsx |
| 23 | Speaking List | Learner | 🟢 | screens-speaking.jsx |
| 24 | Speaking Preview | Learner | 🟢 | screens-mock.jsx |
| 25 | Speaking Practice (record) | Learner | 🟢 | screens-speaking.jsx |
| 26 | Speaking History | Learner | 🟢 | screens-learner2.jsx |
| 27 | Speaking Result | Learner | 🟢 | screens-learner2.jsx |
| 28 | Full Mock Test flow | Learner | 🟢 | screens-mock.jsx |
| 29 | Mock Test Results | Learner | 🟢 | screens-mock.jsx |
| 30 | Classrooms List | Learner/Instructor | 🟢 | screens-classroom.jsx |
| 31 | Classroom Detail (tabs) | Learner/Instructor | 🟢 | screens-classroom.jsx |
| 32 | Classroom Create | Instructor | 🟢 | screens-instructor2.jsx |
| 33 | Classroom Edit | Instructor | 🟢 | screens-classroom2.jsx |
| 34 | Classroom Members | Both | 🟢 | screens-classroom2.jsx |
| 35 | Classroom Progress | Both | 🟢 | screens-classroom2.jsx |
| 36 | Join Classroom (by code) | Learner | 🟢 | screens-learner3.jsx |
| 37 | Join Classroom (by link landing) | Learner | 🟢 | screens-classroom2.jsx |
| 38 | Lesson Viewer | Learner | 🟢 | screens-classroom2.jsx |
| 39 | Lesson Builder | Instructor | 🟢 | screens-instructor2.jsx |
| 40 | Announcements Composer | Instructor | 🟢 | screens-instructor2.jsx |
| 41 | Progress Analytics | Learner | 🟢 | screens-learner3.jsx |
| 42 | Vocabulary List (IPA + VN toggle) | Learner | 🟢 | screens-learner3.jsx |
| 43 | Vocabulary Detail | Learner | 🟢 | screens-vocab.jsx |
| 44 | Flashcard Drill | Learner | 🟢 | screens-vocab.jsx |
| 45 | AI Tutor Chat | Learner | 🟢 | screens-vocab.jsx |
| 46 | Leaderboard | Learner | 🟢 | screens-learner3.jsx |
| 47 | Notifications Inbox | Learner | 🟢 | screens-learner3.jsx |
| 48 | Instructor Dashboard | Instructor | 🟢 | screens-staff.jsx |
| 49 | Submissions List | Instructor | 🟢 | screens-misc.jsx |
| 50 | Submission Review (Writing) | Instructor | 🟢 | screens-staff.jsx |
| 51 | Submission Review (Reading) | Instructor | 🟢 | screens-instructor2.jsx |
| 52 | Bulk Grading (speed mode) | Instructor | 🟢 | screens-instructor3.jsx |
| 53 | Learners List | Instructor | 🟢 | screens-misc.jsx |
| 54 | Learner Profile | Instructor | 🟢 | screens-instructor2.jsx |
| 55 | Gradebook | Instructor | 🟢 | screens-assign.jsx |
| 56 | Assignment Create | Instructor | 🟢 | screens-assign.jsx |
| 57 | Messages Inbox | Instructor | 🟢 | screens-instructor3.jsx |
| 58 | Instructor Calendar | Instructor | 🟢 | screens-instructor3.jsx |
| 59 | Admin Dashboard | Admin | 🟢 | screens-staff.jsx |
| 60 | Admin Analytics | Admin | 🟢 | screens-admin2.jsx |
| 61 | Passages List | Admin/Instructor | 🟢 | screens-misc.jsx |
| 62 | Passage Editor (+ question builder) | Admin/Instructor | 🟢 | screens-editors.jsx |
| 63 | Prompts List | Admin/Instructor | 🟢 | screens-misc.jsx |
| 64 | Prompt Editor (+ Task 1 chart upload) | Admin/Instructor | 🟢 | screens-editors.jsx |
| 65 | Users List | Admin | 🟢 | screens-misc.jsx |
| 66 | User Detail | Admin | 🟢 | screens-admin2.jsx |
| 67 | Content Moderation | Admin | 🟢 | screens-admin2.jsx |
| 68 | Roles & Permissions | Admin | 🟢 | screens-admin2.jsx |
| 69 | System Settings | Admin | 🟢 | screens-admin2.jsx |
| 70 | Audit Log | Admin | 🟢 | screens-admin2.jsx |
| 71 | Settings (Profile/Prefs/Notify/Goals/Security) | All | 🟢 | screens-misc.jsx |
| 72 | Search Results | All | 🟢 | screens-crosscut.jsx |
| 73 | 404 / Empty / Error states | All | 🟢 | screens-crosscut.jsx |

**Not yet designed** (identified as future scope, not in prototype):
- Achievements / Badges gallery
- Streak calendar heatmap (full page)
- Saved / Bookmarks library
- Writing Drafts library (unsubmitted work)
- Certificate / completion document
- Peer Review (comment on classmates' essays)
- AI Cost Tracker (admin)
- Feature Flags (admin)
- Billing / Subscriptions
- Help / FAQ Center, Contact Support
- 2FA Setup, Account Deletion flow
- Public marketing landing page, Pricing page
- Mobile-responsive variants of all screens (current prototype is desktop 1440 only)

---

## 7. Interaction Patterns

### 7.1 Test-taking (Reading / Listening)
- Persistent countdown timer in header, mono font, turns into a colored pill
- Question palette in footer: numbered cells, states = unanswered / answered (soft primary fill) / current (outlined) / flagged (small warn dot)
- Flag icon on each question for later review
- Submit always requires explicit confirmation via navigation to a Results screen (never a silent submit)

### 7.2 Writing Editor
- Left: prompt header (sunken bg) + full-height distraction-free textarea, serif-adjacent line-height 1.75
- Right: collapsible AI feedback panel — overall band, 4 criteria bars, color-coded margin notes (strength=green / revise=amber / error=red / suggestion=primary)
- Footer: live word count vs. minimum, autosave indicator, "Submit for AI scoring" CTA

### 7.3 Instructor review
- Essay/passage on the left with inline `<mark>` highlights + lettered superscript anchors
- Right rail: AI-suggested score (struck-through) → instructor override via range sliders per criterion, then a free-text comment box
- Bulk Grading is a 3-pane speed-run variant: queue list / essay / scoring shortcuts, with keyboard shortcut hints in the footer

### 7.4 Vocabulary & spaced repetition
- Word cards show IPA + part of speech + EN definition, with a **VN meaning toggle** (checkbox in the page header) shown in a primary-tinted inset block prefixed with 🇻🇳
- Flashcard Drill: click-to-flip card, then grade **Again / Hard / Easy** (SM-2-style intervals: tomorrow / 3 days / 1 week), end screen tallies results

### 7.5 Tweaks panel
Fixed bottom-right panel (sparkles icon trigger). Controls: accent color swatches (5), theme segmented control (Light/Dark), language segmented control (EN/VI), and a role switcher for demo purposes. State persists to `localStorage`.

---

## 8. Content & Copy Conventions

- **Section labels**: `— Label text` (em-dash prefix, uppercase-tracked, `--ink-4`)
- **Eyebrows** above page titles: italic, primary-colored, em-dash prefixed
- **Page titles**: large sans display, with an `<em>` accent word in primary color (e.g. "Welcome back, *Linh.*")
- **Metadata captions**: italic style at 11–12px, em-dash prefixed, `--ink-3`
- **Numbers/scores/times**: always mono font with `font-feature-settings: tnum` for tabular alignment
- **Band scores**: one decimal place always (`6.5`, not `6.50` or `6`)
- **Dates/relative time**: short form ("2h ago", "3d ago") in tables and lists; full form ("Tuesday, 19 April 2026") only in dashboard eyebrows

---

## 9. Accessibility & Responsiveness Notes

- Current prototype targets **desktop 1440px only** — mobile/responsive variants are out of scope pending a dedicated pass
- Minimum interactive target height: 26px (`.btn-sm`) internal tools, 30–36px for primary actions
- Color is never the sole indicator of state — status always pairs a badge/icon with color (e.g. ✓ icon + green, not just green text)
- Focus states use a visible ring (`box-shadow: 0 0 0 3px var(--primary-softer)`) on all inputs

### 9.1 Responsive Strategy (pre-pilot — added 07/2026)

> **Context:** BA elicitation (07/2026) xác nhận học sinh dùng **điện thoại là chính** khi làm bài tập; Azota (đối thủ, 300k+ GV) đã có mobile app. Prototype hiện tại desktop-only là gap lớn nhất cần lấp trước pilot 04/11/2026.

**Breakpoints (áp dụng cho pre-pilot):**

| Breakpoint | Width | Sidebar | Priority |
|-----------|-------|---------|----------|
| Desktop | > 1280px | Full 220px (hiện tại) | Đã có |
| Tablet | 900–1280px | Rail mode (icon only, expand on hover) | P0 — pre-pilot |
| Mobile | < 900px | Drawer (hamburger) | P0 — pre-pilot |
| Test-taking | Mọi size | Ẩn sidebar (đã đúng theo §3.2) | Đã có |

**Luồng HS bắt buộc responsive ở 375px (iPhone SE):**

| Screen | Desktop layout | Mobile adaptation |
|--------|---------------|-------------------|
| Reading Test (#11) | Split 1fr 1fr (passage \| questions) | Dọc: passage trên (collapsible) + questions dưới; HOẶC tab switching |
| Writing Editor (#16) | Split prompt \| editor | Prompt collapsible trên + editor full-width dưới |
| Writing Result/Feedback (#17) | Band tổng + 4 tiêu chí ngang | Band tổng trên, 4 tiêu chí dạng accordion dọc |
| Dashboard (#8) | Card grid 3 cột | Stack dọc 1 cột |
| Reading/Writing List (#9, #14) | Card grid 3 cột | Stack dọc 1 cột, filter drawer |

**Luồng GV giữ desktop-first** — không cam kết mobile cho Instructor flows trong pre-pilot.

---

## 10. Writing Submission Visibility Rules (added 07/2026)

> **Context:** PRD pre-pilot (07/2026) thiết kế chế độ A/B per-lớp cho Writing — ảnh hưởng trực tiếp đến UI hiển thị feedback.

### 10.1 Writing mode per-classroom (Decision D5)

GV cấu hình **per-lớp** khi tạo/sửa lớp:
- **Chế độ A (instant):** HS thấy feedback AI ngay khi chấm xong. Mặc định.
- **Chế độ B (review_first):** HS chỉ thấy "đã nộp — đang chờ giáo viên". GV duyệt trước.

HS tự ôn (không thuộc lớp): luôn chế độ A.

### 10.2 Band AI labeling (Decision D3 — bắt buộc mọi nơi)

Band AI **KHÔNG BAO GIỜ** hiển thị như điểm chính thức. UI patterns:

**Khi state = released_ai (AI đã chấm, GV chưa chốt):**
```
┌───────────────────────────────┐
│  Band 6.5  ⚠️ Ước lượng AI    │
├───────────────────────────────┤
│  TR: 6.0 │ CC: 7.0           │
│  LR: 6.5 │ GRA: 6.5          │
│                               │
│  ⓘ Giáo viên sẽ xác nhận     │
└───────────────────────────────┘
```

**Khi state = finalized (GV đã chốt) — highlight thay đổi:**
```
┌───────────────────────────────┐
│  Band 6.0  ✅ Giáo viên chốt  │
│  (AI: 6.5 → GV: 6.0)         │
├───────────────────────────────┤
│  TR: 5.5↓ │ CC: 7.0          │
│  LR: 6.0↓ │ GRA: 6.5         │
└───────────────────────────────┘
```

**Khi state = pending_review (chế độ B, HS nhìn):**
```
┌───────────────────────────────┐
│  Đã nộp — đang chờ giáo viên │
│  Nộp lúc: 14:30, 05/11/2026  │
└───────────────────────────────┘
```

### 10.3 Submission status badges

| State | Badge style | Text | Color token |
|-------|------------|------|-------------|
| draft | `.badge-outline` | Nháp | `--ink-4` |
| submitted | `.badge-primary` | Đang chấm | `--primary` |
| released_ai | `.badge-success` | AI đã chấm | `--success` |
| pending_review | `.badge` (custom) | Chờ GV duyệt | purple / `oklch(0.55 0.15 300)` |
| ai_failed | `.badge-danger` | Lỗi chấm | `--danger` |
| finalized | `.badge-success` + ✓ | GV đã chốt | `--success` |

### 10.4 Instructor review queue additions

The existing Submission Review (#50) interaction pattern (§7.3) applies. Additional UI for state machine:
- Review queue shows badge per submission state (§10.3)
- `ai_failed` submissions show a "Chấm lại" ghost button alongside manual scoring
- "Chốt" action = primary CTA; ≤ 3 clicks if GV agrees with AI scores (click "Chốt" → confirm → done)
- Calibration data (band AI vs band GV) saved automatically on finalize — no extra UI needed

---

## 11. Self-study Learner Additions (added 07/2026)

> **Context:** PRD Decision D8 — HS tự ôn nâng lên persona chính. Sản phẩm mở đăng ký tự do.

### 11.1 Register flow (update to Screen #2)
- Register form does NOT ask for classroom invite code
- Year-of-birth field: if age < 16 → show parental consent checkbox + parent email field
- ToS + Privacy Policy checkbox mandatory (links to two Vietnamese-language documents)

### 11.2 Learner Dashboard (#8) — self-study variant
- Same layout as classroom learner, minus "Bài tập của tôi" section
- Shows: kho đề (Reading + Writing), lịch sử bài, biểu đồ tiến bộ band cá nhân
- Cross-sell banner (dismissible): "Để được giáo viên review chi tiết, tham gia lớp học →"

### 11.3 Landing page (new — Screen #74)
- Status: 🟡 (not yet in prototype)
- Route: `/` (unauthenticated)
- Content: value proposition (AI chấm Writing IELTS), kho đề, tiến bộ band; CTA "Đăng ký miễn phí"; screenshot/demo; SEO-friendly title + meta
- Design: use existing tokens; hero section with warm parchment bg + indigo CTA

---

## 12. Known Gaps / Open Questions

1. Toggle switch component is currently inline-styled per screen — should be extracted to a shared `.toggle` class if adopted app-wide.
2. ~~Mobile breakpoints are undefined~~ → Defined in §9.1 (07/2026 update). Implementation pending.
3. Real audio/recording integration (Listening/Speaking) is mocked — needs a real media pipeline spec. **Note:** Listening & Speaking are deferred post-pilot per PRD Decision D7.
4. AI Tutor and AI feedback panels currently show static/mock content — needs an actual prompt/response contract with the backend AI service.
5. Bulk Grading keyboard shortcuts are illustrative only — not yet wired to real key handlers.
6. **Account deletion flow** (new): Settings → "Xóa tài khoản" → confirm → soft delete 7 days → hard delete. Not yet designed. (PRD US-602)
7. **Import preview screen** (new): GV upload docx → preview parsed questions → edit → publish. Not yet designed. (PRD US-401, US-402)
8. **Classroom writing_mode setting** (new): toggle A/B in classroom create/edit form with tooltip explanation. Not yet designed. (PRD US-103)

---

*This spec reflects the HTML/React prototype in this project as the single source of truth for visual and interaction design, **updated 07/2026** with responsive strategy, Writing state machine visibility rules, and self-study learner additions from the BA/PRD process. When implementing in production code, treat `src/tokens.css` as the canonical token source and port values directly rather than re-deriving them.*
