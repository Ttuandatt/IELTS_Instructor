# ⚠️ Dependencies & Risks — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-13  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [12_technical_constraints](12_technical_constraints.md) | [07_non_functional_requirements](07_non_functional_requirements.md)

---

## 1. External Dependencies

### DEP-01 — LLM API Provider

| Attribute | Detail |
|-----------|--------|
| **Dependency** | OpenAI / Google Gemini / Anthropic API |
| **Usage** | Writing submission scoring (hybrid pipeline) |
| **Criticality** | **High** — writing scoring is unusable without LLM |
| **Required For** | FR-302, FR-303, WR-002 |
| **SLA Expected** | 99.5% uptime; <5s response for scoring prompts |
| **Fallback** | If primary provider fails → try secondary provider (configurable). If all fail → mark `processing_status=failed`, user can retry. |
| **Cost** | ~$0.002–0.005 per cheap call; ~$0.02–0.05 per premium call |
| **Action Items** | Configure `LLM_PROVIDER` + `LLM_FALLBACK_PROVIDER` env vars. Pre-provision API keys for at least 2 providers. |

---

### DEP-02 — NotebookLM Content Source

| Attribute | Detail |
|-----------|--------|
| **Dependency** | NotebookLM (https://notebooklm.google.com/) |
| **Usage** | Admin imports reading passages and writing prompts |
| **Criticality** | **Medium** — manual content creation works without it |
| **Required For** | FR-601, SY-001, SY-002 |
| **SLA Expected** | Best-effort; Google service — no SLA guarantee |
| **Fallback** | Admin creates content manually via CMS forms. Imported sources are cached in Redis (30 min TTL). |
| **Risk** | Google may change/restrict NotebookLM access or API format |
| **Action Items** | Cache fetched data aggressively. Design import as optional feature. |

---

### DEP-03 — PostgreSQL Database

| Attribute | Detail |
|-----------|--------|
| **Dependency** | PostgreSQL 15+ |
| **Usage** | Primary data store for all entities |
| **Criticality** | **Critical** — application non-functional without DB |
| **Required For** | All FRs |
| **Provisioning** | Local install or Docker container (`docker compose up -d postgres`) |
| **Backup** | Docker volumes for dev; automated backups for prod (Phase 2) |
| **Action Items** | Include in `docker-compose.yml`. Seed script for initial data. |

---

### DEP-04 — Redis

| Attribute | Detail |
|-----------|--------|
| **Dependency** | Redis 7+ |
| **Usage** | Cache, rate limiting, BullMQ job queue |
| **Criticality** | **High** — writing scoring queue depends on Redis |
| **Required For** | WR-003 (rate limits), WR-004 (queue), SY-001 (cache) |
| **Fallback** | If Redis down → writing submissions fail (queue unavailable). Reading/Auth continue to work (DB-only). |
| **Provisioning** | Local install or Docker container |
| **Action Items** | Include in `docker-compose.yml`. Configure connection pooling. |

---

### DEP-05 — VS Code Dev Tunnels

| Attribute | Detail |
|-----------|--------|
| **Dependency** | VS Code Dev Tunnels / Port Forwarding |
| **Usage** | Sharing local dev environment for review |
| **Criticality** | **Low** — only needed for remote sharing |
| **Fallback** | ngrok, localtunnel, or direct LAN access |
| **Action Items** | Document setup in dev onboarding guide. |

---

## 2. Internal Dependencies

| Dependency | From | To | Description |
|-----------|------|-----|-------------|
| Auth middleware | All protected endpoints | Auth service | JWT validation + RBAC guard |
| Scoring worker | Writing submit | BullMQ + LLM | Async job processing |
| Grading service | Reading submit | Question data | MCQ/short answer comparison |
| Content status filter | Learner endpoints | Content tables | `WHERE status='published'` |
| Version logger | Admin mutations | content_versions table | Audit trail on every change |

---

## 3. Risk Register

### RISK-01 — Model Cost Overruns

| Attribute | Detail |
|-----------|--------|
| **ID** | RISK-01 |
| **Category** | Financial |
| **Probability** | Medium (3/5) |
| **Impact** | Medium (3/5) |
| **Risk Score** | 9/25 |
| **Description** | LLM API costs exceed budget if usage is higher than expected or if users abuse the system. |
| **Triggers** | High user volume, no rate limits, premium tier overuse |
| **Mitigation** | 1. Default to cheap tier. 2. Rate limit 5–10/day/user. 3. Token caps (600–900). 4. Usage logging + daily cost alerts. 5. Admin dashboard shows daily spend. |
| **Contingency** | Temporarily disable premium tier. Reduce daily limit. Switch to cheaper model. |
| **Owner** | Backend lead |
| **Status** | Mitigated by design |

---

### RISK-02 — Scoring Inconsistency

| Attribute | Detail |
|-----------|--------|
| **ID** | RISK-02 |
| **Category** | Quality |
| **Probability** | High (4/5) |
| **Impact** | High (4/5) |
| **Risk Score** | 16/25 |
| **Description** | LLM scoring produces inconsistent results across similar essays, or scores don't align with human IELTS benchmarks. |
| **Triggers** | Model randomness, poor prompt engineering, no calibration |
| **Mitigation** | 1. Detailed rubric in system prompt with IELTS band descriptors. 2. Temperature = 0.1–0.3 for consistency. 3. JSON schema enforcement. 4. Rule-based pre-checks (word count, structure). 5. Calibration set: 20–30 pre-scored essays for regression testing. |
| **Contingency** | Instructor manual override option. A/B test prompt variations. |
| **Owner** | AI/scoring lead |
| **Status** | Partially mitigated; calibration set needs creation |

---

### RISK-03 — Import Quality / Malformed Content

| Attribute | Detail |
|-----------|--------|
| **ID** | RISK-03 |
| **Category** | Data Quality |
| **Probability** | Medium (3/5) |
| **Impact** | Medium (3/5) |
| **Risk Score** | 9/25 |
| **Description** | Content imported from NotebookLM may be malformed, contain broken HTML, or be unsuitable for IELTS practice. |
| **Triggers** | NotebookLM format changes, HTML artifacts, non-IELTS content |
| **Mitigation** | 1. Sanitize HTML on import (SY-002). 2. Admin review before publish (ADM-001). 3. Store source URL for verification. 4. Draft status by default. |
| **Contingency** | Reject malformed imports with clear error. Manual content creation fallback. |
| **Owner** | Admin/content lead |
| **Status** | Mitigated by design |

---

### RISK-04 — Scoring Latency / Queue Backlog

| Attribute | Detail |
|-----------|--------|
| **ID** | RISK-04 |
| **Category** | Performance |
| **Probability** | Medium (3/5) |
| **Impact** | Medium (3/5) |
| **Risk Score** | 9/25 |
| **Description** | Writing scoring takes too long, queue jobs accumulate, SLA (<5 min) breached. |
| **Triggers** | LLM provider slow response, high concurrent submissions, low worker count |
| **Mitigation** | 1. Job timeout 90s. 2. Retry with backoff. 3. DLQ for stuck jobs. 4. Monitor queue depth + latency. 5. Alert when depth > 10 or avg latency > 3 min. |
| **Contingency** | Increase worker concurrency. Scale to separate worker process. |
| **Owner** | Backend lead |
| **Status** | Mitigated by design |

---

### RISK-05 — Data Loss in Local Dev

| Attribute | Detail |
|-----------|--------|
| **ID** | RISK-05 |
| **Category** | Infrastructure |
| **Probability** | Low (2/5) |
| **Impact** | Low (2/5) |
| **Risk Score** | 4/25 |
| **Description** | Local Postgres/Redis data lost due to container restart, crash, or developer error. |
| **Triggers** | `docker compose down -v`, disk failure, accidental deletion |
| **Mitigation** | 1. Docker named volumes (not anonymous). 2. Seed scripts for quick re-creation. 3. Git-track migration files. 4. Document backup/restore in dev guide. |
| **Contingency** | Re-run migrations + seed script. 2 min recovery. |
| **Owner** | DevOps / all devs |
| **Status** | Mitigated |

---

### RISK-06 — Provider API Breaking Changes

| Attribute | Detail |
|-----------|--------|
| **ID** | RISK-06 |
| **Category** | Technical |
| **Probability** | Low (2/5) |
| **Impact** | High (4/5) |
| **Risk Score** | 8/25 |
| **Description** | LLM provider changes API format, deprecates models, or increases pricing significantly. |
| **Triggers** | Provider announcements, SDK version changes |
| **Mitigation** | 1. Abstract LLM calls behind adapter pattern (strategy design). 2. Configure provider + model via env vars. 3. Support 2+ providers. 4. Pin SDK versions. |
| **Contingency** | Switch to alternative provider within 1 day. |
| **Owner** | Backend lead |
| **Status** | Mitigated by architecture |

---

## 4. Risk Matrix (Probability × Impact)

```
Impact →   1-Low    2        3-Med    4        5-High
Prob ↓
5-High                                RISK-02
4                                     
3-Med               RISK-05  RISK-01  
                              RISK-03  
                              RISK-04  
2-Low                        RISK-06  
1-Low                                 
```

---

## 5. Dependency Health Check Plan

| Dependency | Health Check | Frequency | Alert Threshold |
|-----------|-------------|-----------|-----------------|
| PostgreSQL | `SELECT 1` via pool | Every 30s | 3 consecutive failures |
| Redis | `PING` | Every 30s | 3 consecutive failures |
| LLM API | Test prompt (1 token) | Every 5 min | 2 consecutive failures |
| NotebookLM | Cached status | On import only | N/A (graceful degrade) |
| BullMQ | Queue metrics | Every 30s | Depth > 20 or stale > 5 min |

---

> **Tham chiếu:** [07_non_functional_requirements](07_non_functional_requirements.md) | [12_technical_constraints](12_technical_constraints.md)
