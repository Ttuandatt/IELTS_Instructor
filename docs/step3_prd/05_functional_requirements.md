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
- User chọn role khi đăng ký: `learner` | `instructor` | `admin`; default = `learner` (BR-101)
- Password phải ≥ 8 ký tự, chứa ít nhất 1 uppercase, 1 number, 1 special char (BR-102)
- Email phải unique trên toàn hệ thống (BR-103)

**Pre-conditions:**
- User chưa có tài khoản với email này.
- Kết nối network khả dụng.

**Post-conditions:**
- Record mới trong bảng `users` với role do user chọn (default: learner).
- JWT access token + refresh token được trả về.
- User session bắt đầu.

**Input:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | ✅ | Email format; unique |
| password | string | ✅ | Min 8 chars, 1 upper, 1 num, 1 special |
| display_name | string | ❌ | Max 50 chars; default = email prefix |
| role | enum | ❌ | `learner` \| `instructor` \| `admin`; default `learner` |
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
| collection | string | ❌ | — | Filter by collection (e.g. "IELTS Mock Test 2025") |
| page | number | ❌ | 1 | Page number |
| limit | number | ❌ | 10 | Items per page (max 50) |

**Output (200):**

| Field | Type | Description |
|-------|------|-------------|
| data | array | `[{id, title, level, collection, topic_tags[], question_count, source_refs[], created_at}]` |
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
| collection | string | ❌ | — |
| page | number | ❌ | 1 |
| limit | number | ❌ | 10 |

**Output:** Same pagination structure as FR-201 with prompt fields `{id, title, task_type, level, collection, topic_tags[], source_refs[]}`.

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

## 8. Classroom Management (7xx)

### FR-701: Classroom CRUD

| Field | Value |
|-------|-------|
| **ID** | FR-701 |
| **Title** | CRUD lớp học |
| **Priority** | P0 |
| **User Story** | US-801, US-809 |

**Mô tả:**
Instructor tạo/sửa/xóa/archive lớp học. Hệ thống tự sinh `invite_code` khi tạo.

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/classrooms` | Tạo lớp mới |
| GET | `/classrooms` | Danh sách lớp (owned + joined) |
| GET | `/classrooms/:id` | Chi tiết lớp |
| PATCH | `/classrooms/:id` | Sửa lớp (owner only) |
| DELETE | `/classrooms/:id` | Archive lớp (owner only) |

**Input (Create):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | ✅ | Max 100 chars |
| description | string | ❌ | Max 1000 chars |
| cover_image_url | string | ❌ | Valid URL |
| max_members | number | ❌ | Default 50, min 2, max 200 |

**Output (201):**

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | — |
| name | string | — |
| invite_code | string | 8-char alphanumeric |
| owner_id | uuid | — |
| status | string | 'active' |
| members_count | number | 1 (owner) |

---

### FR-702: Classroom Members Management

| Field | Value |
|-------|-------|
| **ID** | FR-702 |
| **Title** | Quản lý thành viên lớp |
| **Priority** | P0 |
| **User Story** | US-802, US-805, US-810 |

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/classrooms/:id/members` | Thêm thành viên bằng email |
| GET | `/classrooms/:id/members` | Danh sách thành viên |
| DELETE | `/classrooms/:id/members/:userId` | Xóa thành viên (owner only) |

**Input (Add member):**

| Field | Type | Required |
|-------|------|----------|
| email | string | ✅ |

**Business Rules:**
- CR-004: Reject nếu lớp đã đạt max_members.
- CR-005: Reject nếu user đã là thành viên.
- Chỉ owner classroom hoặc admin mới được add/remove members.

---

### FR-703: Invite Link & QR Code

| Field | Value |
|-------|-------|
| **ID** | FR-703 |
| **Title** | Tạo invite link và QR code |
| **Priority** | P0 |
| **User Story** | US-803, US-804 |

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classrooms/:id/invite` | Lấy invite_code + URL + QR base64 |
| POST | `/classrooms/:id/invite/regenerate` | Tạo invite_code mới |
| POST | `/classrooms/join` | Tham gia lớp bằng invite_code |

**Join Input:**

| Field | Type | Required |
|-------|------|----------|
| invite_code | string | ✅ |

**Join Output (200):**

| Field | Type |
|-------|------|
| classroom_id | uuid |
| classroom_name | string |
| role | 'student' |

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 404 | invite_code không hợp lệ |
| 409 | Đã là thành viên |
| 403 | Lớp đã đầy |

---

### FR-704: Topic CRUD

| Field | Value |
|-------|-------|
| **ID** | FR-704 |
| **Title** | CRUD chủ đề học trong lớp |
| **Priority** | P0 |
| **User Story** | US-806 |

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/classrooms/:id/topics` | Tạo topic |
| GET | `/classrooms/:id/topics` | Danh sách topics (ordered) |
| PATCH | `/topics/:id` | Sửa topic |
| DELETE | `/topics/:id` | Xóa topic (cascade lessons) |
| PATCH | `/classrooms/:id/topics/reorder` | Sắp xếp lại |

**Input (Create):**

| Field | Type | Required |
|-------|------|----------|
| title | string | ✅ |
| description | string | ❌ |
| status | enum | ❌ (default 'draft') |

**Reorder Input:** `{topic_ids: [uuid, uuid, ...]}`

---

### FR-705: Lesson CRUD

| Field | Value |
|-------|-------|
| **ID** | FR-705 |
| **Title** | CRUD bài học trong chủ đề |
| **Priority** | P0 |
| **User Story** | US-807, US-808 |

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/topics/:id/lessons` | Tạo lesson |
| GET | `/topics/:id/lessons` | Danh sách lessons (ordered) |
| PATCH | `/lessons/:id` | Sửa lesson |
| DELETE | `/lessons/:id` | Xóa lesson |
| PATCH | `/topics/:id/lessons/reorder` | Sắp xếp lại |

**Input (Create):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✅ | — |
| content | string | ❌ | Rich text / Markdown / mô tả hướng dẫn (upload mode) |
| content_type | enum | ❌ | text / video / passage / prompt (default 'text') |
| linked_entity_id | uuid | ❌ | ID passage/prompt liên kết (library mode) |
| attachment_url | string | ❌ | URL tài liệu bên ngoài (PDF, Google Docs — upload mode) |
| status | enum | ❌ | draft / published (default 'draft') |

**Content Linking (passage/prompt types):**
- **Library mode:** Instructor chọn từ thư viện → lưu `linked_entity_id`. Student click lesson → mở practice page tương ứng.
- **Upload mode:** Instructor chọn file từ device (POST `/api/uploads` → multer → `attachment_url`) HOẶC dán URL tài liệu. Optional: viết mô tả → lưu `content`. Student click → mở URL.
- Validation: khi `content_type` là `passage`/`prompt`, phải có `linked_entity_id` (library) HOẶC `attachment_url` (upload).

---

### FR-706: Content Status Toggle

| Field | Value |
|-------|-------|
| **ID** | FR-706 |
| **Title** | Bật/tắt trạng thái publish/draft cho Topics và Lessons |
| **Priority** | P0 |
| **User Story** | US-806, US-807 |

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/classrooms/topics/:topicId/toggle-status` | Toggle trạng thái topic |
| PATCH | `/classrooms/lessons/:lessonId/toggle-status` | Toggle trạng thái lesson |

**Business Rules:**
- Chỉ classroom owner hoặc admin mới thực hiện được.
- Toggle giữa `draft` ↔ `published`.
- Student chỉ xem content có status='published' (CR-007).

---

### FR-707: Video Embed trong Lesson

| Field | Value |
|-------|-------|
| **ID** | FR-707 |
| **Title** | Hỗ trợ nhúng video YouTube/Vimeo trong bài học |
| **Priority** | P1 |
| **User Story** | US-807 |

**Mô tả:**
Khi lesson có `content_type = 'video'`, frontend tự động phân tích URL trong `content` field:
- YouTube: detect `youtube.com/watch?v=`, `youtu.be/`, hoặc `youtube.com/embed/` → extract video ID → render `<iframe>` embed.
- Vimeo: detect `vimeo.com/<id>` → render Vimeo embed.
- URL không hợp lệ → hiển thị thông báo lỗi.

**Enforcement Point:** Frontend renderer, không cần backend thay đổi.

---

### FR-708: Library Content Linking

| Field | Value |
|-------|-------|
| **ID** | FR-708 |
| **Title** | Liên kết lesson với Passage/Prompt từ thư viện |
| **Priority** | P1 |
| **User Story** | US-808 |

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classrooms/library/passages` | Danh sách passages đã published |
| GET | `/classrooms/library/prompts` | Danh sách prompts đã published |

**Mô tả:**
Khi tạo/sửa lesson với `content_type` là `passage` hoặc `prompt`, instructor chọn từ dropdown searchable thay vì nhập UUID thủ công. Frontend fetch danh sách từ library endpoints.

---

### FR-709: Classroom Announcements

| Field | Value |
|-------|-------|
| **ID** | FR-709 |
| **Title** | Hệ thống thông báo lớp học |
| **Priority** | P1 |

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classrooms/:id/announcements` | Lấy danh sách thông báo (20 gần nhất) |
| POST | `/classrooms/:id/announcements` | Tạo thông báo mới |
| DELETE | `/classrooms/:id/announcements/:annId` | Xóa thông báo |

**Input (Create):**

| Field | Type | Required |
|-------|------|----------|
| message | string | ✅ |

**Business Rules:**
- Chỉ classroom owner mới tạo và xóa thông báo.
- Tất cả members đều xem được thông báo.
- Hiển thị tên tác giả và thời gian.

---

### FR-710: Duplicate Topic/Lesson

| Field | Value |
|-------|-------|
| **ID** | FR-710 |
| **Title** | Nhân bản Topic hoặc Lesson |
| **Priority** | P1 |

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/classrooms/topics/:topicId/duplicate` | Nhân bản topic + tất cả lessons |
| POST | `/classrooms/lessons/:lessonId/duplicate` | Nhân bản lesson riêng lẻ |

**Business Rules:**
- Bản sao có title thêm " (Copy)" và status mặc định là `draft`.
- Duplicate topic sẽ cascade duplicate tất cả lessons bên trong.
- Chỉ classroom owner thực hiện được.

---

### FR-711: Student Progress Tracking

| Field | Value |
|-------|-------|
| **ID** | FR-711 |
| **Title** | Theo dõi tiến độ học viên trong lớp |
| **Priority** | P1 |
| **User Story** | US-810 |

**Endpoint:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classrooms/:id/progress` | Tiến độ tất cả students trong lớp |

**Output:**
Mảng objects, mỗi student chứa:
- `display_name`, `email`, `joined_at`
- `reading_count`, `reading_avg` (điểm trung bình reading submissions)
- `writing_count`, `writing_avg` (điểm trung bình writing overall)
- `recent_reading[]`, `recent_writing[]` (3 submissions gần nhất)

---

### FR-712: Instructor Dashboard Stats

| Field | Value |
|-------|-------|
| **ID** | FR-712 |
| **Title** | Thống kê tổng quan cho instructor trên Dashboard |
| **Priority** | P1 |

**Endpoint:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/instructor-stats` | Thống kê instructor |

**Output:**

| Field | Type | Description |
|-------|------|-------------|
| total_classrooms | number | Tổng số lớp instructor đang sở hữu |
| total_students | number | Tổng số học viên (distinct) trong tất cả lớp |
| pending_writing_reviews | number | Số bài writing chưa được review |
| pending_reading_reviews | number | Số bài reading chưa được review |

---

### FR-713: Instructor Writing Review

| Field | Value |
|-------|-------|
| **ID** | FR-713 |
| **Title** | Instructor review và override điểm Writing submission |
| **Priority** | P0 |
| **User Story** | US-701, US-702 |

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/instructor/writing-submissions` | Danh sách bài writing submissions |
| GET | `/instructor/writing-submissions/:id` | Chi tiết submission + AI scores |
| PATCH | `/instructor/writing-submissions/:id/review` | Override score + comment |

**Input (Review):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| instructor_override_score | float | ❌ | 0–9 (0.5 increments) |
| instructor_comment | string | ❌ | Nhận xét của instructor |

**Business Rules:**
- Chỉ instructor hoặc admin mới thực hiện được.
- AI score gốc vẫn giữ nguyên, hiển thị cùng override score.
- Lưu tự động: `reviewed_by`, `reviewed_at`.
- Learner thấy cả AI score + instructor override + comment.

---

### FR-714: File Upload

| Field | Value |
|-------|-------|
| **ID** | FR-714 |
| **Title** | Upload file đính kèm cho lesson |
| **Priority** | P0 |

**Mô tả:**
Instructor upload file (ảnh, PDF, DOCX) qua API. Backend lưu file vào thư mục `uploads/`, trả về URL đầy đủ. Hỗ trợ các định dạng: JPEG, PNG, WEBP, GIF, PDF, DOC, DOCX.

**Endpoint:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/uploads` | Upload file (multipart/form-data) |

**Input:** `file` (multipart field)

**Output (200):**

| Field | Type | Description |
|-------|------|-------------|
| url | string | Full URL của file đã upload (e.g. `http://localhost:3001/uploads/xxx.png`) |
| filename | string | Tên file gốc |
| htmlContent | string | HTML render nội dung (cho DOCX → HTML via mammoth; cho ảnh → `<img>` tag) |

**Business Rules:**
- File size tối đa: 10MB (Multer config)
- Chỉ authenticated user mới upload được
- UUID prefix cho filename để tránh trùng

---

### FR-715: Lesson Submission (Student Essay)

| Field | Value |
|-------|-------|
| **ID** | FR-715 |
| **Title** | Nộp bài viết trong lesson cho giáo viên chấm |
| **Priority** | P0 |

**Mô tả:**
Learner viết essay trong textarea trên lesson detail page và submit cho giáo viên chấm. Giáo viên kiểm soát loại nộp bài qua 2 toggles khi tạo lesson: `allow_submit` (nộp cho giáo viên) và `allow_checkscore` (AI chấm — coming soon).

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/lessons/:id/submissions` | Learner nộp essay |
| GET | `/lessons/:id/submissions` | Danh sách submissions (cho teacher) |

**Input (POST):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | ✅ | Nội dung essay |

**Output (201):**

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Submission ID |
| lesson_id | uuid | — |
| user_id | uuid | — |
| content | string | — |
| word_count | int | Auto-calculated |
| status | string | 'submitted' |
| created_at | timestamp | — |

**Business Rules:**
- Chỉ submit được khi lesson có `allow_submit = true`
- Content không được rỗng
- `word_count` tự tính từ `content`
- Learner có thể nộp nhiều lần
- Teacher xem submissions qua GET endpoint (kèm thông tin user)

---
> **Tham chiếu:** [04_user_stories](04_user_stories.md) | [06_acceptance_criteria](06_acceptance_criteria.md) | [09_api_specifications](09_api_specifications.md) | [11_business_rules](11_business_rules.md)

---

### FR-716: DOCX Auto-Parser (Reading Import)

| Field | Value |
|-------|-------|
| **ID** | FR-716 |
| **Title** | Import DOCX và auto-parse passage + questions bằng AI |
| **Priority** | P0 |
| **User Story** | US-820 |

**Mô tả:**
Admin/Instructor upload file `.docx`. Backend dùng `mammoth` convert sang HTML, gửi vào LLM (Gemini Flash) để trích xuất passage và question groups dưới dạng JSON. Frontend hiển thị preview 2 cột trước khi save.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/reading/parse-docx` | Upload DOCX, trả parsed JSON (passage + questions) |
| POST | `/admin/passages/import` | Save parsed JSON vào DB (passage + nested questions) |
| POST | `/instructor/passages/import` | Tương tự admin, cho instructor |

**Input (parse-docx):** `file` (multipart DOCX)

**Output (parse-docx, 200):**

| Field | Type | Description |
|-------|------|-------------|
| passage | string | HTML body của passage |
| question_groups | array | `[{type, prompt, questions: [{prompt, options?, answer_key, explanation?}]}]` |

**Supported Question Types:**
`matching_headings`, `true_false_notgiven`, `yes_no_notgiven`, `mcq`, `matching_information`, `matching_features`, `matching_sentence_endings`, `sentence_completion`, `summary_completion`, `table_completion`, `flowchart_completion`, `diagram_label_completion`, `short`

---

### FR-717: Student Passage Preview in Classroom

| Field | Value |
|-------|-------|
| **ID** | FR-717 |
| **Title** | Preview bài đọc cho học sinh trong Classroom |
| **Priority** | P0 |
| **User Story** | US-823 |

**Mô tả:**
Khi `ClassroomService.findOne()` trả dữ liệu lớp học, nếu lesson có `content_type='passage'` và `linked_entity_id`, hệ thống tự động query và attach `linked_passage` (title, body) vào response. Frontend hiển thị preview với faded gradient (`max-h-60`, `overflow-hidden`, gradient overlay).

**Output (trong Classroom detail response):**
Mỗi lesson object có thêm:

| Field | Type | Description |
|-------|------|-------------|
| linked_passage | object? | `{id, title, body}` — chỉ có nếu content_type='passage' và linked_entity_id tồn tại |

---

### FR-718: Instructor Content CRUD (Passages & Prompts)

| Field | Value |
|-------|-------|
| **ID** | FR-718 |
| **Title** | Instructor tạo/xem/sửa/xóa passages và prompts |
| **Priority** | P0 |
| **User Story** | US-821, US-822 |
| **Business Rules** | CR-015 |

**Mô tả:**
Instructor có đầy đủ chức năng CRUD passages và prompts như Admin, nhưng chịu ràng buộc **ownership**: chỉ sửa/xóa nội dung mình tạo. Admin bypass được ràng buộc này.

**Endpoints (Passages):**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/instructor/passages` | List tất cả passages |
| GET | `/instructor/passages/:id` | Chi tiết passage |
| POST | `/instructor/passages` | Tạo passage |
| POST | `/instructor/passages/import` | Import từ DOCX |
| PATCH | `/instructor/passages/:id` | Sửa passage (owner only) |
| DELETE | `/instructor/passages/:id` | Xóa passage (owner only) |

**Endpoints (Prompts):**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/instructor/prompts` | List tất cả prompts |
| GET | `/instructor/prompts/:id` | Chi tiết prompt |
| POST | `/instructor/prompts` | Tạo prompt |
| PATCH | `/instructor/prompts/:id` | Sửa prompt (owner only) |
| DELETE | `/instructor/prompts/:id` | Xóa prompt (owner only) |

**Access Control (CR-015):**
- PATCH/DELETE kiểm tra `entity.created_by === req.user.sub`.
- Nếu user role = `admin` → bypass.
- Vi phạm → `403 Forbidden: "You can only edit/delete your own content"`.

