# Teachy UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the app to "Teachy" with a full UI redesign: purple/salmon color palette, hybrid dashboard layout (top navbar + icon sidebar), redesigned cards/auth pages, and a new public landing page.

**Architecture:** Component Rebuild approach — rewrite AppShell, Header→Navbar, Sidebar→IconSidebar while keeping all business logic and page content intact. New components for landing page, search overlay, and avatar dropdown. CSS variable system updated in-place within globals.css.

**Tech Stack:** Next.js 16.1 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React icons, TanStack React Query v5

**Design Spec:** `docs/superpowers/specs/2026-03-17-ui-redesign-teachy-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/components/layout/Navbar.tsx` | Top navigation bar — brand, role-based tabs, action icons, avatar dropdown |
| `src/components/layout/IconSidebar.tsx` | Left icon sidebar — collapsed 64px, expand on hover 240px, role-based nav |
| `src/components/layout/SearchOverlay.tsx` | Modal search overlay — Ctrl+K trigger, autofocus input, Esc to close |
| `src/components/layout/AvatarDropdown.tsx` | User avatar with dropdown menu — Settings, Logout |
| `src/components/landing/LandingPage.tsx` | Full landing page — hero, features, CTA, footer |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/globals.css` | Color variables (purple/salmon), typography tokens, layout dimensions, new component styles |
| `src/components/layout/AppShell.tsx` | Replace sidebar+header layout with navbar+icon-sidebar hybrid. Update PUBLIC_PATHS. |
| `src/app/page.tsx` | Replace `redirect('/dashboard')` with LandingPage component |
| `src/app/dashboard/page.tsx` | Redesign stat cards, welcome banner (time-based greeting), quick actions |
| `src/app/login/page.tsx` | Redesign with Teachy branding, centered card, new form styles |
| `src/app/register/page.tsx` | Redesign matching login page style |
| `src/app/layout.tsx` | Update metadata title/description to "Teachy" |
| `src/i18n/vi.json` | `app_name` → "Teachy", add landing page & new UI keys |
| `src/i18n/en.json` | Same as vi.json |

### Deleted Files
| File | Reason |
|------|--------|
| `src/components/layout/Header.tsx` | Replaced by `Navbar.tsx` |
| `src/components/layout/Sidebar.tsx` | Replaced by `IconSidebar.tsx` |

---

## Chunk 1: Foundation — Color System, Tokens & i18n

### Task 1: Update CSS color variables in globals.css

**Files:**
- Modify: `apps/frontend/src/app/globals.css:8-73` (light theme variables)
- Modify: `apps/frontend/src/app/globals.css:76-114` (dark theme variables)

**Context:** Current colors use Indigo (#6366f1) palette. Spec requires purple (#5f4b8b) / salmon (#e69a8d) palette. The `@theme inline` block at lines 116-121 references `--color-background` and `--color-foreground` which must also update.

- [ ] **Step 1: Update light mode CSS variables**

Replace the `:root` color block (lines 8-73) with the new Teachy palette:

```css
:root {
  /* ── Brand ── */
  --color-primary: #5f4b8b;
  --color-primary-hover: #4e3d75;
  --color-primary-light: rgba(95, 75, 139, 0.1);
  --color-primary-medium: rgba(95, 75, 139, 0.2);
  --color-accent: #e69a8d;
  --color-accent-hover: #d88878;
  --color-accent-light: rgba(230, 154, 141, 0.1);

  /* ── Module (keep existing) ── */
  --color-reading: #0ea5e9;
  --color-reading-subtle: rgba(14, 165, 233, 0.08);
  --color-writing: #8b5cf6;
  --color-writing-subtle: rgba(139, 92, 246, 0.08);

  /* ── Backgrounds ── */
  --color-bg-page: #f2f0f5;
  --color-bg-card: #ffffff;
  --color-bg-secondary: #f8f7fa;
  --color-bg-tertiary: #eeedf2;
  --color-bg-hover: rgba(95, 75, 139, 0.04);

  /* ── Text ── */
  --color-text-primary: #1d172b;
  --color-text-secondary: #4a4458;
  --color-text-muted: #8c85a0;
  --color-text-inverse: #ffffff;

  /* ── Borders ── */
  --color-border: #e2dfe8;
  --color-border-light: #eeedf2;
  --color-border-focus: #5f4b8b;

  /* ── Semantic ── */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  --color-secondary: #8c85a0;

  /* ── Spacing (keep existing names — `--space-*` used in 100+ places) ── */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* ── Border Radius (keep --radius-lg as 1rem to avoid regressing 14 usages) ── */
  --radius-sm: 0.375rem;
  --radius-md: 0.625rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-full: 9999px;

  /* ── Shadows (purple-tinted) ── */
  --shadow-sm: 0 1px 2px rgba(29, 23, 43, 0.04);
  --shadow-md: 0 4px 12px rgba(29, 23, 43, 0.08);
  --shadow-lg: 0 8px 24px rgba(29, 23, 43, 0.12);
  --shadow-card: 0 2px 8px rgba(29, 23, 43, 0.06);

  /* ── Layout ── */
  --navbar-height: 56px;
  --sidebar-width: 64px;
  --sidebar-width-expanded: 240px;

  /* ── Transitions ── */
  --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

Key changes from current:
- `--color-primary`: `#6366f1` → `#5f4b8b`
- `--color-bg-page`: gradient → flat `#f2f0f5`
- `--color-bg-primary` removed → use `--color-bg-card` instead (global search-replace needed)
- `--color-text-muted`: `#94a3b8` → `#8c85a0` (purple-gray)
- `--color-border`: `#e2e8f0` → `#e2dfe8`
- Layout: `--sidebar-width: 270px` → `64px`, `--header-height: 72px` → `--navbar-height: 56px`
- Added: `--color-primary-medium`, `--color-accent*`, `--sidebar-width-expanded`
- `--radius-lg` stays at `1rem` (was already 1rem — 14 usages across globals.css)
- `--radius-xl` changes from `1.25rem` to `1.25rem` (no change needed — keeping current value)
- Spacing tokens keep `--space-*` naming (not `--spacing-*`) — 100+ existing usages

- [ ] **Step 2: Update dark mode CSS variables**

Replace the `[data-theme="dark"]` block (lines 76-114):

```css
[data-theme="dark"] {
  --color-primary: #8b7ab8;
  --color-primary-hover: #a090cc;
  --color-primary-light: rgba(139, 122, 184, 0.15);
  --color-primary-medium: rgba(139, 122, 184, 0.2);
  --color-accent: #e69a8d;
  --color-accent-hover: #d88878;
  --color-accent-light: rgba(230, 154, 141, 0.15);

  --color-bg-page: #13101c;
  --color-bg-card: #1d172b;
  --color-bg-secondary: #241e34;
  --color-bg-tertiary: #2e2742;
  --color-bg-hover: rgba(139, 122, 184, 0.08);

  --color-text-primary: #f0eef4;
  --color-text-secondary: #b8b2c8;
  --color-text-muted: #7a7290;
  --color-text-inverse: #1d172b;

  --color-border: #2e2742;
  --color-border-light: #241e34;
  --color-border-focus: #8b7ab8;

  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --color-info: #60a5fa;
  --color-secondary: #7a7290;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.25);
}
```

- [ ] **Step 3: Update @theme block and Tailwind blue remapping**

Update the `@theme inline` block (lines 116-121) to reference new variables:

```css
@theme inline {
  --color-background: var(--color-bg-page);
  --color-foreground: var(--color-text-primary);
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, 'Courier New', monospace;
}
```

Update the Tailwind blue class remapping (lines 159-267) — change all `#6366f1`/indigo references to `#5f4b8b`/purple:
- `.bg-blue-600` → `#5f4b8b`
- `.text-blue-600` → `#5f4b8b`
- `.border-blue-600` → `#5f4b8b`
- etc.

- [ ] **Step 4: Global search-replace `var(--color-bg-primary)` → `var(--color-bg-card)`**

Run across all `.tsx` and `.css` files. The old `--color-bg-primary` token is removed.

- [ ] **Step 5: Verify app still compiles and renders**

Run: `cd apps/frontend && npm run dev`
Manual checks:
- http://localhost:3000/dashboard — colors should be purple-tinted now
- http://localhost:3000/login — auth card renders (check `--color-bg-card` replacement worked)
- http://localhost:3000/register — same check
- Verify no broken CSS (inspect console for missing variable warnings)

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/app/globals.css
git commit -m "style: update color system to Teachy purple/salmon palette"
```

---

### Task 2: Update i18n files and metadata

**Files:**
- Modify: `apps/frontend/src/i18n/vi.json`
- Modify: `apps/frontend/src/i18n/en.json`
- Modify: `apps/frontend/src/app/layout.tsx`

- [ ] **Step 1: Update vi.json**

Change `app_name` and add new keys:

```json
{
  "app_name": "Teachy",
  "landing": {
    "hero_badge": "IELTS Preparation Platform",
    "hero_title": "Nang cao ky nang IELTS cua ban",
    "hero_subtitle": "Luyen tap Reading & Writing voi phan hoi tu AI. Theo doi tien do va dat muc tieu IELTS cua ban.",
    "cta_start": "Bat dau mien phi",
    "cta_contact": "Lien he tu van",
    "feature_reading": "Luyen doc",
    "feature_reading_desc": "Luyen tap voi cac bai doc IELTS thuc te, cau hoi da dang va cham diem tu dong.",
    "feature_writing": "Luyen viet",
    "feature_writing_desc": "Nhan phan hoi chi tiet tu AI theo 4 tieu chi IELTS: TR, CC, LR, GRA.",
    "feature_classroom": "Lop hoc truc tuyen",
    "feature_classroom_desc": "Tham gia lop hoc, nhan bai tap va theo doi tien do cung giao vien.",
    "nav_home": "Trang chu",
    "nav_features": "Tinh nang",
    "nav_about": "Ve chung toi"
  },
  "greeting": {
    "morning": "Chao buoi sang",
    "afternoon": "Chao buoi chieu",
    "evening": "Chao buoi toi"
  }
}
```

Add to the existing JSON (merge, don't replace).

- [ ] **Step 2: Update en.json**

Same structure in English:

```json
{
  "app_name": "Teachy",
  "landing": {
    "hero_badge": "IELTS Preparation Platform",
    "hero_title": "Boost your IELTS skills",
    "hero_subtitle": "Practice Reading & Writing with AI-powered feedback. Track progress and achieve your IELTS goals.",
    "cta_start": "Get started free",
    "cta_contact": "Contact us",
    "feature_reading": "Reading Practice",
    "feature_reading_desc": "Practice with real IELTS reading passages, diverse questions, and auto-scoring.",
    "feature_writing": "Writing Practice",
    "feature_writing_desc": "Get detailed AI feedback on all 4 IELTS criteria: TR, CC, LR, GRA.",
    "feature_classroom": "Online Classroom",
    "feature_classroom_desc": "Join classes, receive assignments, and track progress with your instructor.",
    "nav_home": "Home",
    "nav_features": "Features",
    "nav_about": "About"
  },
  "greeting": {
    "morning": "Good morning",
    "afternoon": "Good afternoon",
    "evening": "Good evening"
  }
}
```

- [ ] **Step 3: Update layout.tsx metadata**

```tsx
export const metadata: Metadata = {
  title: 'Teachy — IELTS Preparation Platform',
  description: 'Practice IELTS Reading & Writing with AI-powered feedback. Track progress and achieve your goals.',
};
```

Also update `<html lang="vi">` — keep as-is (already correct).

- [ ] **Step 4: Verify i18n renders correctly**

Run: `cd apps/frontend && npm run dev`
Check: Dashboard should show "Teachy" in sidebar logo.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/i18n/vi.json apps/frontend/src/i18n/en.json apps/frontend/src/app/layout.tsx
git commit -m "chore: rebrand to Teachy — update i18n and metadata"
```

---

## Chunk 2: Layout Components

### Task 3: Create AvatarDropdown component

**Files:**
- Create: `apps/frontend/src/components/layout/AvatarDropdown.tsx`
- Modify: `apps/frontend/src/app/globals.css` (add dropdown styles)

**Context:** Used in the new Navbar. Shows user avatar circle + name + chevron. Click opens dropdown with Settings and Logout.

- [ ] **Step 1: Create AvatarDropdown.tsx**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { ChevronDown, Settings, LogOut } from 'lucide-react';

export function AvatarDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initial = user.display_name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="avatar-dropdown" ref={ref}>
      <button
        className="avatar-dropdown-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="avatar-circle">{initial}</div>
        <span className="avatar-name">{user.display_name}</span>
        <ChevronDown size={14} className={`avatar-chevron ${open ? 'avatar-chevron--open' : ''}`} />
      </button>

      {open && (
        <div className="avatar-dropdown-menu">
          <Link
            href="/settings"
            className="avatar-dropdown-item"
            onClick={() => setOpen(false)}
          >
            <Settings size={16} />
            <span>Settings</span>
          </Link>
          <button
            className="avatar-dropdown-item"
            onClick={() => { setOpen(false); logout(); }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add CSS for avatar dropdown to globals.css**

Append after the existing header styles section:

```css
/* ── Avatar Dropdown ── */
.avatar-dropdown {
  position: relative;
}

.avatar-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 8px 4px 4px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.avatar-dropdown-trigger:hover {
  background: var(--color-bg-secondary);
}

.avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.avatar-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.avatar-chevron {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}
.avatar-chevron--open {
  transform: rotate(180deg);
}

.avatar-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 180px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 4px;
  z-index: 50;
}

.avatar-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.avatar-dropdown-item:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
```

- [ ] **Step 3: Verify dropdown renders**

Temporarily import and render in Header.tsx to test. Open browser → click avatar → dropdown should appear.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/components/layout/AvatarDropdown.tsx apps/frontend/src/app/globals.css
git commit -m "feat: add AvatarDropdown component for navbar user menu"
```

---

### Task 4: Create SearchOverlay component

**Files:**
- Create: `apps/frontend/src/components/layout/SearchOverlay.tsx`
- Modify: `apps/frontend/src/app/globals.css` (add overlay styles)

**Context:** Modal search overlay triggered by Search icon click or Ctrl+K. Full-screen backdrop, centered input, Esc to close.

- [ ] **Step 1: Create SearchOverlay.tsx**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Small delay to allow the overlay to render before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+K or Cmd+K to open (handled by parent)
      if (e.key === 'Escape' && open) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-overlay-content" onClick={e => e.stopPropagation()}>
        <div className="search-overlay-input-wrap">
          <Search size={20} className="search-overlay-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-overlay-input"
            placeholder="Search courses, lessons..."
          />
          <button className="search-overlay-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="search-overlay-hint">
          Press <kbd>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add CSS for search overlay to globals.css**

```css
/* ── Search Overlay ── */
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(29, 23, 43, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20vh;
}

.search-overlay-content {
  width: 100%;
  max-width: 560px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 0.5rem;
}

.search-overlay-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.search-overlay-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-overlay-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.125rem;
  color: var(--color-text-primary);
  outline: none;
}
.search-overlay-input::placeholder {
  color: var(--color-text-muted);
}

.search-overlay-close {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
}
.search-overlay-close:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.search-overlay-hint {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border-light);
}
.search-overlay-hint kbd {
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  background: var(--color-bg-secondary);
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/layout/SearchOverlay.tsx apps/frontend/src/app/globals.css
git commit -m "feat: add SearchOverlay component with Ctrl+K shortcut"
```

---

### Task 5: Create new Navbar component

**Files:**
- Create: `apps/frontend/src/components/layout/Navbar.tsx`
- Modify: `apps/frontend/src/app/globals.css` (add navbar styles)

**Context:** Replaces Header.tsx. Contains brand logo, role-based navigation tabs, and action icons + avatar dropdown. See spec Section 5.

- [ ] **Step 1: Create Navbar.tsx**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useI18n } from '@/providers/I18nProvider';
import { AvatarDropdown } from './AvatarDropdown';
import { SearchOverlay } from './SearchOverlay';
import {
  Search, Globe, Moon, Sun, Bell, Menu, X,
  BookOpen, PenLine, School, Users, FileText, ClipboardList,
  type LucideIcon,
} from 'lucide-react';

interface NavTab {
  href: string;
  label: string;
  Icon: LucideIcon;
}

function getNavTabs(role: string | undefined, t: any): NavTab[] {
  // Navbar tabs exclude Dashboard (logo links there) and Settings (in avatar dropdown)
  switch (role) {
    case 'admin':
      return [
        { href: '/classrooms', label: t.nav.classrooms, Icon: School },
        { href: '/admin/passages', label: t.nav.passages, Icon: BookOpen },
        { href: '/admin/prompts', label: t.nav.prompts, Icon: FileText },
        { href: '/admin/users', label: t.nav.users, Icon: Users },
      ];
    case 'instructor':
      return [
        { href: '/classrooms', label: t.nav.classrooms, Icon: School },
        { href: '/instructor/passages', label: t.nav.passages, Icon: BookOpen },
        { href: '/instructor/prompts', label: t.nav.prompts, Icon: FileText },
        { href: '/instructor/learners', label: t.nav.learners, Icon: Users },
        { href: '/instructor/submissions', label: t.nav.submissions, Icon: ClipboardList },
      ];
    default: // learner
      return [
        { href: '/reading', label: t.nav.reading, Icon: BookOpen },
        { href: '/writing', label: t.nav.writing, Icon: PenLine },
        { href: '/classrooms', label: t.nav.classrooms, Icon: School },
      ];
  }
}

export function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = getNavTabs(user?.role, t);

  // Ctrl+K / Cmd+K shortcut
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      <nav className="teachy-navbar">
        {/* Left — Brand */}
        <div className="navbar-left">
          <button
            className="navbar-hamburger"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/dashboard" className="navbar-brand">
            <div className="navbar-logo">T</div>
            <span className="navbar-brand-text">{t.app_name}</span>
          </Link>
        </div>

        {/* Center — Navigation Tabs */}
        <div className="navbar-center">
          {tabs.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`navbar-tab ${isActive(tab.href) ? 'navbar-tab--active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Right — Actions */}
        <div className="navbar-right">
          <button className="navbar-action-btn" onClick={() => setSearchOpen(true)} title="Search (Ctrl+K)">
            <Search size={18} />
          </button>
          <button
            className="navbar-action-btn"
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            title={lang === 'vi' ? 'English' : 'Tieng Viet'}
          >
            <Globe size={18} />
          </button>
          <button className="navbar-action-btn" onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="navbar-action-btn" title="Notifications">
            <Bell size={18} />
          </button>
          <AvatarDropdown />
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="navbar-mobile-menu" onClick={e => e.stopPropagation()}>
            {tabs.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`navbar-mobile-link ${isActive(tab.href) ? 'navbar-mobile-link--active' : ''}`}
              >
                <tab.Icon size={20} />
                <span>{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
```

- [ ] **Step 2: Add CSS for navbar to globals.css**

```css
/* ── Teachy Navbar ── */
.teachy-navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  background: var(--color-bg-card);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 160px;
}

.navbar-hamburger {
  display: none;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
}
.navbar-hamburger:hover {
  background: var(--color-bg-secondary);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.navbar-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
}

.navbar-brand-text {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.navbar-center {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.navbar-tab {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
  line-height: calc(var(--navbar-height) - 2px);
}
.navbar-tab:hover {
  color: var(--color-text-primary);
}
.navbar-tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.navbar-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.navbar-action-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

/* ── Mobile Menu ── */
.navbar-mobile-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  top: var(--navbar-height);
  z-index: 35;
  background: rgba(29, 23, 43, 0.3);
}

.navbar-mobile-menu {
  width: 280px;
  height: 100%;
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.navbar-mobile-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: background var(--transition-fast);
}
.navbar-mobile-link:hover {
  background: var(--color-bg-secondary);
}
.navbar-mobile-link--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .navbar-hamburger { display: flex; }
  .navbar-center { display: none; }
  .navbar-mobile-backdrop { display: block; }
  .avatar-name { display: none; }
  .navbar-brand-text { display: none; }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/layout/Navbar.tsx apps/frontend/src/app/globals.css
git commit -m "feat: add Navbar component with role-based tabs and mobile menu"
```

---

### Task 6: Create new IconSidebar component

**Files:**
- Create: `apps/frontend/src/components/layout/IconSidebar.tsx`
- Modify: `apps/frontend/src/app/globals.css` (add sidebar styles)

**Context:** Replaces Sidebar.tsx. Icon-only collapsed (64px), expands to 240px on hover. See spec Section 6.

- [ ] **Step 1: Create IconSidebar.tsx**

```tsx
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import {
  LayoutDashboard, BookOpen, PenLine, School, Users,
  FileText, ClipboardList, type LucideIcon,
} from 'lucide-react';

interface SidebarItem {
  href: string;
  Icon: LucideIcon;
  label: string;
}

function getSidebarItems(role: string | undefined, t: any): SidebarItem[] {
  // Sidebar always includes Dashboard (unlike navbar)
  switch (role) {
    case 'admin':
      return [
        { href: '/dashboard', Icon: LayoutDashboard, label: t.nav.dashboard },
        { href: '/classrooms', Icon: School, label: t.nav.classrooms },
        { href: '/admin/passages', Icon: BookOpen, label: t.nav.passages },
        { href: '/admin/prompts', Icon: FileText, label: t.nav.prompts },
        { href: '/admin/users', Icon: Users, label: t.nav.users },
      ];
    case 'instructor':
      return [
        { href: '/dashboard', Icon: LayoutDashboard, label: t.nav.dashboard },
        { href: '/classrooms', Icon: School, label: t.nav.classrooms },
        { href: '/instructor/passages', Icon: BookOpen, label: t.nav.passages },
        { href: '/instructor/prompts', Icon: FileText, label: t.nav.prompts },
        { href: '/instructor/learners', Icon: Users, label: t.nav.learners },
        { href: '/instructor/submissions', Icon: ClipboardList, label: t.nav.submissions },
      ];
    default: // learner
      return [
        { href: '/dashboard', Icon: LayoutDashboard, label: t.nav.dashboard },
        { href: '/reading', Icon: BookOpen, label: t.nav.reading },
        { href: '/writing', Icon: PenLine, label: t.nav.writing },
        { href: '/classrooms', Icon: School, label: t.nav.classrooms },
      ];
  }
}

export function IconSidebar() {
  const { user } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const items = getSidebarItems(user?.role, t);

  // Detect touch device on first interaction
  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      setIsTouchDevice(true);
    } else {
      setExpanded(true);
    }
  }, []);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') {
      setExpanded(false);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (isTouchDevice) {
      setExpanded(prev => !prev);
    }
  }, [isTouchDevice]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const initial = user?.display_name?.charAt(0).toUpperCase() || '?';

  return (
    <aside
      className={`icon-sidebar ${expanded ? 'icon-sidebar--expanded' : ''}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <nav className="icon-sidebar-nav">
        {items.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`icon-sidebar-link ${active ? 'icon-sidebar-link--active' : ''}`}
              title={!expanded ? item.label : undefined}
            >
              <item.Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              {expanded && <span className="icon-sidebar-label">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="icon-sidebar-footer">
        <div className="icon-sidebar-avatar">{initial}</div>
        {expanded && (
          <div className="icon-sidebar-user-info">
            <span className="icon-sidebar-user-name">{user?.display_name}</span>
            <span className="icon-sidebar-user-role">{user?.role}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Add CSS for icon sidebar to globals.css**

```css
/* ── Icon Sidebar ── */
.icon-sidebar {
  position: fixed;
  left: 0;
  top: var(--navbar-height);
  height: calc(100vh - var(--navbar-height));
  width: var(--sidebar-width);
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  z-index: 30;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: width 200ms ease;
  overflow: hidden;
}

.icon-sidebar--expanded {
  width: var(--sidebar-width-expanded);
  box-shadow: var(--shadow-md);
}

.icon-sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.5rem;
}

.icon-sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
}
.icon-sidebar-link:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
.icon-sidebar-link--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.icon-sidebar-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.icon-sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-sidebar-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.icon-sidebar-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.icon-sidebar-user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.icon-sidebar-user-role {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: capitalize;
}

/* Hide sidebar on mobile */
@media (max-width: 768px) {
  .icon-sidebar { display: none; }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/layout/IconSidebar.tsx apps/frontend/src/app/globals.css
git commit -m "feat: add IconSidebar component with hover-expand and touch fallback"
```

---

### Task 7: Rebuild AppShell with hybrid layout

**Files:**
- Modify: `apps/frontend/src/components/layout/AppShell.tsx` (full rewrite)
- Modify: `apps/frontend/src/components/layout/index.ts` (update exports)
- Modify: `apps/frontend/src/app/globals.css` (update layout styles)
- Delete: `apps/frontend/src/components/layout/Header.tsx`
- Delete: `apps/frontend/src/components/layout/Sidebar.tsx`

**Context:** Replace the current sidebar+header layout with navbar+icon-sidebar hybrid. Update PUBLIC_PATHS to include `/`. Keep all auth routing logic intact.

- [ ] **Step 1: Rewrite AppShell.tsx**

```tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Navbar } from './Navbar';
import { IconSidebar } from './IconSidebar';

const PUBLIC_PATHS = new Set(['/', '/login', '/register']);

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublic) {
      router.replace('/login');
    }

    if (user && isPublic) {
      router.replace('/dashboard');
    }
  }, [user, loading, isPublic, router]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
      </div>
    );
  }

  // Public pages — no shell
  if (isPublic) {
    return <>{children}</>;
  }

  // Authenticated layout — hybrid navbar + icon sidebar
  if (!user) return null;

  return (
    <div className="app-layout-hybrid">
      <Navbar />
      <IconSidebar />
      <main className="app-content-hybrid">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Update layout CSS in globals.css**

Replace the existing `.app-layout` and `.app-main` styles with:

```css
/* ── Hybrid Layout ── */
.app-layout-hybrid {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.app-content-hybrid {
  margin-left: var(--sidebar-width);
  margin-top: 0; /* navbar is sticky, not fixed */
  padding: var(--space-xl) var(--space-xl) var(--space-2xl);
  max-width: 1400px;
}

@media (max-width: 768px) {
  .app-content-hybrid {
    margin-left: 0;
    padding: var(--space-lg);
  }
}
```

Keep the existing `.app-loading` and `.app-loading-spinner` styles as-is.

- [ ] **Step 3: Update index.ts exports**

```ts
export { AppShell } from './AppShell';
export { Navbar } from './Navbar';
export { IconSidebar } from './IconSidebar';
export { AvatarDropdown } from './AvatarDropdown';
export { SearchOverlay } from './SearchOverlay';
```

- [ ] **Step 4: Delete old Header.tsx and Sidebar.tsx**

```bash
rm apps/frontend/src/components/layout/Header.tsx
rm apps/frontend/src/components/layout/Sidebar.tsx
```

- [ ] **Step 5: Search for any remaining imports of old Header/Sidebar**

```bash
grep -r "from.*Header" apps/frontend/src/ --include="*.tsx"
grep -r "from.*Sidebar" apps/frontend/src/ --include="*.tsx"
```

Fix any remaining imports. The only consumers should have been AppShell (already updated).

- [ ] **Step 6: Verify hybrid layout works**

Run: `cd apps/frontend && npm run dev`
Manual checks:
- Navbar appears at top with "T" logo, tabs, action icons
- Icon sidebar on left with icons (64px)
- Hover sidebar → expands to 240px with labels
- Content area renders correctly to the right
- Theme toggle works
- Language toggle works
- Mobile: sidebar hidden, hamburger menu appears

- [ ] **Step 7: Commit**

```bash
git add -A apps/frontend/src/components/layout/
git add apps/frontend/src/app/globals.css
git commit -m "feat: rebuild AppShell with hybrid navbar + icon sidebar layout"
```

---

## Chunk 3: Page Redesigns

### Task 8: Redesign dashboard page

**Files:**
- Modify: `apps/frontend/src/app/dashboard/page.tsx`
- Modify: `apps/frontend/src/app/globals.css` (update stat card styles)

**Context:** Update WelcomeBanner with time-based greeting, redesign stat cards with gradient icon bg, update quick action cards with left border accent. See spec Section 7.

- [ ] **Step 1: Update WelcomeBanner with time-based greeting**

Replace the existing `WelcomeBanner` function:

```tsx
function WelcomeBanner({ name, subtitle }: { name: string; subtitle: string }) {
  const { t } = useI18n();

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return t.greeting.morning;
    if (hour < 18) return t.greeting.afternoon;
    return t.greeting.evening;
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{
        fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem',
        color: 'var(--color-text-primary)',
        letterSpacing: '-0.03em',
      }}>
        {getGreeting()}, {name}
      </h1>
      <p style={{
        fontSize: '0.9rem', margin: 0,
        color: 'var(--color-text-muted)',
      }}>
        {subtitle}
      </p>
    </div>
  );
}
```

Add `useI18n` import if not already present.

- [ ] **Step 2: Update StatIcon with gradient background**

Replace the existing `StatIcon` function:

```tsx
function StatIcon({ Icon }: { Icon: LucideIcon }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: 'linear-gradient(135deg, var(--color-primary-light), rgba(95,75,139,0.04))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={20} style={{ color: 'var(--color-primary)' }} strokeWidth={1.8} />
    </div>
  );
}
```

- [ ] **Step 3: Update QuickAction with left border accent**

Replace the existing `QuickAction` function:

```tsx
function QuickAction({ href, Icon, label, desc }: {
  href: string; Icon: LucideIcon; label: string; desc: string;
}) {
  return (
    <Link href={href} className="quick-action-card" style={{ textDecoration: 'none' }}>
      <StatIcon Icon={Icon} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
          {desc}
        </div>
      </div>
      <ArrowRight size={16} className="quick-action-arrow" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
    </Link>
  );
}
```

- [ ] **Step 4: Update stat card label style**

In each dashboard variant (Learner/Instructor/Admin), update the `stat-card-label` to use uppercase:

```tsx
<div className="stat-card-label" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
  {c.label}
</div>
```

- [ ] **Step 5: Update CSS for stat cards and quick actions**

Update `.stat-card` and add `.quick-action-card` in globals.css:

```css
/* ── Stat Cards (updated) ── */
.stat-card {
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-card);
  transition: border-color var(--transition-fast);
}
.stat-card:hover {
  border-color: var(--color-primary-medium);
}

.stat-card-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-muted);
}
.stat-card-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-top: 0.125rem;
}

/* ── Quick Action Cards ── */
.quick-action-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-xl);
  background: var(--color-bg-card);
  transition: background var(--transition-fast);
  cursor: pointer;
}
.quick-action-card:hover {
  background: var(--color-bg-secondary);
}
.quick-action-card:hover .quick-action-arrow {
  transform: translateX(4px);
}
.quick-action-arrow {
  transition: transform var(--transition-fast);
}
```

- [ ] **Step 6: Update WritingCriteria bar colors to use salmon for medium**

In `CriteriaBar`, change the medium range color:

```tsx
background: pct > 66 ? '#10b981' : pct > 33 ? '#e69a8d' : '#ef4444',
```

- [ ] **Step 7: Update recent submissions score badge**

In the Learner dashboard `recent_submissions` map, update the score display:

```tsx
<div style={{
  fontWeight: 600, fontSize: '0.85rem',
  color: 'var(--color-primary)',
  background: 'var(--color-primary-light)',
  padding: '0.2rem 0.6rem',
  borderRadius: 'var(--radius-full)',
}}>
  {sub.type === 'reading' ? `${sub.score}%` : `${sub.score}/9`}
</div>
```

- [ ] **Step 8: Verify dashboard renders correctly**

Run: `cd apps/frontend && npm run dev`
Manual checks:
- Time-based greeting shows
- Stat cards have gradient icon bg
- Quick actions have left purple border
- Hover effects work
- Scores show as pills

- [ ] **Step 9: Commit**

```bash
git add apps/frontend/src/app/dashboard/page.tsx apps/frontend/src/app/globals.css
git commit -m "style: redesign dashboard cards, welcome banner, and quick actions"
```

---

### Task 9: Redesign auth pages (login/register)

**Files:**
- Modify: `apps/frontend/src/app/login/page.tsx`
- Modify: `apps/frontend/src/app/register/page.tsx`
- Modify: `apps/frontend/src/app/globals.css` (update auth styles)

**Context:** Centered single-column card layout with Teachy branding. See spec Section 8.

- [ ] **Step 1: Rewrite login page**

Replace `apps/frontend/src/app/login/page.tsx`:

```tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">T</div>
          <span className="auth-brand-text">{t.app_name}</span>
        </div>
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subtitle">{t.auth.login_subtitle || 'Sign in to continue learning'}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-field">
            <label className="form-label">{t.auth.email}</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">{t.auth.password}</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : t.auth.login}
          </button>
        </form>

        <p className="auth-footer-link">
          {t.auth.no_account}{' '}
          <Link href="/register">{t.auth.register}</Link>
        </p>
      </div>

      <p className="auth-page-footer">&copy; 2026 Teachy</p>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite register page**

Replace `apps/frontend/src/app/register/page.tsx` with similar structure — adding Display Name, Email, Password, Confirm Password fields. Keep existing role selection if present. Follow same auth-card layout.

Key differences from login:
- Heading: "Create account" / `t.auth.register`
- Extra fields: display_name, confirm password
- Footer link: "Already have an account? Sign in"
- Password match validation

- [ ] **Step 3: Update auth CSS in globals.css**

Replace the existing auth page styles (lines ~763-885). **Remove these old classes first:** `.auth-header`, `.auth-logo` (old emoji logo), `.auth-title`, `.auth-footer`, `.form-group`. Then add the new classes below:

```css
/* ── Auth Pages ── */
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-page);
  padding: var(--space-lg);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
}

.auth-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.auth-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
}

.auth-brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.auth-heading {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem;
}

.auth-subtitle {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0 0 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-error {
  padding: 0.625rem 0.875rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  color: var(--color-error);
  font-size: 0.85rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-input {
  height: 44px;
  padding: 0 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.auth-btn {
  width: 100%;
  height: 44px;
  margin-top: 0.5rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
}
.auth-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}
.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer-link {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.auth-footer-link a {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}
.auth-footer-link a:hover {
  text-decoration: underline;
}

.auth-page-footer {
  margin-top: 2rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
```

- [ ] **Step 4: Verify auth pages render correctly**

Run: `cd apps/frontend && npm run dev`
Manual checks:
- Open /login — centered card, Teachy branding, purple primary
- Open /register — same style, extra fields
- Dark mode: card adapts correctly
- Error state: red banner on invalid credentials

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/app/login/page.tsx apps/frontend/src/app/register/page.tsx apps/frontend/src/app/globals.css
git commit -m "style: redesign login and register pages with Teachy branding"
```

---

### Task 10: Create landing page

**Files:**
- Create: `apps/frontend/src/components/landing/LandingPage.tsx`
- Modify: `apps/frontend/src/app/page.tsx` (replace redirect with LandingPage)
- Modify: `apps/frontend/src/app/globals.css` (add landing page styles)

**Context:** Public landing page for unauthenticated users. Hero, features, CTA, footer. See spec Section 9 and mockup at `.superpowers/brainstorm/s4/landing-page-v2.html`.

- [ ] **Step 1: Create LandingPage.tsx**

```tsx
'use client';

import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { BookOpen, PenLine, School } from 'lucide-react';

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand">
            <div className="navbar-logo">T</div>
            <span className="navbar-brand-text">{t.app_name}</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">{t.landing.nav_features}</a>
            <a href="#about" className="landing-nav-link">{t.landing.nav_about}</a>
          </div>
          <div className="landing-nav-actions">
            <Link href="/login" className="landing-btn-outline">{t.auth.login}</Link>
            <Link href="/register" className="landing-btn-primary">{t.auth.register}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <span className="landing-badge">{t.landing.hero_badge}</span>
        <h1 className="landing-hero-title">{t.landing.hero_title}</h1>
        <p className="landing-hero-subtitle">{t.landing.hero_subtitle}</p>
        <div className="landing-hero-actions">
          <Link href="/register" className="landing-btn-primary landing-btn-lg">{t.landing.cta_start}</Link>
          <Link href="#about" className="landing-btn-outline landing-btn-lg">{t.landing.cta_contact}</Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-features">
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon"><BookOpen size={28} /></div>
            <h3>{t.landing.feature_reading}</h3>
            <p>{t.landing.feature_reading_desc}</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon"><PenLine size={28} /></div>
            <h3>{t.landing.feature_writing}</h3>
            <p>{t.landing.feature_writing_desc}</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon"><School size={28} /></div>
            <h3>{t.landing.feature_classroom}</h3>
            <p>{t.landing.feature_classroom_desc}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="landing-cta">
        <h2>{t.landing.hero_title}</h2>
        <p>{t.landing.hero_subtitle}</p>
        <div className="landing-hero-actions">
          <Link href="/register" className="landing-btn-accent landing-btn-lg">{t.landing.cta_start}</Link>
          <Link href="/login" className="landing-btn-outline-light landing-btn-lg">{t.landing.cta_contact}</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-nav-brand">
            <div className="navbar-logo">T</div>
            <span style={{ color: '#f0eef4', fontWeight: 700, fontSize: '1.1rem' }}>{t.app_name}</span>
          </div>
          <p>&copy; 2026 Teachy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Update app/page.tsx**

Replace the redirect with the LandingPage component:

```tsx
import { LandingPage } from '@/components/landing/LandingPage';

export default function HomePage() {
  return <LandingPage />;
}
```

Remove the `'use client'` directive if the page was client-side only for the redirect. However since LandingPage is a client component, the page itself can be a server component that just renders it.

Note: Remove the old `import { redirect } from 'next/navigation'` and `redirect('/dashboard')`.

- [ ] **Step 3: Add landing page CSS to globals.css**

```css
/* ── Landing Page ── */
.landing {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.landing-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
}
.landing-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.landing-nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.landing-nav-links {
  display: flex;
  gap: 2rem;
}
.landing-nav-link {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.landing-nav-link:hover {
  color: var(--color-primary);
}
.landing-nav-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Buttons */
.landing-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.landing-btn-primary:hover {
  background: var(--color-primary-hover);
}

.landing-btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.landing-btn-outline:hover {
  background: var(--color-primary-light);
}

.landing-btn-accent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.landing-btn-accent:hover {
  background: var(--color-accent-hover);
}

.landing-btn-outline-light {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.landing-btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.1);
}

.landing-btn-lg {
  padding: 0.75rem 1.75rem;
  font-size: 1rem;
}

/* Hero */
.landing-hero {
  max-width: 800px;
  margin: 0 auto;
  padding: 6rem 1.5rem 4rem;
  text-align: center;
}

.landing-badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.landing-hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 1rem;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.landing-hero-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-muted);
  margin: 0 0 2rem;
  line-height: 1.6;
}

.landing-hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Features */
.landing-features {
  max-width: 1100px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.landing-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.landing-feature-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 2rem;
  text-align: center;
}
.landing-feature-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 1rem 0 0.5rem;
}
.landing-feature-card p {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}

.landing-feature-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* CTA Section */
.landing-cta {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  text-align: center;
  background: var(--color-primary);
  border-radius: var(--radius-xl);
  margin-bottom: 4rem;
}
.landing-cta h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.75rem;
}
.landing-cta p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 2rem;
}

/* Footer */
.landing-footer {
  background: #1d172b;
  color: #8c85a0;
  padding: 2rem 1.5rem;
}
.landing-footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.landing-footer p {
  margin: 0;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .landing-hero-title { font-size: 2rem; }
  .landing-features-grid { grid-template-columns: 1fr; }
  .landing-nav-links { display: none; }
  .landing-footer-inner { flex-direction: column; gap: 1rem; }
}
```

- [ ] **Step 4: Verify landing page renders**

Run: `cd apps/frontend && npm run dev`
Manual checks:
- Open http://localhost:3000/ while logged out → landing page shows
- Navbar: logo, links, login/register buttons
- Hero section with badge, heading, CTAs
- 3 feature cards
- Purple CTA section
- Dark footer
- If logged in, should redirect to /dashboard (via AppShell)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/landing/LandingPage.tsx apps/frontend/src/app/page.tsx apps/frontend/src/app/globals.css
git commit -m "feat: add Teachy landing page for public users"
```

---

## Chunk 4: CSS Cleanup & Final Verification

### Task 11: Clean up obsolete CSS and verify all styles

**Files:**
- Modify: `apps/frontend/src/app/globals.css`

**Context:** After all component changes, clean up old CSS that is no longer used (old sidebar styles, old header styles, old layout dimensions).

- [ ] **Step 1: Remove old sidebar CSS**

Remove or replace the old `.sidebar`, `.sidebar--collapsed`, `.sidebar-logo`, `.sidebar-nav`, `.sidebar-link`, `.sidebar-link--active`, `.sidebar-footer`, `.sidebar-user`, `.sidebar-user-avatar`, `.sidebar-user-info`, `.sidebar-user-name`, `.sidebar-user-role` class definitions.

These are replaced by `.icon-sidebar-*` classes.

- [ ] **Step 2: Remove old header CSS**

Remove or replace the old `.app-header`, `.header-left`, `.header-right`, `.header-btn` class definitions.

These are replaced by `.teachy-navbar`, `.navbar-*` classes.

- [ ] **Step 3: Remove old layout CSS**

Remove or replace:
- `.app-layout` → replaced by `.app-layout-hybrid`
- `.app-main` → replaced by `.app-content-hybrid`
- `.sidebar-toggle-btn` → no longer used
- Old `--sidebar-width: 270px` and `--header-height: 72px` references

- [ ] **Step 4: Update Tailwind blue remapping to purple**

Ensure all `.bg-blue-*`, `.text-blue-*`, `.border-blue-*` overrides (lines 159-267) reference `#5f4b8b` (purple) instead of `#6366f1` (indigo).

- [ ] **Step 5: Replace all `--header-height` usages with `--navbar-height`**

Run a global search for `--header-height` in globals.css and replace with `--navbar-height`. Known locations:
- `.rp-wrapper` at line ~1454: `height: calc(100vh - 72px)` → `calc(100vh - var(--navbar-height))`
- Line ~2143: `top: calc(var(--header-height) + 1rem)` → `calc(var(--navbar-height) + 1rem)`
- Line ~2491: similar reference

Also search for hardcoded `72px` in calc() expressions — these referenced the old header height and should use `var(--navbar-height)` (56px) instead.

- [ ] **Step 5b: Verify AuthProvider.tsx has no conflicting routing logic**

Check `apps/frontend/src/providers/AuthProvider.tsx` — confirm it does NOT have its own `PUBLIC_PATHS` or redirect logic for `/`. The routing guard is in `AppShell.tsx` (updated in Task 7). If AuthProvider has any redirect-on-auth logic, add `/` to its public path list too.

- [ ] **Step 6: Full visual verification**

Run: `cd apps/frontend && npm run dev`
Comprehensive manual checks:
1. **Landing page** (logged out): all sections render, links work
2. **Login/Register**: branding, form validation, error states
3. **Dashboard** (all 3 roles): stat cards, quick actions, trend chart
4. **Navbar**: tabs, search overlay, language toggle, theme toggle, avatar dropdown
5. **Sidebar**: hover expand, active state, mobile hidden
6. **Dark mode**: toggle and verify all pages
7. **Responsive**: check at 768px breakpoint — hamburger menu, sidebar hidden
8. **Reading/Writing pages**: content area renders correctly with new margins

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/app/globals.css
git commit -m "chore: clean up obsolete CSS from pre-redesign layout"
```

---

## Execution Summary

| Chunk | Tasks | Focus |
|-------|-------|-------|
| 1 | Tasks 1-2 | Foundation — colors, tokens, i18n |
| 2 | Tasks 3-7 | Layout components — dropdown, search, navbar, sidebar, AppShell |
| 3 | Tasks 8-10 | Page redesigns — dashboard, auth, landing |
| 4 | Task 11 | CSS cleanup & final verification |

**Total tasks:** 11
**Total commits:** ~11-12
**Dependencies:** Chunk 1 must complete before Chunks 2-3. Tasks within Chunk 2 should be done in order (3→4→5→6→7). Tasks in Chunk 3 can run in parallel after Chunk 2.
