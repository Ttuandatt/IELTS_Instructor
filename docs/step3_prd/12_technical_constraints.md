# ⚙️ Technical Constraints — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-12  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [07_non_functional_requirements](07_non_functional_requirements.md)

---

## 1. Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Frontend | Next.js + React | 14.x | App Router, TypeScript strict |
| Frontend state | React Query (TanStack) | 5.x | Server state; local via Context/Zustand |
| Frontend HTTP | Axios | 1.x | Interceptors for JWT auto-refresh |
| Frontend i18n | next-intl or react-i18next | latest | vi / en |
| Frontend styling | Tailwind CSS | 3.x | Dark/light via CSS variables |
| Backend | NestJS | 10.x | TypeScript strict, modular architecture |
| Backend ORM | TypeORM or Prisma | latest | Migrations, UUID support |
| Database | PostgreSQL | 15+ | JSONB, GIN indexes, gen_random_uuid() |
| Cache/Queue | Redis | 7+ | Used for cache, rate-limiting, BullMQ |
| Job Queue | BullMQ | 5.x | Redis-backed; async writing scoring |
| Auth | JWT (jsonwebtoken/passport-jwt) | — | Access (15 min) + Refresh (7 days) |
| AI/LLM | OpenAI / Google / Anthropic SDK | latest | Configurable provider |
| Linting | ESLint + Prettier | latest | Shared config for FE/BE |
| Testing | Jest + Supertest (BE); Vitest + RTL (FE) | latest | — |

---

## 2. Deployment Model

| Aspect | Constraint |
|--------|-----------|
| **Dev environment** | Runs locally on developer machines |
| **Postgres** | Local install or Docker container |
| **Redis** | Local install or Docker container |
| **Services** | Frontend on port 3000, Backend on port 3001 |
| **Sharing** | VS Code Dev Tunnels or port forwarding for sharing |
| **Cloud (future)** | Plan for Vercel (FE) + Railway/Render (BE) + Supabase/Neon (DB) |
| **Docker Compose** | Provided for Postgres + Redis; app code runs natively for HMR |
| **No Kubernetes** | K8s is out of scope for MVP |
| **Environment vars** | `.env` files per service; never committed to git |

---

## 3. Authentication Constraints

| Aspect | Constraint |
|--------|-----------|
| **Algorithm** | JWT with HS256 or RS256 (configurable via env) |
| **Access token TTL** | 15 minutes |
| **Refresh token TTL** | 7 days |
| **Token rotation** | Refresh token rotated on each use; old token invalidated |
| **Password hashing** | bcrypt with salt rounds = 10 |
| **Password policy** | Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 digit |
| **RBAC** | NestJS guards: `@Roles('admin')`, `@Roles('learner')`, etc. |
| **HTTPS** | Assumed in production; Dev Tunnel provides HTTPS automatically |
| **CORS** | Whitelisted origins: `localhost:3000`, tunnel URL |
| **Rate limiting** | Login: 5/15min per IP; Register: 3/15min per IP |

---

## 4. AI/LLM Constraints

| Aspect | Constraint |
|--------|-----------|
| **Default tier** | Cheap: GPT-4o-mini, o3-mini, or Gemini 2.0 Flash |
| **Premium tier** | Optional: GPT-4o, Claude 3.5 Sonnet |
| **Provider selection** | Via env `LLM_PROVIDER` + `LLM_MODEL_CHEAP` + `LLM_MODEL_PREMIUM` |
| **API keys** | Stored in `.env`; never logged or exposed |
| **Token caps** | `max_tokens`: 600 (cheap), 900 (premium) for scoring output |
| **Input truncation** | Essay text truncated at 3000 chars to limit input tokens |
| **System prompt** | Fixed IELTS rubric prompt with band descriptors; versioned in code |
| **Response format** | Required JSON schema; validated on receipt; retry once if invalid |
| **Timeout** | 60s per LLM call (separate from BullMQ job timeout of 90s) |
| **Retry** | Max 2 retries per LLM call with exponential backoff |
| **Cost estimation** | ~$0.002–0.005 per cheap scoring; ~$0.02–0.05 per premium |
| **Fallback** | If primary model fails all retries → try fallback model once (configurable) |

---

## 5. Queue Constraints

| Aspect | Constraint |
|--------|-----------|
| **Library** | BullMQ 5.x (Redis-backed) |
| **Queue name** | `writing-scoring` |
| **Concurrency** | 2–4 workers (dev); scale to 10+ (prod) |
| **Job timeout** | 90,000 ms |
| **Max attempts** | 3 (1 + 2 retries) |
| **Backoff** | Exponential: base 1000ms |
| **Remove on complete** | After 7 days |
| **Remove on fail** | Never (kept in DLQ for review) |
| **Job payload** | `{submissionId, userId, promptId, content, modelTier}` |
| **Stale job cleanup** | Cron: check for stuck `pending` submissions > 10 min; mark `failed` |
| **Dashboard** | BullBoard or Arena UI mounted at `/admin/queues` (dev only) |

---

## 6. Database Constraints

| Aspect | Constraint |
|--------|-----------|
| **Primary keys** | UUID v4 (`gen_random_uuid()`) — no auto-increment |
| **Timestamps** | All tables include `created_at TIMESTAMPTZ`; mutable tables include `updated_at` |
| **JSONB validation** | Application-level validation; no DB-level JSON Schema |
| **Indexes** | Explicitly defined per entity (see PRD-08); GIN for arrays |
| **Migrations** | TypeORM/Prisma migrations; sequential, never edited after merge |
| **Connections** | Pool size: 5 (dev), 20 (prod) |
| **Naming** | snake_case for tables and columns |
| **Cascade** | `ON DELETE CASCADE` for questions (parent: passages), snippets (parent: sources) |
| **No soft delete** | Hard delete in MVP; soft delete considered for Phase 2 |
| **Seed data** | Admin user + 5 sample passages + 3 sample prompts |

---

## 7. Storage Constraints

| Aspect | Constraint |
|--------|-----------|
| **File uploads** | Not supported in MVP (all text-based content) |
| **Media** | No images/audio/video in MVP |
| **Future** | Plan S3-compatible (MinIO local / S3 prod) for media in Phase 2 |
| **Static assets** | Served by Next.js public directory |

---

## 8. Observability Constraints

| Aspect | Constraint |
|--------|-----------|
| **Logging** | Structured JSON logs via Pino or Winston |
| **Log levels** | `error`, `warn`, `info`, `debug` (debug only in dev) |
| **Request ID** | UUID per request; propagated to queue jobs |
| **Correlation** | `request_id` in all log entries and responses |
| **Metrics** | Basic: request count, latency histogram, error rate, queue depth |
| **Alerting** | Log-based: alert on error rate >5% over 5 min |
| **APM** | Optional: OpenTelemetry traces (Phase 2) |
| **Health check** | `GET /health` → `{status: "ok", db: true, redis: true}` |
| **Queue monitoring** | BullBoard at `/admin/queues` (admin auth required) |

---

## 9. Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Chrome | 90+ |
| Mobile Safari | 14+ |

---

## 10. Code Quality Constraints

| Aspect | Constraint |
|--------|-----------|
| **TypeScript** | `strict: true` in both FE and BE |
| **Linting** | ESLint with recommended rules; no `any` (warn) |
| **Formatting** | Prettier with consistent config |
| **Git hooks** | Husky + lint-staged for pre-commit checks |
| **Commit messages** | Conventional Commits format |
| **Branch strategy** | `main` (stable) + feature branches + PRs |
| **Code review** | Required before merge to main |
| **Test coverage** | Minimum 60% for BE services (Phase 2 target: 80%) |

---

> **Tham chiếu:** [07_non_functional_requirements](07_non_functional_requirements.md) | [08_data_requirements](08_data_requirements.md)
