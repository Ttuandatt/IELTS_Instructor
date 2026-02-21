# 🛡️ Non-Functional Requirements — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-07  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [01_executive_summary](01_executive_summary.md) | [12_technical_constraints](12_technical_constraints.md)

---

## 1. Performance

### NFR-P01: API Response Time

| Metric | Target | Measurement | Priority |
|--------|--------|-------------|----------|
| p50 latency (standard endpoints) | < 200ms | APM / request logs | P0 |
| p95 latency (standard endpoints) | < 500ms | APM / request logs | P0 |
| p99 latency (standard endpoints) | < 1000ms | APM / request logs | P1 |

**Standard endpoints bao gồm:** catalog listing, detail views, auth, profile, dashboard aggregations.

**Ngoại lệ:**
- Writing submit (POST) trả về ngay `202 Accepted` với `submission_id` → target < 1s.
- Polling endpoint (GET /writing/submissions/:id) → target < 200ms.

### NFR-P02: Writing Scoring Turnaround

| Metric | Target | Measurement |
|--------|--------|-------------|
| 90th percentile turnaround | < 5 phút | `turnaround_ms` field on `submissions_writing` |
| Median turnaround | < 2 phút | — |
| Queue job timeout | 60–90 giây per job | BullMQ job options |
| Max retries (LLM call) | 2 với exponential backoff | Worker config |

### NFR-P03: Concurrent Users

| Metric | Target (dev/staging) | Notes |
|--------|---------------------|-------|
| Concurrent users | 10–50 | Local dev / Dev Tunnel |
| DB connection pool | 10–20 | Postgres pool config |
| Redis connections | 5–10 | One for cache, one for BullMQ |
| BullMQ worker concurrency | 2–4 workers | Dev config |

### NFR-P04: Database Performance

| Metric | Target |
|--------|--------|
| Query p95 | < 100ms |
| Index usage | All FK columns + common filters indexed |
| JSONB queries | Use GIN indexes where needed |
| Connection pool | pg-pool max 20 |

---

## 2. Reliability & Availability

### NFR-R01: Uptime

| Metric | Target | Context |
|--------|--------|---------|
| Dev/staging uptime | > 99% during working hours | Local server + Docker |
| Production (future) | > 99.5% | Cloud deployment |

### NFR-R02: Error Rate

| Metric | Target | Measurement |
|--------|--------|-------------|
| Submit error rate (Reading) | < 1% | Error count / total submits |
| Submit error rate (Writing) | < 1% (excluding rate-limit 429s) | Error count / total submits |
| Scoring failure rate | < 5% | Failed / total scoring jobs |
| API 5xx rate | < 0.5% | Response status monitoring |

### NFR-R03: Scoring Pipeline Resilience

| Aspect | Implementation |
|--------|---------------|
| Retry strategy | Exponential backoff: 1s → 4s (2 retries max) |
| Dead Letter Queue | Failed jobs after retries → DLQ for manual review |
| Fallback | If primary model unavailable → try secondary model (Phase 2) |
| Timeout | Per-job timeout: 60–90s; wall time SLA: 5 min |
| Graceful degradation | If queue is full → return 503 with retry-after header |

### NFR-R04: Data Integrity

| Aspect | Implementation |
|--------|---------------|
| Transactions | Submission write + grading in single transaction (Reading) |
| Idempotency | Writing submit returns existing pending submission if resubmitted within 5s (dedup by user_id + prompt_id + content hash) |
| Backup | Docker volume persistence; manual backup scripts |

---

## 3. Security

### NFR-S01: Authentication

| Aspect | Implementation |
|--------|---------------|
| Method | JWT (access) + Opaque refresh token |
| Access token TTL | 15 minutes |
| Refresh token TTL | 7 days |
| Token rotation | Refresh token rotate on use; old token revoked |
| Password hashing | bcrypt (cost factor 10) |
| Password policy | Min 8 chars, 1 uppercase, 1 number, 1 special char |

### NFR-S02: Authorization

| Aspect | Implementation |
|--------|---------------|
| Model | Role-Based Access Control (RBAC) |
| Roles | learner, instructor, admin |
| Enforcement | NestJS Guards on routes; JWT payload includes role |
| Response | 401 for missing/invalid token; 403 for insufficient role |

### NFR-S03: Data Protection

| Aspect | Implementation |
|--------|---------------|
| Transport | HTTPS (enforced in production; Dev Tunnels provide HTTPS) |
| Sensitive data | Passwords bcrypt-hashed; no plaintext in logs |
| Input validation | Whitelist validation on all inputs (class-validator in NestJS) |
| SQL injection | Parameterized queries via Prisma |
| XSS | Sanitize imported content; React auto-escapes output |
| CORS | Whitelist frontend origin only |

### NFR-S04: Rate Limiting

| Endpoint | Limit | Window | Response |
|----------|-------|--------|----------|
| POST /auth/login | 5 attempts | 15 min | 429 |
| POST /auth/register | 3 attempts | 15 min | 429 |
| POST /writing/prompts/:id/submit | 5–10 per user | 24 hours | 429 |
| General API | 100 requests | 1 min per IP | 429 |

**Implementation:** Redis-backed rate limiter (sliding window).

### NFR-S05: Content Security

| Aspect | Implementation |
|--------|---------------|
| Imported content | Strip HTML tags; sanitize (DOMPurify equivalent on backend) |
| User-generated content | Escape special chars; no script execution |
| Provenance | Track source URL, admin_id, timestamp for all imported content |

---

## 4. Usability

### NFR-U01: Internationalization (i18n)

| Aspect | Implementation |
|--------|---------------|
| Languages | Vietnamese (vi) — default; English (en) |
| Scope | All UI labels, buttons, messages, errors, tooltips |
| Library | next-intl hoặc react-i18next |
| Switching | Instant toggle; persist in user profile |
| Content | Passage/prompt content NOT translated (English-only for IELTS) |

### NFR-U02: Theming

| Aspect | Implementation |
|--------|---------------|
| Modes | Light (default), Dark |
| Method | CSS custom properties / Tailwind dark mode |
| Toggle | Header toggle; persist in user profile |
| Transition | Smooth transition (0.2s) on theme change |

### NFR-U03: Responsive Design

| Breakpoint | Target | Notes |
|------------|--------|-------|
| Mobile | ≥ 360px | Single column; stacked layout |
| Tablet | ≥ 768px | Two columns where appropriate |
| Desktop | ≥ 1024px | Full split views (Reading passage + questions) |
| Max width | 1440px | Content centered beyond this |

### NFR-U04: Accessibility (baseline)

| Aspect | Target |
|--------|--------|
| WCAG level | 2.1 AA (best-effort in MVP) |
| Keyboard navigation | All interactive elements reachable via Tab |
| Color contrast | ≥ 4.5:1 for text |
| Screen reader | Semantic HTML + aria-labels for key elements |
| Focus indicators | Visible focus ring on interactive elements |

### NFR-U05: UX Patterns

| Pattern | Implementation |
|---------|---------------|
| Loading states | Skeleton loaders for lists; spinner for form submits; progress for scoring |
| Empty states | Friendly message + CTA when no data |
| Error states | Toast notification for API errors; inline validation for forms |
| Success states | Toast confirmation for save/publish; score display for submissions |
| Confirmation dialogs | For destructive actions (delete, unpublish) |

---

## 5. Scalability (future considerations)

### NFR-SC01: Horizontal Scaling Path

| Component | Current (MVP) | Scale Path |
|-----------|---------------|------------|
| Backend API | Single NestJS instance | Multiple instances behind load balancer |
| Database | Single Postgres | Read replicas; connection pooling (PgBouncer) |
| Queue workers | 2–4 in-process | Separate worker processes; auto-scale by queue depth |
| Redis | Single instance | Redis Cluster or Elasticache |
| Frontend | Single Next.js | CDN + serverless (Vercel) |

### NFR-SC02: Data Growth Estimates (12 months)

| Entity | Estimated rows | Storage | Notes |
|--------|---------------|---------|-------|
| Users | 500–2,000 | < 1 MB | MVP scope |
| Passages | 100–500 | < 10 MB | Including body text |
| Questions | 500–2,500 | < 5 MB | 5 per passage avg |
| Prompts | 50–200 | < 2 MB | — |
| Reading submissions | 5,000–20,000 | < 50 MB | Including JSONB answers |
| Writing submissions | 2,000–10,000 | < 100 MB | Including essay text + feedback |
| Sources/Snippets | 200–1,000 | < 20 MB | — |

---

## 6. Observability & Monitoring

### NFR-O01: Structured Logging

| Aspect | Implementation |
|--------|---------------|
| Library | Pino (NestJS) |
| Format | JSON structured logs |
| Fields | `timestamp, level, request_id, user_id, method, path, status, duration_ms, error?` |
| Levels | error, warn, info, debug |
| Sensitive data | NEVER log passwords, tokens, or full essay content |

### NFR-O02: Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `api.request.duration` | Histogram | Per-endpoint latency |
| `api.request.count` | Counter | Per-endpoint, per-status |
| `scoring.turnaround` | Histogram | Writing scoring end-to-end time |
| `scoring.queue.depth` | Gauge | Current jobs in queue |
| `scoring.failure.count` | Counter | Failed scoring jobs |
| `auth.login.count` | Counter | Per-status (success/failure) |

### NFR-O03: Alerting (basic)

| Alert | Condition | Action |
|-------|-----------|--------|
| Scoring failure spike | > 10% failure rate in 5 min window | Log alert; notify dev |
| API error spike | > 5% 5xx rate in 5 min window | Log alert |
| Queue backlog | Depth > 50 jobs | Log alert |
| Disk usage | > 80% | Log alert |

### NFR-O04: Health Checks

| Endpoint | Check | Frequency |
|----------|-------|-----------|
| GET /health | API server running | Every 30s |
| GET /health/db | Postgres connection | Every 60s |
| GET /health/redis | Redis connection | Every 60s |
| GET /health/queue | BullMQ connection + queue stats | Every 60s |

---

## 7. Maintainability

### NFR-M01: Code Standards

| Aspect | Standard |
|--------|---------|
| Language | TypeScript (strict mode) end-to-end |
| Linting | ESLint + Prettier (consistent formatting) |
| Naming | camelCase (variables/functions); PascalCase (types/classes); kebab-case (files) |
| Architecture | NestJS modular (module/controller/service/repository pattern) |
| Testing | Unit tests for services; integration tests for API; E2E for critical flows |

### NFR-M02: Documentation

| Document | Location |
|----------|----------|
| PRD set | docs/step3_prd/ |
| API spec | docs/step3_prd/openapi.yaml |
| Architecture | docs/step3_prd/17_component_diagram.md |
| Dev setup | docs/step4_implementation_plan/dev_onboarding_guide.md |
| Changelog | CHANGELOG.md (semver) |

### NFR-M03: Dependency Management

| Aspect | Approach |
|--------|---------|
| Package manager | pnpm (workspace) |
| Lock file | Committed to git |
| Updates | Monthly dependency audit (npm audit) |
| Pinning | Exact versions in production |

---

> **Tham chiếu:** [12_technical_constraints](12_technical_constraints.md) | [13_dependencies_risks](13_dependencies_risks.md)
