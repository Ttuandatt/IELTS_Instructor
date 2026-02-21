# ⚙️ Functional Requirements — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-05  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [04_user_stories](04_user_stories.md) | [11_business_rules](11_business_rules.md)

---

## 1. Quy ước

- **ID format:** `FR-{domain}{number}` — domain: 1xx = Auth, 2xx = Reading, 3xx = Writing, 4xx = Dashboard, 5xx = Admin, 6xx = Import.
- **Priority:** P0 (Must-have) | P1 (Should-have) | P2 (Nice-to-have).
- Mỗi FR có: description, business rules, pre-conditions, post-conditions, input/output specs.

---

## 2. Authentication & Profile

### FR-101: User Registration

| Field | Value |
|-------|-------|
| **ID** | FR-101 |
| **Title** | Đăng ký tài khoản người dùng |
| **Priority** | P0 |
| **User Story** | US-101 |

**Mô tả:**  
Hệ thống cho phép người dùng mới đăng ký tài khoản bằng email và password. Sau khi đăng ký thành công, user nhận JWT tokens và được redirect vào hệ thống.

**Business Rules:**
- Default role = `learner` (BR-101)
- Password phải ≥ 8 ký tự, chứa ít nhất 1 uppercase, 1 number, 1 special char (BR-102)
- Email phải unique trên toàn hệ thống (BR-103)

**Pre-conditions:**
- User chưa có tài khoản với email này.
- Kết nối network khả dụng.

**Post-conditions:**
- Record mới trong bảng `users` với role=learner.
- JWT access token + refresh token được trả về.
- User session bắt đầu.

**Input:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | ✅ | Email format; unique |
| password | string | ✅ | Min 8 chars, 1 upper, 1 num, 1 special |
| display_name | string | ❌ | Max 50 chars; default = email prefix |
| language | enum | ❌ | `vi` \| `en`; default `vi` |
| theme | enum | ❌ | `dark` \| `light`; default `light` |

**Output (success 201):**

| Field | Type | Description |
|-------|------|-------------|
| access_token | string | JWT, TTL 15 min |
| refresh_token | string | Opaque token, TTL 7 days |
| user | object | `{id, email, role, display_name, language, theme}` |

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 400 | Validation failed (bad email, weak password) |
| 409 | Email already registered |

---

### FR-102: User Login

| Field | Value |
|-------|-------|
| **ID** | FR-102 |
| **Title** | Đăng nhập người dùng |
| **Priority** | P0 |
| **User Story** | US-102 |

**Mô tả:**  
User đăng nhập bằng email + password. Nếu thành công, nhận JWT tokens. Nếu sai, trả lỗi generic (không tiết lộ field nào sai).

**Business Rules:**
- Không tiết lộ email có exist hay không trong error message (BR-104)

**Pre-conditions:**
- User đã có account trong hệ thống.

**Post-conditions:**
- JWT access + refresh tokens được cấp.

**Input:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | ✅ | Email format |
| password | string | ✅ | Non-empty |

**Output (success 200):**

| Field | Type | Description |
|-------|------|-------------|
| access_token | string | JWT, TTL 15 min |
| refresh_token | string | Opaque, TTL 7 days |
| user | object | `{id, email, role, display_name, language, theme}` |

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 401 | Invalid credentials |

---

### FR-103: Token Refresh

| Field | Value |
|-------|-------|
| **ID** | FR-103 |
| **Title** | Làm mới access token |
| **Priority** | P0 |
| **User Story** | US-103 |

**Mô tả:**  
Client gửi refresh token để nhận access token mới. Refresh token được rotate (token cũ bị revoke, trả token mới).

**Input:**

| Field | Type | Required |
|-------|------|----------|
| refresh_token | string | ✅ |

**Output (success 200):**

| Field | Type |
|-------|------|
| access_token | string |
| refresh_token | string (new) |

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 401 | Invalid or expired refresh token |

---

### FR-104: Get & Update Profile

| Field | Value |
|-------|-------|
| **ID** | FR-104 |
| **Title** | Xem và cập nhật profile |
| **Priority** | P0 |
| **User Story** | US-104 |

**Mô tả:**  
User xem thông tin cá nhân (GET /me) và cập nhật display_name, language, theme (PATCH /me).

**Input (PATCH):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| display_name | string | ❌ | Max 50 chars |
| language | enum | ❌ | `vi` \| `en` |
| theme | enum | ❌ | `dark` \| `light` |

**Output:** Updated user object.

---

## 3. Reading Practice

### FR-201: Reading Catalog

| Field | Value |
|-------|-------|
| **ID** | FR-201 |
| **Title** | Danh sách passages với filter & pagination |
| **Priority** | P0 |
| **User Story** | US-201 |

**Mô tả:**  
API trả danh sách passages đã published. Hỗ trợ filter theo level, topic; pagination (offset-based). Mỗi item chứa summary info (không full body).

**Business Rules:**
- Chỉ hiển thị passages có status = `published` (ADM-001)
- Sort mặc định: `created_at DESC`

**Pre-conditions:**
- User đã authenticated (bất kỳ role).

**Input (query params):**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| level | enum | ❌ | all | A2 \| B1 \| B2 \| C1 |
| topic | string | ❌ | — | Filter by topic tag (partial match) |
| page | number | ❌ | 1 | Page number |
| limit | number | ❌ | 10 | Items per page (max 50) |

**Output (200):**

| Field | Type | Description |
|-------|------|-------------|
| data | array | `[{id, title, level, topic_tags[], question_count, source_refs[], created_at}]` |
| meta | object | `{page, limit, total, totalPages}` |

---

### FR-202: Reading Detail

| Field | Value |
|-------|-------|
| **ID** | FR-202 |
| **Title** | Chi tiết passage + questions |
| **Priority** | P0 |
| **User Story** | US-202 |

**Mô tả:**  
Trả full passage body + danh sách questions. Explanations và answer keys **KHÔNG** được trả ở endpoint này — chỉ trả sau khi submit.

**Pre-conditions:**
- Passage tồn tại và status = `published`.

**Output (200):**

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Passage ID |
| title | string | — |
| body | string | Full passage text |
| level | enum | A2–C1 |
| topic_tags | string[] | — |
| questions | array | `[{id, type, prompt, options[]}]` — **KHÔNG** có answer_key/explanation |
| question_count | number | Total questions |
| source_refs | array | `[{source_id, title}]` |

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 404 | Passage not found or unpublished |

---

### FR-203: Reading Submit & Auto-grade

| Field | Value |
|-------|-------|
| **ID** | FR-203 |
| **Title** | Nộp bài Reading và chấm điểm tự động |
| **Priority** | P0 |
| **User Story** | US-204 |
| **Business Rules** | RD-001, RD-002, RD-003, RD-004 |

**Mô tả:**  
Learner nộp câu trả lời cho passage. Hệ thống kiểm tra rule ≥80% answered (RD-001), auto-grade, trả score + per-question results + explanations, lưu attempt.

**Pre-conditions:**
- User có role = `learner`.
- Passage tồn tại và published.

**Validation (RD-001):**
- Đếm số câu có answer (non-null, non-empty) / tổng questions.
- Nếu < 80% → trả 400 với message "Please answer at least {min_count} questions ({current}/{total} answered)".

**Grading Logic (RD-002):**
- MCQ: `answer.value === question.answer_key` → correct.
- Short answer: `answer.value.trim().toLowerCase()` match bất kỳ keyword nào trong `question.answer_key[]` → correct.

**Timed-out Handling (RD-003):**
- Client gửi `timed_out: true` khi timer hết giờ.
- Grading chạy bình thường trên câu đã trả lời; timed_out flag được persist.

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| answers | array | ✅ | `[{question_id: uuid, value: string}]` |
| timed_out | boolean | ❌ | Default false |
| duration_sec | number | ❌ | Client-tracked duration |

**Output (200):**

| Field | Type | Description |
|-------|------|-------------|
| score_pct | number | Score percentage (0–100) |
| total_questions | number | — |
| correct_count | number | — |
| timed_out | boolean | — |
| duration_sec | number | — |
| details | array | `[{question_id, correct: boolean, your_answer, correct_answer, explanation}]` |

**Post-conditions:**
- New record in `submissions_reading`.
- Attempt history queryable (RD-004).

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 400 | Answers < 80% threshold (RD-001) |
| 400 | Invalid question_id in answers |
| 401 | Not authenticated |
| 403 | Role not learner |
| 404 | Passage not found |

---

### FR-204: Reading History

| Field | Value |
|-------|-------|
| **ID** | FR-204 |
| **Title** | Lịch sử attempts Reading |
| **Priority** | P1 |
| **User Story** | US-205 |

**Mô tả:**  
Trả danh sách reading attempts của learner hiện tại, sorted by date DESC. Hỗ trợ filter by passage, pagination.

**Output element:**

| Field | Type |
|-------|------|
| id | uuid |
| passage_id | uuid |
| passage_title | string |
| score_pct | number |
| duration_sec | number |
| timed_out | boolean |
| completed_at | datetime |

---

## 4. Writing Practice

### FR-301: Writing Prompt Catalog

| Field | Value |
|-------|-------|
| **ID** | FR-301 |
| **Title** | Danh sách Writing prompts |
| **Priority** | P0 |
| **User Story** | US-301 |

**Mô tả:**  
Danh sách prompts published, filter theo task_type (1/2), level, topic. Pagination.

**Input (query params):**

| Param | Type | Required | Default |
|-------|------|----------|---------|
| task_type | enum | ❌ | all |
| level | enum | ❌ | all |
| topic | string | ❌ | — |
| page | number | ❌ | 1 |
| limit | number | ❌ | 10 |

**Output:** Same pagination structure as FR-201 with prompt fields `{id, title, task_type, level, topic_tags[], source_refs[]}`.

---

### FR-302: Writing Submit & Hybrid Scoring

| Field | Value |
|-------|-------|
| **ID** | FR-302 |
| **Title** | Nộp essay & chấm điểm hybrid (rule + LLM) |
| **Priority** | P0 |
| **User Story** | US-303 |
| **Business Rules** | WR-001, WR-002, WR-003, WR-004, WR-005 |

**Mô tả:**  
Learner nộp essay. Backend kiểm tra rate-limit, enqueue scoring job, trả pending status. Scoring pipeline: rule checks → LLM scoring → persist results.

**Pre-conditions:**
- User role = `learner`.
- Prompt exists và published.
- User chưa vượt daily rate-limit (WR-003).

**Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | ✅ | Essay text |
| model_tier | enum | ❌ | `cheap` (default) \| `premium` |

**Processing Pipeline:**

```
1. Validate input (non-empty content, valid prompt_id)
2. Check rate-limit: count user's submissions today
   → If exceeded → 429 "Daily submission limit reached ({limit}/{max})"
3. Create submission record (processing_status = "pending")
4. Enqueue BullMQ job {submission_id, content, prompt, model_tier}
5. Return {processing_status: "pending", submission_id}

--- Async Worker ---
6. Rule checks:
   a. Word count → persist word_count
   b. Task relevance keywords check
   c. Basic structure check (paragraphs)
7. LLM scoring call:
   a. Build prompt: system rubric + user essay + scoring instructions
   b. Call model (tier: cheap → GPT-4o-mini/Gemini Flash; premium → GPT-4o/Claude)
   c. Parse JSON response: {TR, CC, LR, GRA, overall, summary, strengths[], improvements[]}
   d. Validate JSON schema → if invalid → retry (max 2 with backoff)
8. Persist: scores, feedback, model_name, turnaround_ms
9. Update processing_status = "done" (or "failed" if all retries exhausted)
```

**Output (sync — 202 Accepted):**

| Field | Type |
|-------|------|
| processing_status | `"pending"` |
| submission_id | uuid |

**Polling endpoint:** `GET /writing/submissions/{id}` → returns full submission when done.

**Output (when done):**

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Submission ID |
| processing_status | `"done"` | — |
| word_count | number | — |
| scores | object | `{TR, CC, LR, GRA, overall}` each 0–9 |
| feedback | object | `{summary, strengths[], improvements[]}` |
| model_tier | enum | `cheap` \| `premium` |
| model_name | string | e.g., "gpt-4o-mini" |
| turnaround_ms | number | Total processing time |
| created_at | datetime | — |

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 400 | Empty content or invalid prompt_id |
| 401 | Not authenticated |
| 403 | Role not learner |
| 404 | Prompt not found |
| 429 | Daily rate-limit exceeded |

**SLA:** 90% jobs complete < 5 minutes wall time (WR-004).

---

### FR-303: Writing Submission Detail

| Field | Value |
|-------|-------|
| **ID** | FR-303 |
| **Title** | Chi tiết submission (polling endpoint) |
| **Priority** | P0 |
| **User Story** | US-304 |

**Mô tả:**  
Trả chi tiết submission bao gồm essay content, scores, feedback, processing_status. Client poll endpoint này sau submit.

**Output:** Full submission payload as described in FR-302 output (when done). When `pending` → only `{id, processing_status, created_at}`. When `failed` → `{id, processing_status, error_message}`.

---

### FR-304: Writing History

| Field | Value |
|-------|-------|
| **ID** | FR-304 |
| **Title** | Lịch sử submissions Writing |
| **Priority** | P1 |
| **User Story** | US-307 |

**Mô tả:**  
List writing submissions cho user hiện tại. Filter by prompt, task_type, date. Pagination.

---

## 5. Dashboard

### FR-401: Learner Progress Summary

| Field | Value |
|-------|-------|
| **ID** | FR-401 |
| **Title** | Tổng quan tiến bộ learner |
| **Priority** | P0 |
| **User Story** | US-401, US-402 |

**Mô tả:**  
API trả aggregated metrics cho learner hiện tại.

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| reading.avg_score_pct | number | Average score across all reading attempts |
| reading.completion_rate | number | % attempts where answered ≥ 80% questions |
| reading.total_attempts | number | — |
| writing.avg_scores | object | `{TR, CC, LR, GRA, overall}` avg across done submissions |
| writing.total_submissions | number | — |
| recent_submissions | array | 10 most recent `[{type, title, score, date, id}]` |

---

### FR-402: Trend Data

| Field | Value |
|-------|-------|
| **ID** | FR-402 |
| **Title** | Dữ liệu trend theo tuần |
| **Priority** | P1 |
| **User Story** | US-403 |

**Mô tả:**  
Trả weekly aggregated data cho charts.

**Input:** `?period=4w` | `?period=3m`

**Output:**

| Field | Type |
|-------|------|
| weeks | array |
| weeks[].week_start | date |
| weeks[].reading_avg_score | number |
| weeks[].writing_avg_overall | number |
| weeks[].submission_count | number |

---

## 6. Admin CMS

### FR-501: Admin Content CRUD

| Field | Value |
|-------|-------|
| **ID** | FR-501 |
| **Title** | CRUD passages, questions, prompts |
| **Priority** | P0 |
| **User Story** | US-501, US-502, US-503 |
| **Business Rules** | ADM-001, ADM-003 |

**Mô tả:**  
Admin có thể Create/Read/Update/Delete passages (với nested questions) và writing prompts. Mỗi thay đổi ghi nhận content_version.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/passages | List all passages (incl. drafts) |
| POST | /admin/passages | Create passage |
| GET | /admin/passages/:id | Get passage detail |
| PATCH | /admin/passages/:id | Update passage |
| DELETE | /admin/passages/:id | Delete passage |
| POST | /admin/passages/:id/questions | Add question |
| PATCH | /admin/questions/:id | Update question |
| DELETE | /admin/questions/:id | Delete question |
| GET | /admin/prompts | List all prompts |
| POST | /admin/prompts | Create prompt |
| GET | /admin/prompts/:id | Get prompt detail |
| PATCH | /admin/prompts/:id | Update prompt |
| DELETE | /admin/prompts/:id | Delete prompt |

**Passage Input:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | ✅ | Max 200 chars |
| body | string | ✅ | Non-empty |
| level | enum | ✅ | A2 \| B1 \| B2 \| C1 |
| topic_tags | string[] | ❌ | Max 10 tags |
| source_ids | uuid[] | ❌ | Must exist in sources table |

---

### FR-502: Publish / Unpublish

| Field | Value |
|-------|-------|
| **ID** | FR-502 |
| **Title** | Publish/Unpublish content |
| **Priority** | P0 |
| **User Story** | US-504 |
| **Business Rules** | ADM-001, ADM-003 |

**Endpoint:** `POST /admin/content/{entity_type}/{id}/publish` / `POST .../unpublish`

**Logic:**
- Set `status` = `published` or `draft`.
- Create content_version record: `{entity_id, entity_type, version++, editor_id, updated_at, diff_summary}`.
- Published content visible to learners; draft hidden.

---

## 7. NotebookLM Import

### FR-601: Import Source

| Field | Value |
|-------|-------|
| **ID** | FR-601 |
| **Title** | Import source từ NotebookLM |
| **Priority** | P0 |
| **User Story** | US-601 |
| **Business Rules** | SY-001, SY-002, SY-003 |

**Mô tả:**  
Admin cung cấp NotebookLM URL + metadata. Backend fetch content, sanitize HTML, extract/store snippets, log provenance.

**Input:**

| Field | Type | Required |
|-------|------|----------|
| url | string (URL) | ✅ |
| title | string | ❌ |
| tags | string[] | ❌ |
| level | enum | ❌ |
| metadata | object | ❌ |

**Output (201):**

| Field | Type |
|-------|------|
| source_id | uuid |
| title | string |
| snippets | array of `{id, text_preview, tags}` |
| imported_at | datetime |
| imported_by | uuid (admin_id) |

**Processing:**
1. Check Redis cache for URL → if cached, return cached result.
2. Fetch content from URL.
3. Sanitize HTML (strip tags, normalize whitespace).
4. Extract text snippets (by paragraph/section).
5. Store source record + snippet records.
6. Cache result in Redis (TTL 15–60 min).
7. Log audit: admin_id, action=import, source_id, timestamp.

---

### FR-602: Attach Source to Content

| Field | Value |
|-------|-------|
| **ID** | FR-602 |
| **Title** | Gắn source/snippet vào content |
| **Priority** | P0 |
| **User Story** | US-602 |
| **Business Rules** | ADM-002 |

**Endpoint:** `POST /admin/content/{entity_type}/{id}/sources` → body `{source_ids[], snippet_ids[]}`

**Rule ADM-002:** Content imported từ NotebookLM phải có ≥ 1 source attached.

---

> **Tham chiếu:** [04_user_stories](04_user_stories.md) | [06_acceptance_criteria](06_acceptance_criteria.md) | [09_api_specifications](09_api_specifications.md) | [11_business_rules](11_business_rules.md)
