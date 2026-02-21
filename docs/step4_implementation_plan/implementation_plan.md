# 📋 Implementation Plan — IELTS Helper (MVP)

> **Mã tài liệu:** STEP4-PLAN  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Framework:** Vibe Coding v2.0 — Step 4: Implementation Plan  
> **Tham chiếu:** [PRD](../step3_prd/) | [Step 1](../step1_business_idea/)

---

## 1. Sprint Overview

| Sprint | Duration | Focus | Deliverables |
|--------|----------|-------|-------------|
| **Sprint 0** | 3 days | Project setup, infra, tooling | Monorepo, Docker Compose, CI, env config |
| **Sprint 1** | 1 week | Auth + App Shell | Registration, login, JWT, RBAC, layout, theme, i18n |
| **Sprint 2** | 1.5 weeks | Reading Module | Passages CRUD (admin), catalog, practice, auto-grading, results, history |
| **Sprint 3** | 2 weeks | Writing Module | Prompts CRUD (admin), editor, async scoring pipeline, feedback UI |
| **Sprint 4** | 1 week | Dashboard + Admin + Polish | Progress API, trend chart, import, user mgmt, bug fixes |

**Total estimated: ~6 weeks**

---

## 2. Sprint 0 — Project Setup (3 days)

| Task | Description | Output |
|------|-------------|--------|
| T0-01 | Create monorepo structure (`apps/frontend`, `apps/backend`) | Folder structure |
| T0-02 | Initialize Next.js 14 with App Router + TypeScript strict | `apps/frontend/` |
| T0-03 | Initialize NestJS 10 with TypeScript strict | `apps/backend/` |
| T0-04 | Create `docker-compose.yml` for Postgres 15 + Redis 7 | Docker config |
| T0-05 | Configure Prisma with PostgreSQL connection | ORM setup |
| T0-06 | Configure BullMQ with Redis connection | Queue setup |
| T0-07 | Set up ESLint + Prettier (shared config) | Lint config |
| T0-08 | Set up Husky + lint-staged | Git hooks |
| T0-09 | Create `.env.example` files for both apps | Env templates |
| T0-10 | Create seed script skeleton | Seed utility |
| T0-11 | Set up Tailwind CSS + CSS variables for theme | Styling foundation |
| T0-12 | Write `GET /health` endpoint | Health check |

**Definition of Done:** `docker compose up -d` starts Postgres + Redis; both apps start without errors; health endpoint returns OK.

---

## 3. Sprint 1 — Auth + App Shell (1 week)

### Backend Tasks

| Task | Description | FR/BR Ref | Output |
|------|-------------|-----------|--------|
| T1-01 | Create `users` migration | — | Migration file |
| T1-02 | Implement Auth module (register, login, refresh, me) | FR-101..104 | Auth controller + service |
| T1-03 | Implement JWT strategy + guards | FR-102, FR-103 | JwtStrategy, JwtAuthGuard |
| T1-04 | Implement RBAC guard (`@Roles()` decorator) | FR-102 | RolesGuard |
| T1-05 | Implement rate-limit middleware (Redis) | AU-004 | RateLimitGuard |
| T1-06 | Add request ID + structured logging (Pino) | NFR-06 | Logger middleware |
| T1-07 | Seed admin user | — | Seed script |

### Frontend Tasks

| Task | Description | Screen Ref | Output |
|------|-------------|-----------|--------|
| T1-08 | Create app shell (RootLayout, Sidebar, Header) | Layout B | Components |
| T1-09 | Implement Login page | S01 | `/login` page |
| T1-10 | Implement Register page | S02 | `/register` page |
| T1-11 | Set up Auth provider (token storage, interceptor, auto-refresh) | — | AuthContext |
| T1-12 | Implement theme toggle (dark/light using CSS vars) | — | ThemeProvider |
| T1-13 | Implement i18n (vi/en) | — | I18nProvider |
| T1-14 | Implement route protection (redirect to /login if unauthenticated) | — | AuthGuard HOC |
| T1-15 | Create Settings page (profile, language, theme) | S13 | `/settings` page |

**Definition of Done:** User can register, login, see app shell, toggle theme/language, logout. JWT refresh works silently.

---

## 4. Sprint 2 — Reading Module (1.5 weeks)

### Backend Tasks

| Task | Description | FR/BR Ref | Output |
|------|-------------|-----------|--------|
| T2-01 | Create `passages`, `questions` migrations | — | Migration files |
| T2-02 | Create `submissions_reading` migration | — | Migration file |
| T2-03 | Implement Reading module (catalog, detail) | FR-201, FR-202 | ReadingController + Service |
| T2-04 | Implement grading service (MCQ + short answer) | FR-203, RD-002 | GradingService |
| T2-05 | Implement submit endpoint (validation + grading + save) | FR-203, RD-001 | Submit handler |
| T2-06 | Implement reading history endpoint | FR-204 | History handler |
| T2-07 | Admin: Passages CRUD endpoints | FR-501 | AdminController (passages) |
| T2-08 | Admin: Questions CRUD (add/edit/delete per passage) | FR-501 | Question handlers |
| T2-09 | Seed sample passages + questions (≥ 5 passages) | — | Seed data |

### Frontend Tasks

| Task | Description | Screen Ref | Output |
|------|-------------|-----------|--------|
| T2-10 | Implement Reading catalog page (cards, filters, pagination) | S04 | `/reading` page |
| T2-11 | Implement Reading practice page (split view, questions) | S05 | `/reading/:id` page |
| T2-12 | Implement Timer component | S05 | Timer component |
| T2-13 | Implement submit flow (validation, loading, results) | S06 | Submit + results |
| T2-14 | Implement Reading results page | S06 | `/reading/:id/result/:subId` |
| T2-15 | Implement Reading history page | S07 | `/reading/history` |
| T2-16 | Admin: Passage list page | S14 | `/admin/passages` |
| T2-17 | Admin: Passage form (create/edit + question editor) | S15 | `/admin/passages/new|:id` |
| T2-18 | Create shared components: FilterBar, Card, Badge, Pagination, Skeleton | — | Shared components |

**Definition of Done:** Learner can browse, practice, submit, see results. Admin can CRUD passages + questions. Auto-grading works for MCQ and short answer.

---

## 5. Sprint 3 — Writing Module (2 weeks)

### Backend Tasks

| Task | Description | FR/BR Ref | Output |
|------|-------------|-----------|--------|
| T3-01 | Create `prompts`, `submissions_writing` migrations | — | Migrations |
| T3-02 | Implement Writing module (catalog, submit, detail, history) | FR-301..304 | Controllers + Services |
| T3-03 | Implement BullMQ producer (enqueue scoring job on submit) | WR-004 | ScoringProducer |
| T3-04 | Implement BullMQ consumer (scoring worker) | WR-002, WR-004 | ScoringConsumer |
| T3-05 | Implement Rule Engine (word count, prompt overlap, structure) | WR-002 | RuleEngine service |
| T3-06 | Implement LLM Client (adapter pattern for OpenAI/Google/Anthropic) | WR-002 | LLMClient + adapters |
| T3-07 | Create IELTS rubric system prompt (band descriptors) | WR-002 | Prompt template |
| T3-08 | Implement JSON validation for LLM response | WR-002 | Schema validator |
| T3-09 | Implement rate-limit for writing submissions (per user/day) | WR-003 | Rate-limit service |
| T3-10 | Admin: Prompts CRUD endpoints | FR-502 | AdminController (prompts) |
| T3-11 | Admin: Publish/Unpublish endpoints | FR-503, ADM-001 | Publish handlers |
| T3-12 | Implement content versioning (create version on mutations) | ADM-003 | VersionService |
| T3-13 | Seed sample prompts (≥ 3 prompts) | — | Seed data |

### Frontend Tasks

| Task | Description | Screen Ref | Output |
|------|-------------|-----------|--------|
| T3-14 | Implement Writing catalog page | S08 | `/writing` page |
| T3-15 | Implement Writing editor page (split view, word count) | S09 | `/writing/:id` page |
| T3-16 | Implement scoring progress page (polling, progress bar) | S10 | Loading state |
| T3-17 | Implement Writing feedback page (score bars, feedback panel) | S11 | `/writing/submissions/:id` |
| T3-18 | Implement Writing history page | S12 | `/writing/history` |
| T3-19 | Create ScoreBar component (0–9 color-coded fill) | — | ScoreBar |
| T3-20 | Create WordCounter component (live count, green/red) | — | WordCounter |
| T3-21 | Admin: Prompt list + form pages | S16, S17 | Admin prompts pages |

**Definition of Done:** Learner submits essay → scores returned async → feedback displayed. Rate limiting works. Admin can CRUD prompts. Publishing works.

---

## 6. Sprint 4 — Dashboard + Admin + Polish (1 week)

### Backend Tasks

| Task | Description | FR/BR Ref | Output |
|------|-------------|-----------|--------|
| T4-01 | Implement progress endpoint (reading + writing stats) | FR-401 | ProgressService |
| T4-02 | Implement trends endpoint (weekly aggregation) | FR-402 | Trends handler |
| T4-03 | Create `sources`, `snippets`, `content_versions`, `rate_limits` migrations | — | Migrations |
| T4-04 | Implement Import module (fetch, sanitize, cache, save) | FR-601, SY-001..003 | ImportService |
| T4-05 | Implement Sources CRUD + snippet attach | FR-602 | Source handlers |
| T4-06 | Implement User management endpoint | FR-603 | Admin user handler |
| T4-07 | Set up BullBoard at `/admin/queues` | — | Queue dashboard |

### Frontend Tasks

| Task | Description | Screen Ref | Output |
|------|-------------|-----------|--------|
| T4-08 | Implement Dashboard page (stat cards, recent list) | S03 | `/dashboard` page |
| T4-09 | Implement trend chart (line chart, period selector) | S03 | Chart component |
| T4-10 | Admin: Sources list + import modal | S18, S19 | Admin sources pages |
| T4-11 | Admin: User management page | S20 | `/admin/users` page |
| T4-12 | Implement empty states for all pages | — | EmptyState components |
| T4-13 | Implement toast notification system | — | Toast provider |
| T4-14 | Cross-browser testing + responsive fixes | — | Bug fixes |
| T4-15 | 404 page | S21 | `/404` page |

**Definition of Done:** Dashboard shows real data. Import works. All admin features complete. No critical bugs.

---

## 7. Migration Execution Order

| Order | Migration | Tables | Sprint |
|-------|-----------|--------|--------|
| 1 | `001_create_users` | users | Sprint 1 |
| 2 | `002_create_passages_questions` | passages, questions | Sprint 2 |
| 3 | `003_create_submissions_reading` | submissions_reading | Sprint 2 |
| 4 | `004_create_prompts` | prompts | Sprint 3 |
| 5 | `005_create_submissions_writing` | submissions_writing | Sprint 3 |
| 6 | `006_create_sources_snippets` | sources, snippets | Sprint 4 |
| 7 | `007_create_content_versions` | content_versions | Sprint 4 |
| 8 | `008_create_rate_limits` | rate_limits | Sprint 4 |

---

## 8. Project Folder Structure

```
ielts-helper/
├── apps/
│   ├── frontend/                # Next.js 14
│   │   ├── src/
│   │   │   ├── app/             # App Router pages
│   │   │   │   ├── (auth)/      # Login, Register
│   │   │   │   ├── (main)/      # Dashboard, Reading, Writing, Settings
│   │   │   │   └── admin/       # Admin CMS
│   │   │   ├── components/      # Shared UI components
│   │   │   │   ├── ui/          # Primitive (Button, Input, Card, etc.)
│   │   │   │   ├── layout/      # Sidebar, Header, BottomNav
│   │   │   │   └── features/    # Feature-specific (ScoreBar, Timer, etc.)
│   │   │   ├── hooks/           # Custom hooks (useAuth, useTheme, etc.)
│   │   │   ├── lib/             # API client, utils, constants
│   │   │   ├── providers/       # Auth, Theme, I18n providers
│   │   │   ├── styles/          # Global CSS, Tailwind config
│   │   │   └── i18n/            # Locale files (vi.json, en.json)
│   │   ├── public/              # Static assets
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── backend/                 # NestJS 10
│       ├── src/
│       │   ├── auth/            # Auth module
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── strategies/  # JWT strategy
│       │   │   ├── guards/      # JwtAuthGuard, RolesGuard
│       │   │   └── dto/         # RegisterDto, LoginDto
│       │   ├── reading/         # Reading module
│       │   │   ├── reading.controller.ts
│       │   │   ├── reading.service.ts
│       │   │   └── grading.service.ts
│       │   ├── writing/         # Writing module
│       │   │   ├── writing.controller.ts
│       │   │   ├── writing.service.ts
│       │   │   └── scoring/
│       │   │       ├── scoring.producer.ts
│       │   │       ├── scoring.consumer.ts
│       │   │       ├── rule-engine.ts
│       │   │       └── llm-client/
│       │   │           ├── llm-client.ts
│       │   │           ├── openai.adapter.ts
│       │   │           ├── google.adapter.ts
│       │   │           └── anthropic.adapter.ts
│       │   ├── dashboard/       # Dashboard module
│       │   ├── admin/           # Admin module
│       │   ├── import/          # Import module
│       │   ├── shared/          # Shared utilities
│       │   │   ├── middleware/  # Logger, rate-limit
│       │   │   ├── pipes/       # Validation pipes
│       │   │   └── config/      # ConfigModule setup
│       │   ├── prisma/          # PrismaService + PrismaModule
│       │   ├── seeds/           # Seed scripts
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/                # E2E tests
│       └── tsconfig.json
│
├── docker-compose.yml           # Postgres + Redis
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── .husky/
├── docs/                        # All documentation
│   ├── step1_business_idea/
│   ├── step2_lowcode/
│   ├── step3_prd/
│   └── step4_implementation_plan/
└── README.md
```

---

## 9. Environment Variables

| Variable | Service | Example | Description |
|----------|---------|---------|-------------|
| `DATABASE_URL` | Backend | `postgresql://user:pass@localhost:5432/ielts` | Postgres connection |
| `REDIS_URL` | Backend | `redis://localhost:6379` | Redis connection |
| `JWT_SECRET` | Backend | `super-secret-key-change-me` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Backend | `another-secret-key` | Refresh token secret |
| `JWT_EXPIRY` | Backend | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRY` | Backend | `7d` | Refresh token TTL |
| `LLM_PROVIDER` | Backend | `openai` | Primary LLM provider |
| `LLM_MODEL_CHEAP` | Backend | `gpt-4o-mini` | Default scoring model |
| `LLM_MODEL_PREMIUM` | Backend | `gpt-4o` | Premium scoring model |
| `LLM_FALLBACK_PROVIDER` | Backend | `google` | Fallback provider |
| `OPENAI_API_KEY` | Backend | `sk-...` | OpenAI API key |
| `GOOGLE_API_KEY` | Backend | `...` | Google API key |
| `WRITING_DAILY_LIMIT` | Backend | `10` | Max submissions/user/day |
| `NOTEBOOKLM_CACHE_TTL` | Backend | `1800` | Cache TTL in seconds |
| `ADMIN_EMAIL` | Backend | `admin@ieltshelper.local` | Seed admin email |
| `ADMIN_PASSWORD` | Backend | `...` | Seed admin password |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:3001/api` | Backend API URL |
| `NEXT_PUBLIC_DEFAULT_LANG` | Frontend | `vi` | Default language |

---

## 10. Refactoring Log (Step 5 Placeholder)

| Date | Area | Change | Reason |
|------|------|--------|--------|
| — | — | — | To be filled during/after build |

---

> **Tham chiếu:** [08_data_requirements](../step3_prd/08_data_requirements.md) | [12_technical_constraints](../step3_prd/12_technical_constraints.md)
