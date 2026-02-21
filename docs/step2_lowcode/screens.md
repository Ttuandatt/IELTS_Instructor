# 📱 Screens — IELTS Helper (MVP)

> **Mã tài liệu:** STEP2-SCREENS  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Framework:** Vibe Coding v2.0 — Step 2: Low-Code Prototype

---

## 1. Screen Inventory

| # | Screen | Route | Auth | Role | Description |
|---|--------|-------|------|------|-------------|
| S01 | Login | `/login` | Public | All | Email/password form; language toggle |
| S02 | Register | `/register` | Public | All | Registration form; link to login |
| S03 | Dashboard | `/dashboard` | Required | Learner | Progress cards, recent submissions, trend chart |
| S04 | Reading Catalog | `/reading` | Required | All | Passage list with filters (level, topic); card grid |
| S05 | Reading Practice | `/reading/:id` | Required | Learner | Split: passage left, questions right, timer top |
| S06 | Reading Results | `/reading/:id/result/:subId` | Required | Learner | Score header, per-question breakdown |
| S07 | Reading History | `/reading/history` | Required | Learner | Past attempts table/list |
| S08 | Writing Catalog | `/writing` | Required | All | Prompt list with filters (task type, level, topic) |
| S09 | Writing Editor | `/writing/:id` | Required | Learner | Split: prompt left, editor right, word count, submit |
| S10 | Writing Scoring | `/writing/submissions/:id` (pending) | Required | Learner | Progress indicator while scoring |
| S11 | Writing Feedback | `/writing/submissions/:id` (done) | Required | Learner | Score bars, feedback panel, metadata |
| S12 | Writing History | `/writing/history` | Required | Learner | Past submissions list with scores |
| S13 | Settings | `/settings` | Required | All | Profile, language toggle, theme toggle |
| S14 | Admin Passages | `/admin/passages` | Required | Admin | Table of all passages (drafts + published) |
| S15 | Admin Passage Form | `/admin/passages/new` or `:id` | Required | Admin | Create/edit passage, manage questions |
| S16 | Admin Prompts | `/admin/prompts` | Required | Admin | Table of all prompts |
| S17 | Admin Prompt Form | `/admin/prompts/new` or `:id` | Required | Admin | Create/edit prompt |
| S18 | Admin Sources | `/admin/sources` | Required | Admin | Imported sources list |
| S19 | Admin Import | `/admin/sources/import` (modal) | Required | Admin | Import from NotebookLM |
| S20 | Admin Users | `/admin/users` | Required | Admin | User management table |
| S21 | 404 | `/404` | Public | All | Not found message with navigation |

---

## 2. Screen Layout Templates

### Layout A — Auth Pages (S01, S02)
```
┌─────────────────────────────────────┐
│  [🌐 Lang]              IELTS Help  │
│                                      │
│         ┌──────────────┐             │
│         │              │             │
│         │   Form Card  │             │
│         │   (400px)    │             │
│         │              │             │
│         └──────────────┘             │
│                                      │
│         [Link to other page]         │
└─────────────────────────────────────┘
```

### Layout B — Main App (S03–S13)
```
┌──────┬──────────────────────────────┐
│      │  Header [logo] [...] [🔔][👤]│
│  S   ├──────────────────────────────┤
│  i   │                              │
│  d   │                              │
│  e   │       Content Area           │
│  b   │                              │
│  a   │                              │
│  r   │                              │
│      │                              │
└──────┴──────────────────────────────┘
```

### Layout C — Split View (S05, S09)
```
┌──────┬────────────────┬─────────────┐
│      │  Header  [⏱️ Timer]          │
│  S   ├────────────────┬─────────────┤
│  i   │                │             │
│  d   │  Left Pane     │ Right Pane  │
│  e   │  (60%)         │ (40%)       │
│  b   │  Passage/Prompt│ Questions/  │
│  a   │                │ Editor      │
│  r   │                │             │
│      │                │ [Submit]    │
└──────┴────────────────┴─────────────┘
```

### Layout D — Admin (S14–S20)
```
┌──────┬──────────────────────────────┐
│      │  Header [Admin CMS]          │
│  S   ├──────────────────────────────┤
│  i   │  [Filters] [Search] [+ New]  │
│  d   ├──────────────────────────────┤
│  e   │                              │
│  b   │  Full-width Table            │
│  a   │                              │
│  r   │                              │
│      ├──────────────────────────────┤
│      │  [Pagination]                │
└──────┴──────────────────────────────┘
```

---

## 3. Key Screen Wireframes

### S03 — Dashboard
```
┌──────────────────────────────────────┐
│  📊 Dashboard                        │
├──────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐        │
│  │ 📖 Reading │  │ ✍️ Writing │        │
│  │ Avg: 72%  │  │ Avg: 5.7  │        │
│  │ Done: 12  │  │ Done: 8   │        │
│  │ Rate: 85% │  │ TR CC LR G│        │
│  └───────────┘  └───────────┘        │
│                                      │
│  📈 Progress Trend (4 weeks)         │
│  ┌──────────────────────────────┐    │
│  │      ╱──────╲     line chart │    │
│  │  ───╱        ╲───           │    │
│  └──────────────────────────────┘    │
│                                      │
│  🕐 Recent Submissions              │
│  • Reading: Climate Change  85%  2h  │
│  • Writing: Technology      6.0  5h  │
│  • Reading: Renewable Energy 77% 1d  │
└──────────────────────────────────────┘
```

### S05 — Reading Practice
```
┌────────────────────────┬─────────────┐
│  ⏱️ 15:42  [Passage]  │  Questions   │
├────────────────────────┤  8/13 ✅     │
│                        ├─────────────┤
│  The Rise of Renewable │ 1. What is  │
│  Energy                │    the main │
│                        │    idea?    │
│  Renewable energy      │ ○ A. Solar  │
│  sources have been     │ ● B. Renew  │
│  growing rapidly in    │ ○ C. Oil    │
│  recent years. Solar   │ ○ D. Coal   │
│  power, wind energy,   │             │
│  and hydroelectric...  │ 2. Name the │
│                        │    gas...   │
│  [scrollable]          │ [__________]│
│                        │             │
│                        │ [Submit ▶]  │
└────────────────────────┴─────────────┘
```

### S09/S11 — Writing Editor → Feedback
```
┌──────────────────┬───────────────────┐
│  Task 2 | B2     │  ✍️ Your Essay     │
├──────────────────┤                   │
│                  │                   │
│  Some people     │  In recent years, │
│  believe that    │  the debate over  │
│  governments     │  renewable energy │
│  should invest   │  has intensified  │
│  more in         │  ...              │
│  renewable       │                   │
│  energy sources. │                   │
│                  │                   │
│  To what extent  │  267 words ✅     │
│  do you agree    │  [Standard ▾]     │
│  or disagree?    │                   │
│                  │  [Submit ▶]       │
│  Min: 250 words  │  3/10 remaining   │
└──────────────────┴───────────────────┘

After scoring:
┌──────────────────────────────────────┐
│  ✍️ Writing Feedback                  │
├──────────────────────────────────────┤
│  Overall: 6.0                        │
│  TR  ████████░░  6.0                 │
│  CC  ████████░░  6.0                 │
│  LR  █████████░  6.5                 │
│  GRA ████████░░  6.0                 │
├──────────────────────────────────────┤
│  📝 Summary                          │
│  Your essay presents a clear         │
│  position with relevant arguments.   │
├──────────────────────────────────────┤
│  ✅ Strengths                        │
│  • Clear thesis statement            │
│  • Good linking words                │
│  • Relevant real-world examples      │
├──────────────────────────────────────┤
│  📈 Areas for Improvement            │
│  • Add more data in paragraph 2      │
│  • Vary sentence structure           │
│  • Address counterargument           │
├──────────────────────────────────────┤
│  ℹ️ Model: gpt-4o-mini | 24s | 267w  │
│  [Write Again]  [View History]       │
└──────────────────────────────────────┘
```

---

## 4. Navigation Map

```
[Login] ──→ [Register]
    │
    ▼
[Dashboard] ──→ [Reading Catalog] ──→ [Reading Practice] ──→ [Reading Results]
    │                                                            │
    │                                                            └──→ [Reading History]
    │
    ├──→ [Writing Catalog] ──→ [Writing Editor] ──→ [Scoring...] ──→ [Feedback]
    │                                                                    │
    │                                                                    └──→ [Writing History]
    │
    ├──→ [Settings]
    │
    └──→ [Admin Passages] ──→ [Passage Form]
         [Admin Prompts] ──→ [Prompt Form]
         [Admin Sources] ──→ [Import Modal]
         [Admin Users]
```

---

> **Tham chiếu:** [10_ui_ux_specifications](../step3_prd/10_ui_ux_specifications.md) | [04_user_stories](../step3_prd/04_user_stories.md)
