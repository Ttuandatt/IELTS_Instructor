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
| Queue backpressure | If queue depth > 100 jobs → reject new submissions with 503 + Retry-After header | ScoringProducer check before enqueue |

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

---

# ══════════════════════════════════════════════════════
# BỔ SUNG TỪ BUSINESS ANALYSIS & REDESIGN (07/2026)
# Các mục dưới đây bổ sung từ BA 6 vòng elicitation,
# phân tích đối thủ, và thiết kế state machine mới.
# Khi có mâu thuẫn với nội dung trên, phần này được ưu tiên.
# ══════════════════════════════════════════════════════

# Non-Functional Requirements
## Dự án Langy — Pre-pilot MVP

> **Phiên bản:** 1.0
> **Ngày tạo:** 06/07/2026

---

## 1. Performance

| ID | Requirement | Metric | Ghi chú |
|----|-------------|--------|---------|
| NFR-PERF-001 | Trang làm bài tải nhanh trên mạng 4G | ≤ 3 giây (Time to Interactive) | Luồng HS — mobile |
| NFR-PERF-002 | Chấm Reading tức thì sau nộp | ≤ 500ms | Server-side so đáp án |
| NFR-PERF-003 | Chấm Writing AI hoàn thành | p95 ≤ 3 phút (từ submitted → ai_scored) | Phụ thuộc LLM API |
| NFR-PERF-004 | Auto-save draft Writing | Mỗi 30 giây, ≤ 200ms/request | Không block UI |
| NFR-PERF-005 | Dashboard GV load | ≤ 2 giây cho lớp ≤ 30 HS | Query tối ưu |

## 2. Scalability (pilot scope)

| ID | Requirement | Metric |
|----|-------------|--------|
| NFR-SCALE-001 | Đồng thời tối thiểu | 50 users (5 GV × ~10 HS/lớp) |
| NFR-SCALE-002 | Throughput chấm AI | 20 bài/phút (BullMQ concurrency) |
| NFR-SCALE-003 | Database connections | 10 (Prisma default) — đủ cho pilot |

## 3. Security

| ID | Requirement | Chi tiết |
|----|-------------|----------|
| NFR-SEC-001 | HTTPS only | SSL/TLS bắt buộc mọi endpoint |
| NFR-SEC-002 | Password hashing | bcrypt (salt rounds ≥ 10) |
| NFR-SEC-003 | JWT token security | Access token 15 phút, refresh 7 ngày; HttpOnly cookie cho refresh |
| NFR-SEC-004 | Input validation | Class-validator trên mọi DTO; sanitize HTML input |
| NFR-SEC-005 | SQL injection prevention | Prisma ORM — parameterized queries mặc định |
| NFR-SEC-006 | Rate limiting | Global API rate limit + 10 bài Writing/ngày/HS (Redis) |
| NFR-SEC-007 | CORS | Whitelist frontend domain; không wildcard |
| NFR-SEC-008 | Prompt injection mitigation | Schema validator kiểm tra output AI; band score phải trong range 0–9; reject nếu ngoài |
| NFR-SEC-009 | API key management | LLM API keys trong environment variables; không hardcode; không commit vào repo |

## 4. Privacy & Data Protection

| ID | Requirement | Chi tiết | Tham chiếu |
|----|-------------|----------|------------|
| NFR-PRIV-001 | Data minimization | Prompt chấm AI chỉ chứa đề + essay; không gửi PII (tên, email, ID) | Luật 91/2025, D10 |
| NFR-PRIV-002 | Paid tier API | Không dùng free tier LLM API (provider có thể dùng dữ liệu để train) | BA Mục 13 |
| NFR-PRIV-003 | Privacy policy | Tiếng Việt dễ hiểu; nêu rõ dữ liệu nào thu, gửi tới AI nào, mục đích, thời gian lưu | US-601 |
| NFR-PRIV-004 | Consent phụ huynh | HS dưới 16: xác nhận của phụ huynh/người giám hộ | US-601 |
| NFR-PRIV-005 | Quyền xóa | Người dùng xóa được tài khoản + toàn bộ dữ liệu bài làm | US-602 |
| NFR-PRIV-006 | Thông báo rò rỉ | Nghĩa vụ thông báo cho người dùng nếu xảy ra data breach | Luật 91/2025 |
| NFR-PRIV-007 | Xuyên biên giới | Essay gửi tới Google/OpenAI (server ngoài VN) — ghi rõ trong privacy policy | BA Mục 13 |

## 5. Reliability

| ID | Requirement | Chi tiết |
|----|-------------|----------|
| NFR-REL-001 | Submission không bao giờ mất | Mọi trạng thái lỗi đều nhìn thấy được (ai_failed) và có đường thoát (chấm lại/chấm tay) |
| NFR-REL-002 | LLM fallback | Primary (Gemini) down → tự động chuyển sang fallback (OpenAI) |
| NFR-REL-003 | Retry với backoff | BullMQ: 3 attempts, exponential backoff 5s base |
| NFR-REL-004 | Idempotency | Job ID = Submission ID → nộp trùng không tạo hai lần chấm |
| NFR-REL-005 | Database backup | Tự động hàng ngày (managed service) |
| NFR-REL-006 | Graceful degradation | Nếu AI scoring queue đầy → HS vẫn nộp được, bài xếp hàng; UI hiển thị "đang chờ chấm" |

## 6. Usability

| ID | Requirement | Chi tiết |
|----|-------------|----------|
| NFR-UX-001 | Responsive cho HS | Luồng làm bài + xem feedback dùng tốt ở viewport 375px (iPhone SE) |
| NFR-UX-002 | GV desktop-first | Luồng GV tối ưu cho desktop; không cam kết mobile GV trong pre-pilot |
| NFR-UX-003 | Bilingual | Giao diện hỗ trợ tiếng Việt + English; mọi i18n key phải có cả hai |
| NFR-UX-004 | Onboarding GV | GV không biết code phải tự tạo lớp + giao bài lần đầu mà không cần founder hướng dẫn |
| NFR-UX-005 | Error messages | Thông báo lỗi rõ ràng, bằng tiếng Việt, hướng dẫn hành động tiếp |

## 7. Cost

| ID | Requirement | Metric |
|----|-------------|--------|
| NFR-COST-001 | Chi phí AI chấm | ≤ 200đ/bài ở p95 (đã gồm retry) |
| NFR-COST-002 | Cảnh báo chi phí | Alert nếu chi tiêu API ngày vượt ngưỡng đặt trước |
| NFR-COST-003 | Token usage logging | Mỗi lượt chấm log tokens_input + tokens_output → tính chi phí thực |
| NFR-COST-004 | Context caching | Rubric prompt (tĩnh) dùng context caching Gemini → giảm ~90% input cost lặp |

## 8. Maintainability

| ID | Requirement | Chi tiết |
|----|-------------|----------|
| NFR-MAINT-001 | TypeScript strict mode | Backend + frontend; no `any` without justification |
| NFR-MAINT-002 | Prisma migration-based | Mọi thay đổi schema qua migration file, commit vào repo |
| NFR-MAINT-003 | Swagger auto-gen | API docs tự động từ NestJS decorators; luôn up-to-date |
| NFR-MAINT-004 | Calibration data | Cặp (band AI, band GV chốt) lưu tự động → tài sản dài hạn để cải thiện prompt |
| NFR-MAINT-005 | Prompt version tracking | `prompt_version` trong submission → không trộn calibration data giữa các version |
