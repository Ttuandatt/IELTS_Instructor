# UI Redesign — Teachy Brand & Design System

**Status:** IN PROGRESS — Brainstorming phase (Phần 1/Landing Page approved, còn lại chưa trình bày)
**Date:** 2026-03-17
**Reference:** https://teachy.odoo.com/

---

## 1. Tổng quan quyết định

### Brand
- **Tên app:** Teachy
- **Logo:** Icon chữ "T" trên nền primary color, bo tròn 8px

### Scope
- **Landing page công khai** (mới) — trang giới thiệu cho người chưa đăng nhập
- **Redesign dashboard app** (cải tiến) — header, sidebar, cards, colors, typography

### Design Tone
- **Clean & Minimal** — nhiều whitespace, màu nhẹ, ít shadow, flat design (theo phong cách Teachy/Odoo)

### Approach
- **Component Rebuild** — viết lại AppShell, Header, Sidebar + tạo components mới cho landing page. Giữ nguyên business logic/pages, chỉ thay layout shell.

---

## 2. Bảng màu (từ teachy.odoo.com)

| Role | Hex | Tên | Sử dụng |
|------|-----|-----|---------|
| Primary | `#5f4b8b` | Purple/Violet | Logo, buttons chính, links, active states |
| Accent | `#e69a8d` | Salmon/Peach | CTA phụ, điểm nhấn, badges |
| Light BG | `#f2f0f5` | Lavender Mist | Background sections, card borders, hover states |
| White | `#FFFFFF` | White | Main background, card backgrounds |
| Dark | `#1d172b` | Navy Charcoal | Footer, headings, dark text |

### Màu phụ trợ (cần xác nhận)
- **Text body:** `#64748b` (gray, giữ từ design hiện tại)
- **Border:** `#DEE2E6` (từ Odoo CSS)
- **Success/Warning/Error:** Giữ nguyên từ hệ thống hiện tại

### Lưu ý
- Ban đầu chọn Blue (#3b82f6) nhưng sau đó đổi sang bảng màu Teachy (purple-salmon)

---

## 3. Layout Structure

### Dashboard App — Hybrid Layout
- **Top navbar** cho navigation chính (thay thế sidebar hiện tại)
- **Icon sidebar** thu gọn bên trái (expand on hover)
- Kết hợp cả hai để tối ưu không gian

### Landing Page (Approved)
Cấu trúc từ trên xuống:
1. **Navbar:** Logo Teachy + menu (Trang chủ, Tính năng, Về chúng tôi) + Đăng nhập/Đăng ký
2. **Hero:** Badge "IELTS Preparation Platform" + heading lớn + mô tả + 2 CTA (primary + outline)
3. **Features:** 3 cards ngang — Reading Practice, Writing Practice, Lớp học trực tuyến
4. **CTA Section:** Đăng ký miễn phí + Liên hệ tư vấn (accent color)
5. **Footer:** Minimal — logo + copyright, dark background (#1d172b)

---

## 4. Phần chưa trình bày (TODO)

Các phần design cần tiếp tục brainstorm:

- [ ] **Phần 2: Dashboard Layout** — Hybrid navbar + icon sidebar wireframe
- [ ] **Phần 3: Dashboard Cards & Stats** — Redesign stat cards, quick actions
- [ ] **Phần 4: Header/Navbar mới** — Search, notifications, profile, theme toggle
- [ ] **Phần 5: Sidebar mới** — Icon-only sidebar, expand on hover, role-based menu
- [ ] **Phần 6: Color System & Typography** — CSS variables update, font choices
- [ ] **Phần 7: Auth Pages** — Login/Register redesign với branding mới

---

## 5. Thông tin kỹ thuật hiện tại

### Frontend Stack
- Next.js 16.1 (App Router) + React 19 + TypeScript 5
- Tailwind CSS v4 + Custom CSS variables (globals.css ~2571 lines)
- Lucide React icons
- TanStack React Query v5

### Components cần rebuild
- `src/components/layout/AppShell.tsx` — Main layout wrapper
- `src/components/layout/Header.tsx` — Top navigation bar
- `src/components/layout/Sidebar.tsx` — Side navigation

### Components cần tạo mới
- Landing page route (`/` hoặc `/home`)
- Public navbar component
- Feature cards component
- Hero section component

### Files cần update
- `src/app/globals.css` — CSS variables, color system
- `src/i18n/vi.json` + `src/i18n/en.json` — Brand name, new translations
- `src/providers/AuthProvider.tsx` — Routing logic cho landing page

---

## 6. Mockups

Mockups HTML đã tạo trong brainstorm session:
- `.superpowers/brainstorm/s4/landing-page-v2.html` — Landing page với bảng màu Teachy (APPROVED)

---

## 7. Brainstorming Process State

- [x] Explore project context
- [x] Offer visual companion (accepted)
- [x] Ask clarifying questions (7 questions answered)
- [x] Propose approaches (Approach 2: Component Rebuild — approved)
- [ ] Present design (Phần 1 Landing Page done, Phần 2-7 remaining)
- [ ] Write final design doc
- [ ] Spec review loop
- [ ] User reviews written spec
- [ ] Transition to implementation (invoke writing-plans skill)
