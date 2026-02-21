# 📏 Business Rules — IELTS Helper (MVP, Step 2 Summary)

> **Mã tài liệu:** STEP2-RULES  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Framework:** Vibe Coding v2.0 — Step 2: Low-Code Prototype  
> **Full detail:** [11_business_rules](../step3_prd/11_business_rules.md)

---

## 1. Reading Rules

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| RD-001 | ≥ 80% questions answered before submit | Backend validation | 400 error; prompt to complete more |
| RD-002 | Auto-grade: MCQ direct compare; short answer case-insensitive keyword match | Backend grading service | — |
| RD-003 | Timer expiry → auto-submit (bypass 80% rule); flag `timed_out=true` | Frontend timer + backend override | Accept partial answers |
| RD-004 | Keep all attempt history (INSERT only, no UPDATE) | Backend service | — |

---

## 2. Writing Rules

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| WR-001 | Word count below prompt `min_words` → warn but allow submit | Frontend warning + backend store | Visual warning; feedback may note |
| WR-002 | Hybrid scoring: rule checks → LLM rubric (TR/CC/LR/GRA 0–9) → JSON feedback | BullMQ worker | — |
| WR-003 | Default cheap tier; rate limit 5–10/day/user | Backend rate-limit middleware | 429 error if exceeded |
| WR-004 | SLA < 5 min for 90% jobs; timeout 90s; retry 2x; DLQ on failure | BullMQ config | Mark status=failed with error |
| WR-005 | Store full scoring metadata (scores, feedback, model, turnaround) | Worker after scoring | — |

---

## 3. Admin/Content Rules

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| ADM-001 | Draft content hidden from learners; only published visible | Backend: `WHERE status='published'` | Content not shown |
| ADM-002 | Imported content must reference ≥ 1 source | Backend validation on import | Validation error |
| ADM-003 | Record content version on every mutation | Backend service middleware | — |

---

## 4. System/Sync Rules

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| SY-001 | Cache NotebookLM fetch in Redis (TTL 15–60 min) | Import service | — |
| SY-002 | Sanitize all imported HTML (strip scripts, events) | Sanitize utility | Reject malformed content |
| SY-003 | Log admin ID for every import action | Import service | — |

---

## 5. Auth Rules

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| AU-001 | Password: min 8 chars, 1 upper, 1 lower, 1 digit | Backend + frontend validation | 400 error |
| AU-002 | JWT access token TTL = 15 min; refresh TTL = 7 days | Auth service | Auto-refresh or re-login |
| AU-003 | Refresh token rotated on each use; old invalidated | Auth service | 401 if old token used |
| AU-004 | Login rate-limit: 5/15min per IP; Register: 3/15min per IP | Rate-limit middleware | 429 error |

---

> **Tham chiếu:** [11_business_rules](../step3_prd/11_business_rules.md) (full detail with test scenarios)
