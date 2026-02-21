# 📋 Requirements Intake — IELTS Helper

> **Mã tài liệu:** STEP1-00  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Approved  
> **Framework:** Vibe Coding v2.0 — Step 1: Business Idea Intake

---

## 1. Project Overview

| Attribute | Detail |
|-----------|--------|
| **Project Name** | IELTS Helper |
| **Project Type** | Web Application (Full-stack) |
| **Domain** | Education Technology — IELTS Test Preparation |
| **Vision** | Hệ thống luyện IELTS Reading & Writing có trợ giúp AI, dành cho học viên tự học và trung tâm. Giúp người học cải thiện band score thông qua luyện tập có chấm điểm tự động (Reading) và phản hồi rubric-based từ LLM (Writing). |
| **Tagline** | "Practice smarter, score higher — AI-powered IELTS Reading & Writing." |

---

## 2. Problem Statement

### 2.1 Core Problems

| # | Problem | Who | Impact |
|---|---------|-----|--------|
| 1 | **Slow Writing feedback** — Learners wait days for essay feedback from instructors, losing motivation. | Learners | High — 70% of learners report frustration with feedback delay (internal survey) |
| 2 | **No structured Reading practice** — Scattered materials, no timed practice with auto-grading. | Learners | Medium — learners waste time finding quality passages |
| 3 | **Inconsistent scoring** — Instructors grade subjectively; different markers give different scores for the same essay. | Learners, Instructors | High — undermines trust in scores |
| 4 | **Content curation bottleneck** — Admins manually create/format IELTS materials instead of leveraging existing knowledge bases. | Admins | Medium — slow content pipeline |
| 5 | **No progress visibility** — Learners can't track improvement over time or identify weak areas. | Learners | Medium — reduces engagement |

### 2.2 Current Alternatives & Gaps

| Alternative | Pros | Gaps |
|-------------|------|------|
| Pen & paper practice | Authentic feel | No scoring, no analytics |
| Online test platforms (IELTS Liz, British Council) | Structured | No AI feedback for writing, limited content control |
| ChatGPT direct | Fast feedback | No rubric alignment, no history, no admin control |
| Native mobile apps | Convenient | Often low quality, no LLM integration |
| Human tutors | High quality | Expensive, slow turnaround, inconsistent |

### 2.3 Opportunity

Build a platform that combines **structured content** (admin-curated from NotebookLM), **auto-grading** (Reading), and **AI rubric scoring** (Writing) in a unified interface, delivering feedback in minutes instead of days.

---

## 3. Target Users

### 3.1 Primary Persona — Learner (Minh)

| Attribute | Detail |
|-----------|--------|
| **Name** | Nguyễn Minh |
| **Age** | 22 |
| **Role** | University student, self-studying for IELTS Academic |
| **Goal** | Achieve Band 6.5+ in 3 months |
| **Tech** | Laptop/phone, intermediate internet, uses Google Docs / ChatGPT occasionally |
| **Pain Points** | Waits 3–5 days for essay feedback; doesn't know which skills to improve; finds quality passages online inconsistently |
| **Success Criteria** | Gets essay feedback in < 5 minutes; can practice Reading with timer; sees progress week-over-week |

### 3.2 Secondary Persona — Instructor (Thầy Nam)

| Attribute | Detail |
|-----------|--------|
| **Name** | Trần Nam |
| **Age** | 35 |
| **Role** | IELTS instructor at a language center |
| **Goal** | Monitor students' progress; review AI-scored essays for quality check |
| **Tech** | Desktop browser, intermediate tech |
| **Pain Points** | Spends 20+ min per essay grading; inconsistent between markers; no unified dashboard |
| **Success Criteria** | Can browse student submissions; trusts AI scoring quality; saves grading time |

### 3.3 Admin Persona — Content Ops (Hà)

| Attribute | Detail |
|-----------|--------|
| **Name** | Lê Hà |
| **Age** | 28 |
| **Role** | Content operations, manages IELTS materials |
| **Goal** | Quickly import, curate, and publish IELTS content |
| **Tech** | Desktop, familiar with CMS tools, uses NotebookLM |
| **Pain Points** | Manually formats content from multiple sources; no version control; no batch import |
| **Success Criteria** | Imports from NotebookLM in < 2 min; tracks content provenance; publishes with one click |

---

## 4. MVP Scope Definition

### 4.1 In-Scope Features

| Module | Features |
|--------|----------|
| **Auth** | Email/password registration, login, JWT refresh, profile (language vi/en, theme dark/light) |
| **Reading** | Passage catalog (level/topic filters), passage detail (split view), MCQ + short answer auto-grading, timer (optional), results with explanations, attempt history |
| **Writing** | Prompt catalog (Task 1/Task 2, level/topic), essay editor with live word count, async hybrid scoring (rule + LLM), feedback display (4 criteria + summary + strengths + improvements), submission history |
| **Dashboard** | Progress summary (Reading accuracy, Writing scores), recent submissions, trend chart (4-week) |
| **Admin CMS** | CRUD for passages, questions, prompts; publish/unpublish; import from NotebookLM; sources/snippets; user management; content versioning |
| **Cross-cutting** | i18n (vi/en), dark/light theme, responsive (mobile-first), structured logging, rate limiting |

### 4.2 Out-of-Scope (Phase 1)

| Feature | Reason |
|---------|--------|
| Speaking module | Different tech stack (audio processing) |
| Listening module | Requires audio content pipeline |
| Payment/billing | Not monetizing in MVP |
| Social features (forums, chat) | Focus on individual practice |
| Native mobile app | Web-first; responsive covers mobile |
| Advanced plagiarism detection | Complex NLP; basic prompt-overlap check sufficient |
| Gamification (badges, streaks) | Nice-to-have for Phase 2 |
| Multi-tenant (center management) | Single-tenant for MVP |
| Instructor manual score override | Considered for Phase 2 |
| AR / advanced media | Out of scope |

### 4.3 Phase 2 Candidates

| Feature | Priority |
|---------|----------|
| Instructor score override | High |
| Listening module | Medium |
| Payment integration | Medium |
| Gamification (streaks, badges) | Low |
| Multi-tenant management | Low |
| Advanced analytics (comparative) | Low |

---

## 5. Success Metrics (KPIs)

| # | KPI | Target | Measurement Method | FR Ref |
|---|-----|--------|--------------------|--------|
| 1 | Reading completion rate | ≥ 70% submissions with ≥ 80% answers | `submissions_reading` where `answers.length / total_questions >= 0.8` / total submissions | FR-203 |
| 2 | Writing rubric score (avg) | 5.5–6.0 overall for new users | Average `scores.overall` from `submissions_writing` (first 10 submissions per user) | FR-303 |
| 3 | 7-day retention | ≥ 20% | Users with ≥ 1 submission in days 2–7 after registration / total registrations | FR-401 |
| 4 | Writing feedback turnaround | < 5 min for 90% of submissions | `scored_at - created_at` from `submissions_writing` WHERE `processing_status='done'` | FR-302 |
| 5 | p95 API latency | < 500ms | APM/logs — exclude writing scoring endpoint (async) | NFR-01 |
| 6 | Submit error rate | < 1% | 5xx responses on submit endpoints / total submissions | NFR-02 |

---

## 6. Technical Assumptions

| # | Assumption | Validation |
|---|-----------|-----------|
| 1 | NotebookLM provides accessible content via URL that can be fetched and parsed | Test with actual NotebookLM links during sprint 0 |
| 2 | Cheap LLM tier (GPT-4o-mini / Gemini Flash) produces acceptable IELTS scoring quality | Calibration set of 20–30 pre-scored essays |
| 3 | Users accept model-based scoring if rubric alignment and source are transparent | User feedback during beta |
| 4 | Dev environment is local-first; no cloud infra needed for MVP | Docker Compose handles Postgres + Redis |
| 5 | Single developer or small team; no CI/CD pipeline initially | Manual deploy; lint/test locally |
| 6 | LLM API keys are available (OpenAI and/or Google) | Pre-provision before sprint 1 |

---

## 7. Business Constraints

| # | Constraint | Impact |
|---|-----------|--------|
| 1 | **Budget-conscious** — minimize LLM API costs | Default cheap tier; rate limit 5–10 essays/day/user; token caps |
| 2 | **Local-first deployment** — no cloud cost in MVP | Docker for DB/Redis; VS Code Dev Tunnels for sharing |
| 3 | **Small team** — 1–2 developers | Prioritize features ruthlessly; use frameworks (Next.js, NestJS) |
| 4 | **No existing user base** — starting from zero | Focus on content quality and UX; manual seeding |
| 5 | **Vietnamese primary audience** — UI must support vi | i18n from day 1; default language vi |

---

## 8. Risks Summary

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| LLM cost overruns | Medium | Medium | Cheap tier default; rate limits; token caps; usage logging |
| Scoring inconsistency | High | High | Rubric in prompt; temperature 0.1–0.3; calibration set; rule pre-checks |
| NotebookLM access changes | Medium | Low | Cache aggressively; manual content creation fallback |
| Scoring latency > SLA | Medium | Medium | Async queue; timeout 90s; retry; DLQ; monitor |
| Data loss (local dev) | Low | Low | Docker volumes; seed scripts; git-tracked migrations |
| Security vulnerabilities | Low | High | HTTPS; bcrypt; JWT best practices; input validation; CORS |

---

## 9. Open Questions (Resolved)

| Question | Decision | Date |
|----------|----------|------|
| Default model vendor for MVP? | Start with GPT-4o-mini; configure via env to swap easily | 2025-02-21 |
| Daily cap per user for writing? | 5–10 (configurable via env) | 2025-02-21 |
| Instructor manual override in MVP? | Deferred to Phase 2 | 2025-02-21 |
| Need calibration set before launch? | Yes, 20–30 pre-scored essays | 2025-02-21 |

---

## 10. Stakeholder Sign-off

| Role | Name | Status |
|------|------|--------|
| Product Owner | — | ⏳ Pending |
| Tech Lead | — | ⏳ Pending |
| Content Ops | — | ⏳ Pending |

---

## 11. Next Steps

| Step | Action | Target |
|------|--------|--------|
| Step 2 | Low-code prototype (screens, user flows, data fields) | → `docs/step2_lowcode/` |
| Step 3 | Full PRD (17 documents) | → `docs/step3_prd/` |
| Step 4 | Implementation plan & dev onboarding | → `docs/step4_implementation_plan/` |
| Step 5 | Build MVP | Sprints 1–4 |
| Step 6 | Review & iterate | Post-MVP |

---

> **Tham chiếu:** PRD tại [docs/step3_prd/](../step3_prd/) | Framework: Vibe Coding v2.0
