# 🎨 UI/UX Specifications — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-10  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [03_user_personas_roles](03_user_personas_roles.md) | [04_user_stories](04_user_stories.md)

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
| Modal | Import from NotebookLM, create content |
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
│   │   └── /admin/sources/import ... Import from NotebookLM
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

### 4.11 Admin — Import Modal

| Element | Spec |
|---------|------|
| Trigger | "Import from NotebookLM" button in sources section |
| Modal content | URL input, Title input, Tags multi-select, Level dropdown |
| Import button | Primary; loading state during fetch |
| Success | List of imported snippets (text preview); "Done" to close |
| Error | Error message with retry option |

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
