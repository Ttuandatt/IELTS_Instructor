# UI Redesign — Teachy Brand & Design System

**Status:** DESIGN COMPLETE — All 7 sections approved
**Date:** 2026-03-17 (updated 2026-03-18)
**Reference:** https://teachy.odoo.com/

---

## 1. Tong quan quyet dinh

### Brand
- **Ten app:** Teachy
- **Logo:** Icon chu "T" tren nen primary color (#5f4b8b), bo tron 8px, 32x32px, font-weight 800, color white

### Scope
- **Landing page cong khai** (moi) — trang gioi thieu cho nguoi chua dang nhap
- **Redesign dashboard app** (cai tien) — header, sidebar, cards, colors, typography
- **Auth pages** (cai tien) — login/register voi branding moi

### Design Tone
- **Clean & Minimal** — nhieu whitespace, mau nhe, it shadow, flat design (theo phong cach Teachy/Odoo)

### Approach
- **Component Rebuild** — viet lai AppShell, Header, Sidebar + tao components moi cho landing page. Giu nguyen business logic/pages, chi thay layout shell.

---

## 2. Color System

### Light Mode

```css
:root {
  --color-primary: #5f4b8b;
  --color-primary-hover: #4e3d75;
  --color-primary-light: rgba(95, 75, 139, 0.1);
  --color-accent: #e69a8d;
  --color-accent-hover: #d88878;
  --color-accent-light: rgba(230, 154, 141, 0.1);

  --color-bg-page: #f2f0f5;        /* lavender mist */
  --color-bg-card: #ffffff;
  --color-bg-secondary: #f8f7fa;
  --color-bg-tertiary: #eeedf2;

  --color-text-primary: #1d172b;   /* navy charcoal */
  --color-text-secondary: #4a4458;
  --color-text-muted: #8c85a0;     /* tim xam */

  --color-border: #e2dfe8;         /* tim nhat */
  --color-border-light: #eeedf2;

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

### Dark Mode

```css
[data-theme="dark"] {
  --color-primary: #8b7ab8;
  --color-primary-hover: #a090cc;
  --color-primary-light: rgba(139, 122, 184, 0.15);
  --color-accent: #e69a8d;
  --color-accent-hover: #d88878;
  --color-accent-light: rgba(230, 154, 141, 0.15);

  --color-bg-page: #13101c;
  --color-bg-card: #1d172b;
  --color-bg-secondary: #241e34;
  --color-bg-tertiary: #2e2742;

  --color-text-primary: #f0eef4;
  --color-text-secondary: #b8b2c8;
  --color-text-muted: #7a7290;

  --color-border: #2e2742;
  --color-border-light: #241e34;

  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --color-info: #60a5fa;
}
```

### Key Changes vs Current
- `--color-bg-page`: gradient (hien tai) -> flat `#f2f0f5` (moi). Audit moi cho dung `background` tren body/components.
- `--color-bg-primary` (hien tai) -> **removed**, thay bang `--color-bg-card`. Implementer can global search-replace `var(--color-bg-primary)` -> `var(--color-bg-card)`.
- Text muted: gray thuan (`#64748b`) -> tim xam (`#8c85a0`)
- Border: `#DEE2E6` -> `#e2dfe8`
- Dark mode: dark purple tone thay vi dark gray thuan, semantic colors sang hon de dam bao contrast

### Opacity shorthand convention
Trong spec nay, `primary/10%` co nghia la `var(--color-primary-light)` (da dinh nghia o tren). `primary/20%` = `rgba(95, 75, 139, 0.2)` (light mode) / `rgba(139, 122, 184, 0.2)` (dark mode) — implementer dung inline rgba hoac tao them token `--color-primary-medium` neu can.

---

## 3. Typography

### Font Stack
System font (khong them Google Fonts):
```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Scale

Dung Tailwind v4 utility classes truc tiep (`text-xs`, `text-sm`, etc.) thay vi tao custom CSS variables `--text-*` de tranh xung dot voi Tailwind v4 `@theme` namespace.

| Tailwind class | Size | Weight | Dung cho |
|----------------|------|--------|----------|
| `text-xs` | 0.75rem | 400 | badges, timestamps |
| `text-sm` | 0.8rem | 400 | labels, muted text |
| `text-base` | 0.875rem | 400 | body text, nav items |
| `text-lg` | 1rem | 600 | section headings, card titles |
| `text-xl` | 1.25rem | 700 | page titles |
| `text-2xl` | 1.75rem | 800 | welcome banner, hero |

Luu y: Cac size nay co the khac voi Tailwind defaults. Configure trong `@theme` block cua Tailwind v4 neu can.

### Letter-spacing
- Headings (xl, 2xl): `-0.02em`
- Body: `0`
- Labels uppercase: `0.05em`

### Border Radius Tokens (don vi: rem, dong bo voi font sizing)

```css
--radius-sm: 0.375rem;   /* 6px — inputs, small buttons */
--radius-md: 0.625rem;   /* 10px — nav items, badges */
--radius-lg: 0.75rem;    /* 12px — cards, dropdowns */
--radius-xl: 1rem;       /* 16px — stat cards, modals */
--radius-full: 9999px;   /* avatars, pills */
```

### Shadow (minimal — Teachy style)

```css
--shadow-sm: 0 1px 2px rgba(29, 23, 43, 0.04);
--shadow-md: 0 4px 12px rgba(29, 23, 43, 0.08);   /* dropdowns, expanded sidebar */
--shadow-lg: 0 8px 24px rgba(29, 23, 43, 0.12);    /* modals, overlays */
```

---

## 4. Dashboard Layout — Hybrid Navbar + Icon Sidebar

### Structure

```
+-------------------------------------------------------------+
|  [T] Teachy    Dashboard  Classrooms  ..  search theme notif |  <- Top Navbar (56px)
+------+------------------------------------------------------+
| icon |                                                       |
| icon |           Main Content Area                           |
| icon |           (pages render here)                         |
| icon |                                                       |
|      |                                                       |
| avtr |                                                       |
+------+------------------------------------------------------+
  ^-- Icon sidebar (64px collapsed, 240px expanded on hover)
```

### Routing Logic
- `PUBLIC_PATHS` them `/` (landing page). `/about` va `/features` la anchor links trong landing page (`/#features`, `/#about`), khong phai Next.js routes rieng — khong can them vao PUBLIC_PATHS.
- Chua dang nhap -> landing page (khong co sidebar/navbar)
- Da dang nhap -> hybrid layout voi navbar + sidebar

---

## 5. Top Navbar

### Structure
```
+--------------------------------------------------------------------+
| [T] Teachy  |  Dashboard  Classrooms  Passages  |  search lang theme notif  [A] Admin v |
|  logo+text   |     navigation tabs               |     action icons           avatar     |
|  (160px)     |     (flex, center)                 |     (gap 4px)            dropdown    |
+--------------------------------------------------------------------+
     Left               Center                              Right
```

### Left — Brand
- Logo: chu "T" tren nen `#5f4b8b`, bo tron 8px, 32x32px, font-weight 800, white
- Text: "Teachy" font-weight 700, font-size 1.1rem
- Click -> navigate `/dashboard`
- Gap: 8px

### Center — Navigation Tabs
- Moi tab la `<Link>` nam ngang, font-size 0.875rem, font-weight 500
- **Active:** color `primary`, border-bottom 2px solid `primary`, font-weight 600
- **Inactive:** color `--color-text-muted`, hover -> `--color-text-primary`
- Tabs theo role (bo Dashboard vi logo da link, bo Settings vi chuyen vao dropdown):
  - **Learner:** Reading, Writing, Classrooms
  - **Instructor:** Classrooms, Passages, Prompts, Learners, Submissions
  - **Admin:** Classrooms, Passages, Prompts, Users (Admin khong co Submissions tab — submissions duoc xem per-passage/prompt)

### Right — Actions (trai sang phai)
1. **Search** (icon) — click mo search overlay
2. **Language** (Globe icon) — toggle vi/en
3. **Theme** (Moon/Sun icon) — toggle theme
4. **Notifications** (Bell icon) — badge do khi co unread
5. **Avatar dropdown:** avatar 34px + ten + chevron -> menu (Settings, Logout)

### Action Button Style
- 36x36px, border-radius 8px, background transparent
- Hover: `var(--color-bg-secondary)`
- Active: `primary/10%`
- Icon size: 18px, strokeWidth 1.8

### Search Overlay
- Click search icon -> overlay modal center
- Input autofocus, font-size 1.25rem
- Keyboard shortcut: `Ctrl+K` / `Cmd+K`
- `Esc` hoac click ngoai -> dong

### Responsive (< 768px)
- Nav tabs an -> hamburger menu icon o left
- Click hamburger -> slide-in menu tu trai (nav items + user info)
- Search, theme, notification van hien
- Avatar dropdown -> chi icon, khong text

### CSS
- `position: sticky`, `top: 0`, `z-index: 40`, `height: 56px`
- Background: `var(--color-bg-card)`, `backdrop-filter: blur(8px)`, `border-bottom: 1px solid var(--color-border)`
- Padding: `0 1.5rem`

---

## 6. Icon Sidebar

### Behavior
- **Collapsed (mac dinh):** width 64px, chi hien icon centered, tooltip on hover tung item
- **Expanded (on hover):** width 240px, icon + label text. Transition `width 200ms ease`
- **Trigger:** hover vao sidebar -> expand. Mouse leave -> collapse
- **Khong co toggle button** — hoan toan tu dong
- **Touch devices (`pointer: coarse`) tai >= 768px:** Them click-to-toggle fallback vi `:hover` khong hoat dong tren tablet/Surface. Click icon sidebar -> toggle expand/collapse.

### Nav Items
Sidebar nav items theo role, **luon bao gom Dashboard** (khac voi navbar — navbar dua vao logo de link Dashboard):
- **Learner:** Dashboard, Reading, Writing, Classrooms
- **Instructor:** Dashboard, Classrooms, Passages, Prompts, Learners, Submissions
- **Admin:** Dashboard, Classrooms, Passages, Prompts, Users
- Icon size: 20px, strokeWidth 1.8 (active: 2.2)
- **Active:** background `primary/10%`, color `primary`, border-radius `var(--radius-md)` (0.625rem / 10px)
- **Inactive:** color `--color-text-muted`, hover -> `var(--color-bg-secondary)`
- Padding: `10px 12px`, gap icon-label: 12px

### Footer — Mini Avatar
- Collapsed: avatar circle 32px
- Expanded: avatar + ten + role
- Click -> khong action (dropdown da co tren navbar)

### Phan tach trach nhiem Navbar vs Sidebar

| Thanh phan | Navbar (top) | Sidebar (left) |
|-----------|-------------|----------------|
| Logo + brand | Co | Khong |
| Nav tabs | Co (text) | Co (icon shortcut) |
| Search | Co | Khong |
| Theme/Lang/Notif | Co | Khong |
| User dropdown | Co | Mini avatar only |
| Settings | Trong avatar dropdown | Khong |

### Mobile (< 768px)
- Sidebar **an hoan toan** — navigation chi qua hamburger menu tren navbar

### CSS
- `position: fixed`, `left: 0`, `top: 56px`, `height: calc(100vh - 56px)`
- `z-index: 30`
- Background: `var(--color-bg-card)`, `border-right: 1px solid var(--color-border)`
- Main content: `margin-left: 64px` (co dinh, khong shift khi expand)
- Sidebar expand phu len content (position fixed + shadow-md)

---

## 7. Dashboard Cards & Stats

### Stat Cards
- Icon container: 44px, bo tron 12px, background `linear-gradient(135deg, var(--color-primary-light), rgba(95,75,139,0.04))`. Dark mode tu adapt vi `--color-primary-light` da co dark variant.
- Value: 1.5rem, weight 800, color `--color-text-primary`
- Label: 0.8rem, color `--color-text-muted`, uppercase, letter-spacing 0.05em
- Trend indicator (optional): nho phia duoi value, xanh (+) hoac do (-)
- Card: bg white, border `1px solid var(--color-border)`, border-radius 16px, padding 1.25rem, **khong shadow**
- Hover: border -> `primary/20%`

### Quick Action Cards
- Border-left 3px solid `var(--color-primary)` -> nhan dien action
- Hover: bg `var(--color-bg-secondary)`, arrow icon slide phai 4px
- Layout: icon + label + description + arrow

### Welcome Banner
- Heading 1.75rem, weight 800, letter-spacing -0.03em
- Greeting theo gio: "Chao buoi sang/chieu/toi,"
- Khong can background card — text truc tiep tren page

### Writing Criteria Bars
- Bar height: 8px (tang tu 6px), border-radius full
- Colors: Good (>6) `#10b981`, Medium (4-6) `#e69a8d` (salmon), Low (<4) `#ef4444`

### Recent Submissions List
- Giu structure hien tai
- Hover row highlight `var(--color-bg-secondary)`
- Score badge: pill shape, bg `primary/10%`, color `primary`

### Grid Layout
- Stat cards: `repeat(auto-fit, minmax(220px, 1fr))`
- Writing criteria + Trend chart: 2 columns desktop, stack mobile

---

## 8. Auth Pages — Login/Register

### Layout
- Single-column centered, **khong split screen**
- `min-height: 100vh`, flexbox center

### Page Background
- `var(--color-bg-page)` (`#f2f0f5`)

### Card Container
- Max-width: 420px, centered
- Background: white, border-radius 16px, border `1px solid var(--color-border)`
- Padding: 2.5rem
- Khong shadow (flat)

### Brand Header (trong card)
- Logo "T" (40x40px, bg primary, border-radius 10px) + "Teachy" text, centered
- Heading: "Welcome back" (login) / "Tao tai khoan" (register)
- Subtitle muted: "Dang nhap de tiep tuc hoc" / "Bat dau hanh trinh IELTS"

### Form Fields
- Input: height 44px, border `1px solid var(--color-border)`, border-radius 6px, padding `0 0.875rem`
- Focus: border `var(--color-primary)`, box-shadow `0 0 0 3px var(--color-primary-light)`
- Label: `text-sm` (Tailwind), weight 500, color `--color-text-secondary`, margin-bottom 6px
- Error: border `var(--color-error)`, error text do ben duoi
- Gap giua fields: 1rem
- **Login:** Email, Password
- **Register:** Display Name, Email, Password, Confirm Password

### Submit Button
- Width 100%, height 44px
- Background `var(--color-primary)`, color white, weight 600
- Border-radius 6px
- Hover: `var(--color-primary-hover)`
- Loading: spinner icon thay text
- Margin-top: 1.5rem

### Footer Links
- "Chua co tai khoan? **Dang ky ngay**" / toggle
- Centered, margin-top 1.25rem, `text-sm` (Tailwind)
- Link color `var(--color-primary)`, hover underline

### Page Footer
- "Copyright 2026 Teachy", `text-xs` (Tailwind), `--color-text-muted`, margin-top 2rem

### Dark Mode
- Tu dong adapt qua CSS variables

---

## 9. Landing Page (Approved)

Cau truc tu tren xuong:
1. **Navbar:** Logo Teachy + menu (Trang chu, Tinh nang, Ve chung toi) + Dang nhap/Dang ky
2. **Hero:** Badge "IELTS Preparation Platform" + heading lon + mo ta + 2 CTA (primary + outline)
3. **Features:** 3 cards ngang — Reading Practice, Writing Practice, Lop hoc truc tuyen
4. **CTA Section:** Dang ky mien phi + Lien he tu van (accent color)
5. **Footer:** Minimal — logo + copyright, dark background (#1d172b)

Mockup: `.superpowers/brainstorm/s4/landing-page-v2.html`

---

## 10. Technical Scope

### Frontend Stack
- Next.js 16.1 (App Router) + React 19 + TypeScript 5
- Tailwind CSS v4 + Custom CSS variables (globals.css)
- Lucide React icons
- TanStack React Query v5

### Components can rebuild
- `apps/frontend/src/components/layout/AppShell.tsx` — Main layout wrapper
- `apps/frontend/src/components/layout/Header.tsx` — Top navigation bar -> Top Navbar
- `apps/frontend/src/components/layout/Sidebar.tsx` — Side navigation -> Icon Sidebar

### Components can tao moi
- Landing page route (`/`)
- Public navbar component (cho landing page)
- Hero section component
- Feature cards component
- Search overlay component
- Avatar dropdown component

### Files can update
- `apps/frontend/src/app/globals.css` — CSS variables, color system, typography tokens
- `apps/frontend/src/app/page.tsx` — Replace `redirect('/dashboard')` voi LandingPage component moi
- `apps/frontend/src/i18n/vi.json` + `en.json` — Brand name "Teachy", new translations
- `apps/frontend/src/providers/AuthProvider.tsx` — Routing logic cho landing page (them PUBLIC_PATHS)
- `apps/frontend/src/app/dashboard/page.tsx` — Redesign stat cards, welcome banner, quick actions
- `apps/frontend/src/app/login/page.tsx` + `register/page.tsx` — Auth page redesign
