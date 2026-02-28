# Context Snapshot — 2026-02-22 (updated)

> Dùng cho AI agent / developer khi bắt đầu session mới. Đọc file này trước để nắm toàn bộ context.

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Name** | IELTS Helper |
| **Scope** | Reading & Writing practice (Listening/Speaking — phase 2) |
| **Frontend** | Next.js 14 / React 18 + TypeScript, App Router, Tailwind CSS, React Query |
| **Backend** | NestJS 10 / Node.js + TypeScript, REST API |
| **Database** | PostgreSQL 15+ (UUID PKs, JSONB, GIN indexes) |
| **Cache/Queue** | Redis 7+ / BullMQ 5.x |
| **Auth** | JWT (access 15m + refresh 7d), RBAC (learner / instructor / admin) |
| **AI Scoring** | Hybrid: rule-based pre-checks → LLM rubric scoring |
| **LLM Default** | GPT-4o-mini / o3-mini / Gemini Flash (cheap tier) |
| **LLM Premium** | GPT-4o / Claude 3.5 Sonnet (optional) |
| **Content Source** | NotebookLM — https://notebooklm.google.com/notebook/2009469b-462e-4014-87f5-46f5842fb6db |
| **Dev Mode** | Local (Docker Compose for Postgres+Redis), VS Code Dev Tunnels for sharing |
| **Framework** | Vibe Coding v2.0 (6 steps with quality gates) |
| **Repo** | https://github.com/Ttuandatt/IELTS_Instructor |

---

## 2. MVP Goals

- **Reading:** Passage catalog → practice (split-view) → auto-grading (MCQ + short answer) → results + explanations → history
- **Writing:** Prompt catalog → essay editor (word count) → async scoring (BullMQ → rule engine → LLM → feedback) → score bars (TR/CC/LR/GRA) → history
- **Dashboard:** Progress stats (reading + writing), weekly trend chart
- **Admin CMS:** CRUD passages/questions/prompts, publish/unpublish, import from NotebookLM, user management
- **UX:** Dark/light theme, vi/en i18n, responsive (mobile → desktop)

---

## 3. KPIs

| # | KPI | Target | Measurement |
|---|-----|--------|-------------|
| 1 | Reading completion rate | ≥ 70% bài được nộp (≥80% câu trả lời) | submissions_reading / passage views |
| 2 | Writing rubric score (avg) | 5.5–6.0 cho new users | AVG(overall_score) from submissions_writing |
| 3 | 7-day retention | ≥ 20% | Users active day 7 / registered day 0 |
| 4 | Writing feedback turnaround | < 5 phút cho 90% bài | p90(done_at - submitted_at) |
| 5 | p95 API latency | < 500ms | Server-side timing logs |
| 6 | Submit error rate | < 1% | 5xx responses / total requests |

---

## 4. Writing Scoring Pipeline

```
Essay submit (POST 202)
  → BullMQ enqueue
    → Worker picks up
      → Rule Engine: word count, prompt overlap, structure check
      → LLM Call: system prompt (IELTS rubric) + essay → JSON {TR, CC, LR, GRA, overall, feedback}
      → Validate JSON schema
      → Save to DB (status: done)
    → On failure: retry 2x → DLQ (status: failed)
  → Client polls GET /submissions/:id until done/failed
```

- Token caps: ~600–900 per scoring call
- Rate limit: 5–10 essays/user/day (sliding window via Redis)
- Temperature: 0.1–0.3
- Timeout: 60–90s per job
- Fallback: if primary LLM fails, try fallback provider

---

## 4.5 Reference Site — ieltsonlinetests.com

> Phân tích chi tiết → [ielts_online_tests_analysis.md](../docs/ielts_online_tests_analysis.md)

| Feature từ IOT | Áp dụng cho IELTS Instructor | Priority |
|----------------|------------------------------|----------|
| **Practice Mode vs Simulation Mode** | Modal chọn mode trước test: tự do hoặc giả lập thi thật (timer chuẩn) | Sprint 3–4 |
| **AI Scoring 4 tiêu chí** (TR/CC/LR/GRA) | Scoring pipeline + score bars + personalized feedback | Sprint 3 |
| **Exam Library tabs & filters** | Filter by skill/level, tabs UI, số lượt thi social proof | Sprint 4+ |
| **6-Step Learning Path** | Guided onboarding: placement → practice → AI test → full services | Phase 2 |
| **Question explanations** | Hiển thị explanation per question sau nộp bài Reading | Sprint 4 |
| **Timer chuẩn IELTS** | Countdown 60 min Reading, 60 min Writing, timed_out flag | Sprint 4 |

**Lợi thế cạnh tranh:** Feedback 5 phút (vs 30 phút IOT), Instructor review/override AI, CEFR-based content, self-hosted.

---

## 5. Roles & Permissions

| Action | Learner | Instructor | Admin |
|--------|---------|------------|-------|
| Practice reading/writing | ✅ | ✅ | ✅ |
| View own history/dashboard | ✅ | ✅ | ✅ |
| CRUD content | ❌ | ✅ (own) | ✅ (all) |
| Publish/unpublish | ❌ | ❌ | ✅ |
| Import from NotebookLM | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## 6. Database Entities (10 tables)

`users` · `passages` · `questions` · `submissions_reading` · `prompts` · `submissions_writing` · `sources` · `snippets` · `content_versions` · `rate_limits`

Key enums: `user_role`, `content_status`, `question_type`, `cefr_level`, `writing_task_type`, `processing_status`, `model_tier`, `source_type`, `version_action`, `rate_limit_type`

---

## 7. API Surface (5 groups)

| Group | Key Endpoints |
|-------|---------------|
| **Auth** | POST register, login, refresh · GET/PATCH /me |
| **Reading** | GET passages (list, detail) · POST submit · GET history |
| **Writing** | GET prompts · POST submit (202) · GET submission · GET history |
| **Dashboard** | GET /me/progress · GET /me/progress/trends |
| **Admin** | CRUD passages/questions/prompts · publish/unpublish · import · users |

Full specs → [09_api_specifications.md](step3_prd/09_api_specifications.md) + [openapi.yaml](step3_prd/openapi.yaml)

---

## 8. Documentation Status

| Step | Files | Status |
|------|-------|--------|
| **Step 1** — Requirements Intake | 1 file | ✅ Complete |
| **Step 2** — Low-Code Design | 4 files (screens, user_flows, data_fields, business_rules) | ✅ Complete |
| **Step 3** — PRD | 17 .md files + openapi.yaml | ✅ Complete |
| **Step 4** — Implementation Plan | 5 files (plan, onboarding, CLI, testing, collection) | ✅ Complete |
| **Step 5** — Build | Not started | ⬜ Next |
| **Step 6** — Quality Gate | Not started | ⬜ |

### File Index

**step1_business_idea/**
- `00_requirements_intake.md` — Problem, personas, MVP scope, KPIs, constraints, risks

**step2_lowcode/**
- `screens.md` — 21 screens, 4 layouts, wireframes, nav map
- `user_flows.md` — 7 flows (F01–F07), step tables, error paths
- `data_fields.md` — 10 entities, field tables, 9 enums
- `business_rules.md` — 19 rules (RD/WR/ADM/SY/AU)

**step3_prd/**
- `01_executive_summary.md` — Vision, users, KPIs, timeline, risks
- `02_scope_definition.md` — In/out scope per module
- `03_user_personas_roles.md` — 3 personas, RBAC matrix
- `04_user_stories.md` — 6 Epics, 30 stories (US-101..603), 105 SP
- `05_functional_requirements.md` — FR-101..602, I/O specs
- `06_acceptance_criteria.md` — AC-101..602 (Gherkin format)
- `07_non_functional_requirements.md` — Performance, security, UX metrics
- `08_data_requirements.md` — ERD, 10 entities, migrations, seed data
- `09_api_specifications.md` — All endpoints, examples, error codes
- `10_ui_ux_specifications.md` — Design system, components, page specs
- `11_business_rules.md` — 15 formal rules with enforcement
- `12_technical_constraints.md` — Stack versions, limits, observability
- `13_dependencies_risks.md` — 5 deps, 6 risks, mitigation
- `14_usecase_diagram.md` — Mermaid UC graph, traceability matrix
- `15_sequence_diagrams.md` — 8 sequence diagrams
- `16_activity_diagrams.md` — 7 activity flowcharts
- `17_component_diagram.md` — Architecture, module breakdown
- `openapi.yaml` — OpenAPI 3.0.3 spec

**step4_implementation_plan/**
- `implementation_plan.md` — 5 sprints, ~60 tasks, folder structure, env vars
- `dev_onboarding_guide.md` — Setup guide, troubleshooting
- `cli_commands.md` — All dev commands reference
- `api_testing_guide.md` — 50+ test cases, E2E scripts
- `api_collection.json` — Thunder/Postman collection

---

## 9. ID Conventions

| Prefix | Domain | Example |
|--------|--------|---------|
| US-xxx | User Stories | US-101, US-301 |
| FR-xxx | Functional Requirements | FR-201, FR-602 |
| AC-xxx | Acceptance Criteria | AC-101, AC-602 |
| RD-xxx | Reading Business Rules | RD-001, RD-004 |
| WR-xxx | Writing Business Rules | WR-001, WR-005 |
| ADM-xxx | Admin Business Rules | ADM-001, ADM-003 |
| SY-xxx | System Business Rules | SY-001, SY-003 |
| AU-xxx | Auth Business Rules | AU-001, AU-004 |
| UC-xx | Use Cases | UC-01, UC-46 |
| SD-xx | Sequence Diagrams | SD-01, SD-08 |
| AD-xx | Activity Diagrams | AD-01, AD-07 |
| DEP-xx | Dependencies | DEP-01, DEP-05 |
| RISK-xx | Risks | RISK-01, RISK-06 |

---

## 10. Implementation Sprints Summary

| Sprint | Duration | Focus | Status |
|--------|----------|-------|--------|
| **Sprint 0** | 3 days | Monorepo, Docker, tooling, health endpoint | ✅ Done |
| **Sprint 1** | 1 week | Auth (JWT+RBAC), app shell, theme, i18n | ✅ Done |
| **Sprint 2** | 1.5 weeks | Role-based features (DB schema, RBAC, full CRUD, 19 frontend routes) | ✅ Done |
| **Sprint 3** | 2 weeks | AI Writing Scoring (BullMQ pipeline, LLM integration, 4-criteria feedback UI) | ⬜ Next |
| **Sprint 4** | 1 week | Reading enhancements (timer, Practice/Simulation modes, explanations, analytics) | ⬜ |
| **Sprint 5** | 1 week | Instructor review workflow (comment, override AI score, notifications) | ⬜ |
| **Sprint 6** | 1 week | Performance & polish (caching, pagination, responsive, social proof stats) | ⬜ |

**Total: ~8 weeks** (Sprint 0–2 done, ~5 weeks remaining)

---

## 11. Next Steps

- [x] ~~Update `api_collection.json`~~
- [x] ~~Step 5 — Sprint 0–2~~ *(monorepo, auth, RBAC, CRUD, 19 routes done)*
- [ ] **Phân tích reference site** — ieltsonlinetests.com → xong, kết quả tại `ielts_online_tests_analysis.md`
- [ ] **Step 5 — Sprint 3:** AI Writing Scoring pipeline (Producer → Worker → Rule Engine → LLM → Feedback)
- [ ] **Step 5 — Sprint 4:** Timer, Practice/Simulation mode, question explanations
- [ ] **Step 5 — Sprint 5:** Instructor review + override workflow
- [ ] **Step 5 — Sprint 6:** Polish, social proof, analytics
- [ ] **Step 6 — Quality Gate:** Run test suite, verify acceptance criteria
