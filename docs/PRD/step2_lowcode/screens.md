# 📱 Screens — Langy (Pre-pilot MVP)

> **Mã tài liệu:** STEP2-SCREENS
> **Phiên bản:** 2.0 — Viết lại theo BA/PRD 07/2026
> **Trạng thái:** Updated
> **Tham chiếu:** [10_ui_ux_specifications](../step3_prd/10_ui_ux_specifications.md)

---

## 1. Screen Inventory — Pre-pilot Scope

Chỉ liệt kê screens cần **hoạt động thật** trước pilot 04/11/2026. Prototype có 73 screens; pre-pilot cần 30.

**Legend:** 🟢 Có prototype + backend · 🟡 Có prototype, thiếu/sửa backend · 🆕 Cần thiết kế mới · ⚙️ Logic thay đổi

| # | Screen | Route | Role(s) | Status | Thay đổi so với prototype |
|---|--------|-------|---------|--------|---------------------------|
| **Auth** |
| S01 | Login | `/login` | Public | 🟢 | — |
| S02 | Register | `/register` | Public | ⚙️ | Thêm: năm sinh, age-gate < 16 (consent PH), ToS checkbox, KHÔNG hỏi mã lớp |
| S03 | Forgot Password | `/forgot-password` | Public | 🟡 | Verify backend |
| S04 | Reset Password | `/reset-password` | Public | 🟡 | Verify backend |
| S05 | **Landing Page** | `/` (unauth) | Public | 🆕 | Trang tĩnh: value prop, CTA, SEO (US-5B4) |
| **Learner — Reading** |
| S10 | Reading List | `/reading` | All | 🟢 | — |
| S11 | Reading Test | `/reading/[id]` | Learner | ⚙️ | Responsive mobile: dọc/tab < 900px |
| S12 | Reading Results | `/reading/[id]/result` | Learner | 🟢 | Điểm = "X/Y (Z%)", KHÔNG band |
| S13 | **Reading Attempt Detail** | `/reading/attempts/[id]` | Learner, GV | 🆕 | Xem lại bài cũ từ DB (US-302) |
| **Learner — Writing** |
| S20 | Writing List | `/writing` | All | 🟢 | — |
| S21 | Writing Editor | `/writing/[id]` | Learner | ⚙️ | Auto-save 30s, draft indicator, responsive, lesson_id |
| S22 | **Writing Feedback** | `/writing/submissions/[id]` | Learner | ⚙️ | Hiển thị theo state + chế độ A/B (xem §2.1) |
| S23 | Writing History | `/writing/history` | Learner | 🟢 | Thêm state badge |
| **Learner — Classroom** |
| S30 | **Bài tập của tôi** | `/assignments` | Learner | 🆕 | Bài được giao từ các lớp, badge "trễ" (US-102) |
| S31 | Join Classroom | `/classrooms/join` | Learner | 🟡 | Mã mời 6 ký tự |
| **Learner — Dashboard** |
| S40 | Dashboard | `/dashboard` | Learner | ⚙️ | Hai variant: classroom (có Bài tập) vs self-study (có cross-sell) |
| S41 | Progress Analytics | `/progress` | Learner | 🟡 | Band/% theo thời gian (dữ liệu thật) |
| **Instructor** |
| S50 | Instructor Dashboard | `/instructor/dashboard` | Instructor | ⚙️ | Dữ liệu thật thay mock; review queue widget |
| S51 | Classrooms List | `/classrooms` | Instructor | 🟢 | — |
| S52 | Classroom Create/Edit | `/classrooms/new` | Instructor | ⚙️ | Thêm: `writing_mode` A/B + tooltip |
| S53 | Classroom Detail | `/classrooms/[id]` | Instructor | 🟢 | — |
| S54 | Classroom Members | `/classrooms/[id]/members` | Instructor | 🟢 | — |
| S55 | Classroom Progress | `/classrooms/[id]/progress` | Instructor | 🟡 | Band/% từng HS (US-502) |
| S56 | **Review Queue** | `/instructor/review` | Instructor | 🆕 | Lọc lớp + state (US-204) |
| S57 | **Review Detail** | `/instructor/review/[id]` | Instructor | ⚙️ | Sửa band từng tiêu chí + chốt ≤ 3 click |
| S58 | **Giao bài** | `/classrooms/[id]/assign` | Instructor | 🆕 | Chọn đề + deadline (US-102) |
| **Import** |
| S60 | **Import đề** | `/import` | Instructor | 🆕 | Upload docx / paste text (US-401) |
| S61 | **Import Preview** | `/import/preview/[id]` | Instructor | 🆕 | Preview + sửa + checkbox bản quyền (US-402) |
| **Settings** |
| S70 | Settings | `/settings` | All | 🟢 | — |
| S71 | **Xóa tài khoản** | `/settings` (section) | All | 🆕 | Confirm → soft delete 7d (US-602) |

---

## 2. Wireframes — Screens có logic phức tạp

### 2.1 S22 — Writing Feedback (hiển thị theo state)

**state = released_ai (chế độ A / tự học):**
```
┌─────────────────────────────────────────┐
│  Band 6.5  ⚠️ Ước lượng bởi AI          │
│  TR: 6.0 │ CC: 7.0 │ LR: 6.5 │ GRA: 6.5│
│  ── Điểm mạnh ──                        │
│  • ...                                   │
│  ── Cần cải thiện ──                     │
│  • ...                                   │
│  ⓘ Giáo viên sẽ xác nhận               │
└─────────────────────────────────────────┘
```

**state = pending_review (chế độ B, HS nhìn):**
```
┌─────────────────────────────────────────┐
│  ✓ Đã nộp — đang chờ giáo viên          │
│  Nộp lúc: 14:30, 05/11/2026             │
│  [scores/feedback bị ẩn]                 │
└─────────────────────────────────────────┘
```

**state = finalized:**
```
┌─────────────────────────────────────────┐
│  Band 6.0  ✅ Giáo viên đã chốt         │
│  (AI: 6.5 → GV: 6.0)                    │
│  TR: 5.5↓ │ CC: 7.0 │ LR: 6.0↓ │ GRA: 6.5│
│  ── Nhận xét giáo viên ──               │
│  "Cần cải thiện cohesion..."             │
└─────────────────────────────────────────┘
```

### 2.2 S57 — Instructor Review Detail

```
┌──────────────────────────────────────────────────────┐
│  ← Review Queue    Minh · Lớp IELTS 7 · Task 2       │
├──────────────────────┬───────────────────────────────┤
│  [Essay content      │  ── Band AI ──                 │
│   scrollable]        │  TR: [6.0 ▾]  CC: [7.0 ▾]    │
│                      │  LR: [6.5 ▾]  GRA: [6.5 ▾]   │
│                      │  ── Nhận xét ──                │
│                      │  [textarea]                     │
│                      │  [Chấm lại]  [═ Chốt điểm ═] │
└──────────────────────┴───────────────────────────────┘
```

### 2.3 S02 — Register (updated)

```
┌─────────────────────────────────────┐
│         Đăng ký tài khoản           │
│  Email:     [___________________]    │
│  Mật khẩu: [___________________]    │
│  Tên:       [___________________]    │
│  Năm sinh:  [____]                   │
│  ┌─ if age < 16 ──────────────────┐ │
│  │ ☐ Phụ huynh đã đồng ý         │ │
│  │ Email PH: [________________]   │ │
│  └────────────────────────────────┘ │
│  ☐ Đồng ý Điều khoản & CSQRTƯ      │
│  [═══ Đăng ký ═══]                  │
│  Đã có tài khoản? Đăng nhập →       │
└─────────────────────────────────────┘
```

---

## 3. Screens deferred (có prototype, ngoài pre-pilot)

| Category | Screens | Khi nào |
|----------|---------|---------|
| Listening | List, Preview, Test, Results | Sau pilot |
| Speaking | List, Preview, Practice, Result | Sau pilot |
| Vocabulary & Flashcard | List, Detail, Drill | Sau pilot |
| AI Tutor / Mock Test / Leaderboard | 5 screens | Sau pilot |
| Bulk Grading / Gradebook / Messages / Calendar | Instructor tools | Sau pilot |
| Admin Analytics / Moderation / Audit | Admin tools | Scale 50+ GV |
| Placement Test / Welcome Tour | Onboarding | Sau pilot |
