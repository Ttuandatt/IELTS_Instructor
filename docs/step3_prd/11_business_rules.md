# 📏 Business Rules — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-11  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [05_functional_requirements](05_functional_requirements.md) | [06_acceptance_criteria](06_acceptance_criteria.md)

---

## 1. Reading Domain (RD)

### RD-001 — Minimum Answer Threshold

| Attribute | Detail |
|-----------|--------|
| **ID** | RD-001 |
| **Title** | Minimum answer threshold for Reading submission |
| **Description** | Learner must answer ≥ 80% of questions in a passage before the system accepts the submission. Partial submissions below this threshold are **rejected** with a descriptive error. |
| **Enforcement Point** | `POST /reading/passages/:id/submit` — request validation |
| **Validation Logic** | `answers.length / total_questions >= 0.8` |
| **Error Response** | `400 BAD_REQUEST` — `"You must answer at least {threshold} of {total} questions before submitting. Currently answered: {count}."` |
| **FR Ref** | FR-203 |
| **AC Ref** | AC-203, Scenario 2 |
| **Test Scenario** | Submit with 8/13 answers (61.5%) → 400; submit with 11/13 (84.6%) → 200 |

---

### RD-002 — Auto-Grading Logic

| Attribute | Detail |
|-----------|--------|
| **ID** | RD-002 |
| **Title** | Automatic grading for Reading answers |
| **Description** | System auto-grades each answer immediately upon submission. MCQ answers are compared directly against `answer_key`. Short answers are matched using **case-insensitive, trimmed, keyword-based** comparison. |
| **MCQ Logic** | `user_answer.trim().toUpperCase() === answer_key` |
| **Short Answer Logic** | `answer_key` is an array of acceptable keywords. Match if `answer_key.some(k => normalize(user_answer).includes(normalize(k)))` where `normalize = trim + lowercase + collapse whitespace`. |
| **Edge Cases** | Empty answer string → marked incorrect. Extra whitespace → trimmed before comparison. |
| **Enforcement Point** | Backend grading service (synchronous, within submit handler) |
| **FR Ref** | FR-203 |
| **Test Scenario** | MCQ: user "b" vs key "B" → correct. Short: user "Carbon Dioxide " vs key ["carbon dioxide", "CO2"] → correct. |

---

### RD-003 — Timer Auto-Submit

| Attribute | Detail |
|-----------|--------|
| **ID** | RD-003 |
| **Title** | Timer expiry triggers automatic submission |
| **Description** | When the countdown timer reaches zero, the frontend **automatically submits** all currently answered questions. The submission is flagged `timed_out: true`. Unanswered questions are **not** submitted — only answered questions are included. If answered count < 80% threshold, submission is **still accepted** because it was system-initiated. |
| **Override** | Timer-triggered submissions bypass the 80% threshold rule (RD-001). |
| **Enforcement Point** | Frontend timer component → auto-invoke submit API with `timed_out: true` |
| **Backend Logic** | When `timed_out === true`, skip 80% validation. Grade whatever answers are provided. |
| **FR Ref** | FR-203 |
| **Test Scenario** | Timer expires with 5/13 answered → submit accepted, score based on 5 answers, `timed_out: true` |

---

### RD-004 — Attempt History Preservation

| Attribute | Detail |
|-----------|--------|
| **ID** | RD-004 |
| **Title** | Preserve and display Reading attempt history |
| **Description** | Every submission creates a new `submissions_reading` row (never updates previous). Learners can view all past attempts for any passage, with scores and dates. |
| **Retention** | 12 months (see Data Retention policy in PRD-08) |
| **Enforcement Point** | Backend: INSERT only, no UPDATE on submissions. Frontend: history page with pagination. |
| **FR Ref** | FR-204 |
| **Test Scenario** | Submit same passage twice → two distinct submissions with different `id`, `score_pct`, `completed_at` |

---

### RD-005 — Mode Selection Required (IOT-inspired)

| Attribute | Detail |
|-----------|--------|
| **ID** | RD-005 |
| **Title** | Mode selection required before starting a Reading test |
| **Description** | Before starting a Reading passage, learner must choose between **Practice mode** (no timer, choose parts, pause/resume) and **Simulation mode** (60 min standard timer, full test, no pause, auto-submit on expiry). The selected mode is stored as `test_mode` in the submission record. |
| **Enforcement Point** | Frontend: Mode Selector modal (S22). Backend: `test_mode` field in `submissions_reading`. |
| **FR Ref** | FR-203 |
| **Test Scenario** | Click passage card → Mode Selector modal appears → choose Practice → no timer → `test_mode='practice'`. Choose Simulation → 60 min timer starts → `test_mode='simulation'`. |

---

### RD-006 — Simulation Mode Timer Rules

| Attribute | Detail |
|-----------|--------|
| **ID** | RD-006 |
| **Title** | Simulation mode enforces IELTS-standard timer |
| **Description** | In Simulation mode: 60-minute countdown for Reading, no pause allowed, auto-submit on timer expiry, late submissions rejected (backend validates `duration_sec ≤ timer_duration + grace_period`). |
| **Grace Period** | 5 seconds (account for network latency) |
| **Enforcement Point** | Frontend: Timer component with no pause button in Simulation. Backend: reject if `test_mode='simulation' AND duration_sec > 3605`. |
| **FR Ref** | FR-203, RD-003 |
| **Test Scenario** | Simulation mode → 60 min timer starts → timer reaches 0 → auto-submit → timed_out=true, test_mode=simulation |

---

## 2. Writing Domain (WR)

### WR-001 — Word Count Warning

| Attribute | Detail |
|-----------|--------|
| **ID** | WR-001 |
| **Title** | Word count check — warn but allow submission |
| **Description** | System counts words in essay (`content.trim().split(/\s+/).length`). If word count < prompt's `min_words`, a **warning** is displayed but submission is **still accepted**. The feedback may note insufficient length. |
| **Frontend** | Live word counter below editor; turns **red** when < min_words; tooltip: "Recommended minimum: {min_words} words" |
| **Backend** | Recalculate word count server-side; store in `word_count` field; include in scoring prompt context |
| **Enforcement Point** | Frontend: visual warning. Backend: store actual count; pass to LLM. |
| **FR Ref** | FR-302 |
| **Test Scenario** | Submit essay with 120 words (min=250) → accepted with warning; feedback mentions "essay is significantly below recommended length" |

---

### WR-002 — Hybrid Scoring Pipeline

| Attribute | Detail |
|-----------|--------|
| **ID** | WR-002 |
| **Title** | Hybrid rule-based + LLM scoring for Writing |
| **Description** | Scoring follows a 2-stage pipeline: (1) **Rule checks** — validate word count, detect copy-paste of prompt, basic structure analysis. (2) **LLM rubric scoring** — call model with rubric prompt requesting scores for TR, CC, LR, GRA (each 0–9 in 0.5 increments) plus feedback JSON. |
| **Rule Check Stage** | Checks: word count flag, prompt plagiarism (>60% overlap → flag), paragraph count (≥3 recommended). Results passed as context to LLM. |
| **LLM Stage** | System prompt includes IELTS band descriptors. Response must be valid JSON: `{TR, CC, LR, GRA, overall, summary, strengths[], improvements[]}`. JSON schema validated; if invalid → retry once with "Please respond with valid JSON only". |
| **Overall Calculation** | `overall = round((TR + CC + LR + GRA) / 4, 1)` — rounded to nearest 0.5 (IELTS standard: 5.75 → 6.0, 5.25 → 5.5) |
| **Enforcement Point** | BullMQ worker → scoring service |
| **FR Ref** | FR-302, FR-303 |
| **Test Scenario** | Submit 300-word essay → rule checks pass → LLM returns valid JSON → scores stored → status=done |

---

### WR-003 — Model Tier & Rate Limiting

| Attribute | Detail |
|-----------|--------|
| **ID** | WR-003 |
| **Title** | Model tier selection and daily submission rate limit |
| **Description** | Each submission specifies `model_tier`: **cheap** (default, free) or **premium** (optional, future billing). Rate limit applies per user per calendar day (UTC). When limit exceeded → 429 error. |
| **Cheap Tier Models** | GPT-4o-mini, o3-mini, Gemini 2.0 Flash — selected by config/env |
| **Premium Tier Models** | GPT-4o, Claude 3.5 Sonnet — optional, higher quality |
| **Daily Limit** | 5–10 per user per day (configurable via env `WRITING_DAILY_LIMIT`) |
| **Token Caps** | `max_tokens`: 600 (cheap), 900 (premium) for scoring response |
| **Enforcement Point** | Backend middleware: check Redis counter before enqueue. Increment after successful enqueue. |
| **Error Response** | `429 TOO_MANY_REQUESTS` — `"Daily submission limit reached ({limit}). Try again tomorrow."` with header `X-RateLimit-Reset: <UTC timestamp>` |
| **FR Ref** | FR-302 |
| **Test Scenario** | User submits 10 essays (limit=10) → 11th → 429. Midnight UTC → counter resets. |

---

### WR-004 — SLA & Failure Handling

| Attribute | Detail |
|-----------|--------|
| **ID** | WR-004 |
| **Title** | Scoring SLA and failure recovery |
| **Description** | Target: 90% of scoring jobs complete within 5 minutes wall time. Queue job timeout: 90 seconds. If LLM call fails, retry up to 2 times with exponential backoff (1s, 2s). After all retries fail → set `processing_status=failed` with descriptive `error_message`. |
| **Job Timeout** | 90,000 ms |
| **Max Retries** | 2 (total 3 attempts including initial) |
| **Backoff** | Exponential: 1000ms → 2000ms |
| **DLQ** | Failed jobs moved to Dead Letter Queue for admin review |
| **User Experience** | Frontend polls every 3s; after 5 min shows "Scoring is taking longer than expected"; after failure shows "Scoring failed. Please try again." with retry button |
| **Enforcement Point** | BullMQ configuration |
| **FR Ref** | FR-302, FR-303 |
| **Test Scenario** | Mock LLM timeout → 2 retries → failure → status=failed, error_message set. DLQ entry created. |

---

### WR-005 — Scoring Traceability

| Attribute | Detail |
|-----------|--------|
| **ID** | WR-005 |
| **Title** | Full traceability for every scored submission |
| **Description** | Every writing submission stores complete scoring metadata for audit, analysis, and model comparison. Fields: `scores`, `feedback`, `model_tier`, `model_name`, `turnaround_ms`, `created_at`, `scored_at`. |
| **Stored Fields** | scores (JSONB with TR/CC/LR/GRA/overall), feedback (JSONB with summary/strengths/improvements), model_tier, model_name (exact model used), turnaround_ms (time from enqueue to completion) |
| **Enforcement Point** | Worker: record all fields after scoring completes |
| **FR Ref** | FR-303 |
| **Test Scenario** | After scoring → verify all metadata fields populated; verify `turnaround_ms = scored_at - created_at` (in ms) |

---

### WR-006 — Instructor Score Override

| Attribute | Detail |
|-----------|--------|
| **ID** | WR-006 |
| **Title** | Instructor can override AI score and add comment |
| **Description** | Instructor can review any learner's writing submission, add a comment, and optionally override the AI-generated score with a manual score (0–9 in 0.5 increments). The original AI score is **preserved** alongside the override. |
| **Fields** | `instructor_comment` (text), `instructor_override_score` (decimal 0–9), `reviewed_by` (FK users), `reviewed_at` (timestamp) |
| **Enforcement Point** | `PATCH /instructor/writing-submissions/:id/review` — instructor role required |
| **FR Ref** | Sprint 5 |
| **Test Scenario** | Instructor sets override_score=7.0, comment="Well structured" → submission updated → both AI scores and override visible |

---

### WR-007 — Feedback Schema Validation (IOT-inspired)

| Attribute | Detail |
|-----------|--------|
| **ID** | WR-007 |
| **Title** | LLM feedback must conform to required schema |
| **Description** | LLM response must include: TR, CC, LR, GRA scores (each 0–9, 0.5 increments), overall score, summary text, strengths array, improvements array, and suggestions text. Response is validated against JSON schema; if invalid, retry once with schema-only prompt. |
| **Required Shape** | `{TR, CC, LR, GRA, overall, summary, strengths[], improvements[], suggestions}` |
| **Enforcement Point** | BullMQ worker: JSON schema validation after LLM response |
| **FR Ref** | FR-302, FR-303 |
| **Test Scenario** | LLM returns missing `suggestions` field → validation fails → retry with explicit schema → valid response stored |

---

## 3. Admin/Content Domain (ADM)

### ADM-001 — Content Visibility Control

| Attribute | Detail |
|-----------|--------|
| **ID** | ADM-001 |
| **Title** | Draft content hidden from learners |
| **Description** | Content (passages, prompts) with `status='draft'` is **invisible** to learners in all API responses. Only admin users can see drafts via admin endpoints. Publishing sets `status='published'`; unpublishing reverts to `draft`. |
| **Enforcement Point** | Learner-facing endpoints: `WHERE status = 'published'` filter. Admin endpoints: return all regardless of status. |
| **FR Ref** | FR-501, FR-502 |
| **Test Scenario** | Create passage (status=draft) → learner GET /reading/passages → not in list. Admin publishes → learner sees it. |

---

### ADM-002 — Source Reference Requirement

| Attribute | Detail |
|-----------|--------|
| **ID** | ADM-002 |
| **Title** | NotebookLM-imported content must reference source |
| **Description** | When content (passage or prompt) is created from an imported source, it **must** have at least one entry in `source_ids[]`. This ensures content provenance and traceability. Manually created content may have empty `source_ids`. |
| **Enforcement Point** | Admin import flow → validate `source_ids.length > 0` for auto-generated content |
| **FR Ref** | FR-601, FR-602 |
| **Test Scenario** | Import passage from NotebookLM with no source attached → validation error. Import with source → success. |

---

### ADM-003 — Content Versioning

| Attribute | Detail |
|-----------|--------|
| **ID** | ADM-003 |
| **Title** | Track content changes with version history |
| **Description** | Every create, update, publish, or unpublish action records a new row in `content_versions` with incrementing version number, editor_id, action type, and optional diff_summary. |
| **Version Actions** | `create`, `update`, `publish`, `unpublish`, `delete` |
| **Enforcement Point** | Backend: service-level middleware after any content mutation |
| **FR Ref** | FR-501, FR-502 |
| **Test Scenario** | Create passage → v1 (action=create). Update title → v2 (action=update). Publish → v3 (action=publish). |

---

## 4. System/Sync Domain (SY)

### SY-001 — NotebookLM Cache Policy

| Attribute | Detail |
|-----------|--------|
| **ID** | SY-001 |
| **Title** | Cache imported NotebookLM data in Redis |
| **Description** | When admin imports from NotebookLM URL, the fetched data is cached in Redis with a TTL of 15–60 minutes (configurable via `NOTEBOOKLM_CACHE_TTL`). Subsequent imports of the same URL within TTL return cached data. |
| **Key Format** | `notebooklm:source:{urlHash}` |
| **TTL** | 15–60 minutes (default: 30 min) |
| **Enforcement Point** | Import service: check Redis before fetching |
| **FR Ref** | FR-601 |

---

### SY-002 — Import Sanitization

| Attribute | Detail |
|-----------|--------|
| **ID** | SY-002 |
| **Title** | Sanitize imported content |
| **Description** | All HTML from NotebookLM is sanitized to plain text or safe Markdown. Script tags, iframes, and event handlers are stripped. URLs are preserved for reference. |
| **Sanitization Steps** | 1. Strip all `<script>`, `<iframe>`, `<object>` tags. 2. Remove `on*` event attributes. 3. Convert remaining HTML to plain text (preserve paragraphs). 4. Store original URL for reference. |
| **Enforcement Point** | Import service → sanitization utility |
| **FR Ref** | FR-601 |

---

### SY-003 — Import Audit Trail

| Attribute | Detail |
|-----------|--------|
| **ID** | SY-003 |
| **Title** | Log admin identity for every import action |
| **Description** | Every import from NotebookLM records the admin's `user_id`, the source URL, timestamp, and outcome (success/error). Stored in `sources.imported_by` field. |
| **Enforcement Point** | Import service: set `imported_by = currentUser.id` |
| **FR Ref** | FR-601 |

---

## 4.5 Classroom Domain (CR)

### CR-001 — Only Instructor/Admin Can Create Classroom

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-001 |
| **Title** | Chỉ instructor hoặc admin mới tạo được classroom |
| **Description** | User với role `learner` không được phép tạo classroom. Backend guard kiểm tra role trước khi thực thi. |
| **Enforcement Point** | `POST /classrooms` — role guard |
| **Error Response** | `403 Forbidden` |
| **FR Ref** | FR-701 |

---

### CR-002 — Owner-only Management

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-002 |
| **Title** | Chỉ owner (người tạo) mới sửa/xóa/quản lý classroom |
| **Description** | `classrooms.owner_id` xác định instructor sở hữu lớp. Chỉ owner hoặc admin mới được PATCH/DELETE classroom, CRUD topics/lessons, và add/remove members. |
| **Enforcement Point** | Middleware ownership check trên mọi mutation endpoint |
| **FR Ref** | FR-701, FR-702, FR-704, FR-705 |

---

### CR-003 — Unique Invite Code

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-003 |
| **Title** | invite_code phải unique, 8 ký tự alphanumeric |
| **Description** | Khi tạo classroom, hệ thống tự sinh invite_code ngẫu nhiên (8-char, A-Z0-9). Nếu trùng → retry. Có thể regenerate để vô hiệu hóa code cũ. |
| **Enforcement Point** | Backend: classroom creation service + regenerate endpoint |
| **FR Ref** | FR-701, FR-703 |

---

### CR-004 — Max Members Limit

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-004 |
| **Title** | Giới hạn số thành viên trong classroom |
| **Description** | Mỗi classroom có `max_members` (default 50). Khi join hoặc add member, nếu `current_count >= max_members` → reject. |
| **Enforcement Point** | `POST /classrooms/:id/members`, `POST /classrooms/join` |
| **Error Response** | `403 Forbidden` — "Classroom is full" |
| **FR Ref** | FR-702, FR-703 |

---

### CR-005 — No Duplicate Membership

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-005 |
| **Title** | Learner không thể join lớp 2 lần |
| **Description** | UNIQUE constraint trên `(classroom_id, user_id)` trong `classroom_members`. Nếu đã là member → reject. |
| **Enforcement Point** | Database constraint + application check |
| **Error Response** | `409 Conflict` — "Already a member" |
| **FR Ref** | FR-702, FR-703 |

---

### CR-006 — Owner-only CRUD for Topics/Lessons

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-006 |
| **Title** | Chỉ classroom owner được CRUD topics/lessons trong lớp đó |
| **Description** | Trước khi thực hiện mutation trên topic/lesson, hệ thống kiểm tra topic.classroom.owner_id === currentUser.id (hoặc user là admin). |
| **Enforcement Point** | Backend middleware: resolve classroom from topic/lesson → check ownership |
| **FR Ref** | FR-704, FR-705 |

---

### CR-008 — Announcement Ownership

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-008 |
| **Title** | Chỉ classroom owner mới tạo/xóa announcements |
| **Description** | Chỉ classroom owner (instructor) hoặc admin mới có quyền tạo và xóa thông báo. Tất cả members (kể cả student) đều được xem danh sách thông báo. |
| **Enforcement Point** | Backend: checkOwnership trước khi create/delete |
| **FR Ref** | FR-709 |

---

### CR-009 — Duplicate Creates Draft Copy

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-009 |
| **Title** | Bản sao luôn có status draft và title gắn thêm "(Copy)" |
| **Description** | Khi duplicate topic hoặc lesson, bản sao mới luôn có `status='draft'` và `title` gốc + " (Copy)". Duplicate topic sẽ cascade duplicate toàn bộ lessons bên trong. |
| **Enforcement Point** | Backend: ClassroomService.duplicateTopic / duplicateLesson |
| **FR Ref** | FR-710 |

---

### CR-010 — Progress Tracking Access Control

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-010 |
| **Title** | Chỉ classroom owner xem được student progress |
| **Description** | Endpoint `/classrooms/:id/progress` chỉ trả dữ liệu cho classroom owner hoặc admin. Student không có quyền truy cập. |
| **Enforcement Point** | Backend: checkOwnership guard |
| **FR Ref** | FR-711 |

---

### CR-011 — Video Embed Security

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-011 |
| **Title** | Video embed chỉ hỗ trợ YouTube và Vimeo |
| **Description** | Frontend chỉ render iframe embed cho URLs từ YouTube (`youtube.com`, `youtu.be`) và Vimeo (`vimeo.com`). Tất cả URL khác hiển thị thông báo "URL không hợp lệ" để tránh XSS/injection. |
| **Enforcement Point** | Frontend: regex validation trước khi render iframe |
| **FR Ref** | FR-707 |

---

### CR-012 — Instructor Stats Scope

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-012 |
| **Title** | Instructor stats chỉ tính từ classrooms mà instructor sở hữu |
| **Description** | Endpoint `/dashboard/instructor-stats` chỉ tính classrooms có `owner_id = req.user.sub`. `total_students` = distinct students across owned classrooms. `pending_writing_reviews` = writing submissions chưa có instructor_override_score. |
| **Enforcement Point** | Backend: DashboardService.getInstructorStats |
| **FR Ref** | FR-712 |

---

### CR-013 — Lesson Submission Access Control

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-013 |
| **Title** | Learner chỉ submit bài khi lesson có allow_submit = true |
| **Description** | Khi `POST /lessons/:id/submissions`, backend kiểm tra `lesson.allow_submit`. Nếu `false` → reject 403. Content không được rỗng. `word_count` tự tính server-side. Learner có thể submit nhiều lần. Teacher xem tất cả submissions qua `GET /lessons/:id/submissions`. |
| **Enforcement Point** | Backend: LessonController.submitEssay |
| **Error Response** | `403 Forbidden` — "Submissions are not enabled for this lesson" |
| **FR Ref** | FR-715 |

---

### CR-014 — File Upload Validation

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-014 |
| **Title** | File upload phải qua validation (type + size) |
| **Description** | `POST /api/uploads` chỉ chấp nhận file có extension trong whitelist (.png, .jpg, .jpeg, .webp, .pdf, .doc, .docx, .txt). File size max 10MB. UUID prefix cho filename để tránh trùng. DOCX chuyển HTML qua mammoth. |
| **Enforcement Point** | Backend: Multer fileFilter + limits config |
| **Error Response** | `400 Bad Request` — "File type {ext} not allowed" hoặc "File too large" |
| **FR Ref** | FR-714 |

---

### CR-015 — Content Ownership Access Control

| Attribute | Detail |
|-----------|--------|
| **ID** | CR-015 |
| **Title** | Chỉ owner mới sửa/xóa passages và prompts; Admin bypass |
| **Description** | Khi Instructor gọi `PATCH` hoặc `DELETE` trên passage/prompt, backend kiểm tra `entity.created_by === req.user.sub`. Nếu không khớp và role không phải `admin` → trả 403. Admin luôn được phép (bypass ownership check). Tất cả user đều xem được (GET) bất kể ai tạo. Frontend: nút Edit/Delete chỉ hiện với owner hoặc admin. |
| **Enforcement Point** | `AdminService.updatePassage`, `deletePassage`, `updatePrompt`, `deletePrompt` |
| **Error Response** | `403 Forbidden` — "You can only edit/delete your own passages/prompts" |
| **FR Ref** | FR-718 |
| **Test Scenario** | Instructor A tạo passage → Instructor B gọi `PATCH /instructor/passages/:id` → 403. Admin gọi `PATCH` → 200. |

---

## 5. Rule Enforcement Map

| API Endpoint | Rules Enforced |
|-------------|----------------|
| `POST /auth/register` | Email uniqueness, password complexity |
| `POST /auth/login` | Credential validation, rate-limit per IP |
| `POST /reading/passages/:id/submit` | RD-001, RD-002, RD-003, RD-005, RD-006 |
| `GET /reading/passages` | ADM-001 (filter published only) |
| `POST /writing/prompts/:id/submit` | WR-001, WR-002, WR-003, WR-004, WR-007 |
| `GET /writing/prompts` | ADM-001 (filter published only) |
| `PATCH /instructor/writing-submissions/:id/review` | WR-006 |
| `POST /admin/passages` | ADM-002 (if imported), ADM-003 (version) |
| `PATCH /admin/passages/:id` | ADM-003 (version) |
| `POST /admin/content/:type/:id/publish` | ADM-001, ADM-003 |
| `POST /admin/sources/import` | SY-001, SY-002, SY-003 |
| BullMQ worker (writing scoring) | WR-002, WR-004, WR-005 |
| `POST /classrooms` | CR-001 |
| `PATCH /classrooms/:id` | CR-002 |
| `POST /classrooms/:id/members` | CR-002, CR-004, CR-005 |
| `POST /classrooms/join` | CR-004, CR-005 |
| `POST /classrooms/:id/topics` | CR-002, CR-006 |
| `GET /classrooms/:id/topics` | CR-007 |
| `POST /topics/:id/lessons` | CR-006 |
| `GET /topics/:id/lessons` | CR-007 |
| `PATCH /classrooms/topics/:topicId/toggle-status` | CR-002, CR-006, CR-007 |
| `PATCH /classrooms/lessons/:lessonId/toggle-status` | CR-002, CR-006, CR-007 |
| `POST /classrooms/topics/:topicId/duplicate` | CR-002, CR-006, CR-009 |
| `POST /classrooms/lessons/:lessonId/duplicate` | CR-002, CR-006, CR-009 |
| `GET /classrooms/:id/announcements` | Any member |
| `POST /classrooms/:id/announcements` | CR-008 |
| `DELETE /classrooms/:id/announcements/:annId` | CR-008 |
| `GET /classrooms/:id/progress` | CR-010 |
| `GET /dashboard/instructor-stats` | CR-012 |
| `POST /uploads` | CR-014 |
| `POST /lessons/:id/submissions` | CR-013 |
| `GET /lessons/:id/submissions` | CR-002 (owner) |
| `GET /lessons/:id/my-submissions` | Authenticated user |
| `POST /reading/parse-docx` | Authenticated (instructor/admin) |
| `POST /instructor/passages/import` | CR-015 (instructor role) |
| `PATCH /instructor/passages/:id` | CR-015 (owner only) |
| `DELETE /instructor/passages/:id` | CR-015 (owner only) |
| `PATCH /instructor/prompts/:id` | CR-015 (owner only) |
| `DELETE /instructor/prompts/:id` | CR-015 (owner only) |

---

> **Tham chiếu:** [05_functional_requirements](05_functional_requirements.md) | [06_acceptance_criteria](06_acceptance_criteria.md) | [08_data_requirements](08_data_requirements.md)
