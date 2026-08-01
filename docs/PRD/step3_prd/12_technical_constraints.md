# Technical Constraints
## Dự án Langy

> **Phiên bản:** 1.0
> **Ngày tạo:** 06/07/2026
> **Decision log tham chiếu:** D5, D9, D10

---

## 1. Technology Stack

### 1.1 Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  Next.js 14 (App Router) · React 18 · TailwindCSS · i18n   │
│  Desktop-first (GV) + Responsive mobile-web (HS)            │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST + JWT
┌──────────────────────────▼──────────────────────────────────┐
│                      API LAYER                               │
│  NestJS 10 · TypeScript · Passport JWT (access + refresh)   │
│  Swagger (auto-gen) · Class-validator                        │
└────────┬─────────────────┬──────────────────┬───────────────┘
         │                 │                  │
┌────────▼────────┐ ┌──────▼───────┐ ┌───────▼──────────────┐
│  PostgreSQL     │ │  Redis       │ │  Object Storage      │
│  (Prisma ORM)   │ │  (BullMQ     │ │  (file upload)       │
│                 │ │   queue +    │ │                      │
│                 │ │   rate limit)│ │                      │
└─────────────────┘ └──────┬───────┘ └──────────────────────┘
                           │
                    ┌──────▼───────────────────────────────┐
                    │         WORKER LAYER                   │
                    │  BullMQ Consumer · LLM Client Service │
                    │  ┌────────────┐  ┌─────────────────┐ │
                    │  │ Google     │  │ OpenAI          │ │
                    │  │ Gemini API │  │ API (fallback)  │ │
                    │  └────────────┘  └─────────────────┘ │
                    └──────────────────────────────────────┘
```

### 1.2 Chi tiết version

| Component | Version | Ghi chú |
|-----------|---------|---------|
| **Runtime** | Node.js ≥ 18 LTS | |
| **Backend** | NestJS 10.x | TypeScript strict mode |
| **ORM** | Prisma 5.x | Migration-based schema management |
| **Database** | PostgreSQL 15+ | UUID primary keys |
| **Cache/Queue** | Redis 7+ | BullMQ cho async scoring |
| **Frontend** | Next.js 14 (App Router) | React 18, TailwindCSS |
| **Auth** | Passport + JWT | Access token (15m) + Refresh token (7d) |
| **i18n** | next-intl | Tiếng Việt (vi) + English (en) |

---

## 2. LLM Integration Constraints (D9, D10)

### 2.1 Provider và model

| Provider | Model | Dùng cho | Chi phí ước tính |
|----------|-------|----------|------------------|
| **Google Gemini** (primary) | gemini-2.5-flash | Chấm Writing tier cheap | ~120đ/bài |
| **Google Gemini** (premium) | gemini-2.5-pro | Bài kiểm tra / bài bất định | ~1.200–2.400đ/bài |
| **OpenAI** (fallback) | gpt-4o-mini | Khi Gemini down | ~200đ/bài |
| **Local Qwen** (dev only) | qwen3:27b via Ollama | Integration test | Miễn phí |

### 2.2 Ràng buộc bắt buộc

| Ràng buộc | Lý do | Enforcement |
|-----------|-------|-------------|
| **Paid tier API bắt buộc** | Free tier cho phép provider dùng dữ liệu huấn luyện model — vi phạm tinh thần bảo vệ dữ liệu HS | Kiểm tra khi deploy |
| **Data minimization** | Essay HS có thể chứa thông tin cá nhân | Prompt chỉ gửi đề + essay; KHÔNG gửi tên, email, lớp, ID |
| **Structured output** | Regex parse JSON gây lỗi "Invalid JSON from LLM" | Gemini: `responseMimeType: 'application/json'` + `responseSchema`; OpenAI: `response_format: json_schema` |
| **Temperature 0** | Tác vụ chấm điểm cần nhất quán | Ghim trong config, không để dev tự set |
| **Prompt versioning** | Calibration data giữa các version prompt không được trộn | Cột `prompt_version` trong WritingSubmission |
| **Timeout 60s** | Tránh worker treo vĩnh viễn | AbortController per call |
| **Retry 3 lần** | LLM API không ổn định 100% | BullMQ `attempts: 3`, `backoff: exponential 5s` |
| **Idempotency** | Nộp trùng không chấm hai lần | Job ID = Submission ID |
| **Qwen cấm production** | Chất lượng chấm không đạt chuẩn | Guard: `NODE_ENV=production` + provider=local → throw |

### 2.3 SDK migration (khẩn cấp)

| Cũ | Mới | Lý do |
|----|-----|-------|
| `@google/generative-ai` | `@google/genai` | SDK cũ EOL 30/11/2025 — hết support hơn 7 tháng |

### 2.4 Lộ trình chấm AI 3 pha (D9)

| Pha | Thời điểm | Nội dung |
|-----|-----------|----------|
| **Pha 1** | M1–M2 | Calibrated few-shot prompt (6–10 essay neo chuẩn) + structured output + temperature 0 + prompt_version + tier premium thật |
| **Pha 2** | M6 (trước pilot) | Ensemble ×3 + cờ bất định → ưu tiên lên đầu review queue GV |
| **Pha 3** | Sau pilot | Đánh giá fine-tune bằng calibration data thu được từ pilot |

---

## 3. Database Constraints

| Ràng buộc | Chi tiết |
|-----------|----------|
| Primary key | UUID v4 cho mọi model |
| Timezone | Mọi timestamp lưu UTC (`@db.Timestamptz`) |
| Migration | Prisma Migrate — mỗi thay đổi schema tạo migration file, commit vào repo |
| Soft delete | Account deletion: xóa mềm 7 ngày → xóa cứng (US-602) |
| Index | Tối thiểu theo spec M1; thêm index dựa trên query pattern thực tế trong pilot |
| Connection pool | Prisma default (10 connections) — đủ cho pilot; tăng khi scale |

---

## 4. API Constraints

| Ràng buộc | Chi tiết |
|-----------|----------|
| Protocol | REST over HTTPS |
| Auth | JWT Bearer token; access (15 min) + refresh (7 ngày) |
| Rate limit | Global: TBD; Writing submit: 10 bài/ngày/HS (Redis) |
| Response format | JSON; lỗi trả dạng `{ statusCode, message, error }` |
| Validation | `class-validator` decorators trên DTO |
| Documentation | Swagger auto-gen từ decorators — `/api/docs` |
| CORS | Whitelist frontend domain |
| File upload | Giới hạn 10MB/file (docx import) |

---

## 5. Frontend Constraints

| Ràng buộc | Chi tiết |
|-----------|----------|
| Responsive breakpoints | Mobile: < 900px (drawer sidebar); Tablet: 900–1280px (rail mode); Desktop: > 1280px (full sidebar 220px) |
| Luồng GV | Desktop-first; không cam kết mobile trong pre-pilot |
| Luồng HS | Mobile-responsive bắt buộc (viewport 375px); làm bài, xem feedback, tiến độ |
| Take-test pages | Ẩn sidebar khi fullscreen mode |
| i18n | Mọi key mới phải có cả `en` + `vi` |
| Dependencies | Không thêm dependency mới mà không có lý do + approval |
| State management | React state + SWR/React Query cho server state; không Redux |

---

## 6. Infrastructure Constraints (pilot)

| Ràng buộc | Chi tiết |
|-----------|----------|
| Hosting | TBD — đề xuất: Railway/Render (đơn giản cho solo dev) hoặc VPS |
| Database hosting | Managed PostgreSQL (Supabase/Neon/Railway) |
| Redis hosting | Managed Redis (Upstash/Railway) |
| CI/CD | GitHub Actions — lint + test + deploy |
| Monitoring | Tối thiểu: health check endpoint + error logging (Sentry free tier hoặc tương đương) |
| Backup | Database backup tự động hàng ngày (managed service cung cấp sẵn) |
| SSL | Bắt buộc — HTTPS only |
| Environment | 2 môi trường: development (local) + production |

---

## 7. Compliance Constraints

| Ràng buộc | Chi tiết | Tham chiếu |
|-----------|----------|------------|
| Luật BVDLCN 91/2025/QH15 | Hiệu lực 01/01/2026 — áp dụng cho mọi xử lý dữ liệu cá nhân | BA Mục 13 |
| Dữ liệu trẻ em (< 16 tuổi) | Cần consent phụ huynh/người giám hộ | US-601 |
| Quyền xóa dữ liệu | Người dùng có quyền yêu cầu xóa toàn bộ | US-602 |
| Chuyển dữ liệu xuyên biên giới | Essay gửi tới Google/OpenAI (server ngoài VN) — cần privacy policy minh bạch | BA Mục 13 |
| Bản quyền nội dung | GV tự upload → GV chịu trách nhiệm; đề Cambridge không được seed vào production | BA R5 |

---

## 8. Những thứ KHÔNG ràng buộc (tự do quyết định)

- UI framework components (dùng bất kỳ component library nào phù hợp)
- Cấu trúc thư mục frontend (đã theo App Router convention)
- Testing framework (Jest đã có sẵn trong repo)
- Git branching strategy (founder solo — trunk-based đơn giản nhất)
- Deployment region (chọn gần VN nhất có thể)

---

# ══════════════════════════════════════════════════════
# NỘI DUNG GỐC TỪ PRD BAN ĐẦU (02/2025)
# Giữ lại để tham chiếu. Khi mâu thuẫn, phần trên ưu tiên.
# ══════════════════════════════════════════════════════

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
| Backend ORM | Prisma | 6.x | Migrations, UUID support |
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
| **Stale job cleanup** | Cron every 5 min: mark submissions with status='pending' AND created_at > 10 min ago as 'failed' | Log warning |
| **Dashboard** | BullBoard or Arena UI mounted at `/admin/queues` (dev only) |

---

## 6. Database Constraints

| Aspect | Constraint |
|--------|-----------|
| **Primary keys** | UUID v4 (`gen_random_uuid()`) — no auto-increment |
| **Timestamps** | All tables include `created_at TIMESTAMPTZ`; mutable tables include `updated_at` |
| **JSONB validation** | Application-level validation; no DB-level JSON Schema |
| **Indexes** | Explicitly defined per entity (see PRD-08); GIN for arrays |
| **Migrations** | Prisma migrations; sequential, never edited after merge |
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
