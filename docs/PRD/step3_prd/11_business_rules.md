# Business Rules
## Dự án Langy — IELTS Domain-specific Rules

> **Phiên bản:** 1.0
> **Ngày tạo:** 06/07/2026
> **Quy ước ID:** BR-[###]

---

## 1. IELTS Writing Scoring Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-001 | Writing được chấm theo 4 tiêu chí: Task Response (TR), Coherence & Cohesion (CC), Lexical Resource (LR), Grammatical Range & Accuracy (GRA) | AI prompt + schema validator |
| BR-002 | Mỗi tiêu chí cho band từ 0 đến 9, bước nhảy 0.5 (0, 0.5, 1.0, ..., 8.5, 9.0) | Schema validator: reject nếu ngoài range hoặc không chia hết cho 0.5 |
| BR-003 | Band tổng = trung bình cộng 4 tiêu chí, làm tròn đến 0.5 gần nhất | Tính server-side, không để AI tự tính (giảm sai số) |
| BR-004 | Band AI luôn hiển thị nhãn "ước lượng" — KHÔNG BAO GIỜ hiển thị như điểm chính thức | UI enforced (D3) |
| BR-005 | Điểm GV chốt (finalized) là điểm cuối cùng — ghi đè band AI trong mọi báo cáo/dashboard | Backend logic |
| BR-006 | Task 2: tối thiểu 250 từ; Task 1: tối thiểu 150 từ. Dưới ngưỡng → cảnh báo (không chặn nộp) | Client-side warning + AI nhận diện trong feedback |
| BR-007 | Essay dưới 50 từ không được gửi chấm AI (quá ngắn để đánh giá) | Server-side reject |

## 2. Writing Submission State Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-010 | State machine chuyển trạng thái theo đúng bảng spec M1 Mục 4 — không có đường tắt | Service layer + unit tests |
| BR-011 | `finalized` là trạng thái hút — không thoát ra; bài đã chốt không sửa lại | Backend guard |
| BR-012 | Bài tự học (lesson_id = null) không bao giờ vào `pending_review` hoặc `finalized` | Backend invariant + test |
| BR-013 | Đổi writing_mode của lớp không hồi tố — chỉ áp dụng cho submission mới | Timestamp-based, không batch update cũ |
| BR-014 | Mỗi lần GV điều chỉnh band → hệ thống lưu cặp (scores AI, instructor_scores) tự động | Auto-save on finalize |

## 3. Reading Scoring Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-020 | Điểm Reading = số câu đúng / tổng câu, hiển thị dạng phần trăm | Server-side |
| BR-021 | KHÔNG quy đổi % sang band IELTS (chưa có bảng lookup 40 câu chuẩn) | UI + backend: không có field band Reading |
| BR-022 | Short answer: chấp nhận đáp án case-insensitive, trim whitespace | Backend comparison logic |
| BR-023 | MCQ: đúng hoặc sai, không có điểm thành phần | Binary scoring |

## 4. Classroom & Assignment Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-030 | Mã mời lớp: 6 ký tự, unique, alphanumeric uppercase | Generator + unique constraint |
| BR-031 | Mặc định khi tạo lớp: writing_mode = instant (chế độ A) | Database default |
| BR-032 | Bài nộp sau deadline: chấp nhận + gắn nhãn "trễ"; KHÔNG khóa nộp bài | Tầng đọc so sánh submitted_at vs due_at |
| BR-033 | Một HS có thể thuộc nhiều lớp (nhiều GV khác nhau) | Schema: ClassroomMember many-to-many |
| BR-034 | GV chỉ xem được submission của HS trong lớp mình | Authorization check per-request |

## 5. Import Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-040 | Đề import thuộc sở hữu GV import — không tự động chia sẻ | created_by = GV, visibility = private mặc định |
| BR-041 | GV phải tick checkbox bản quyền trước khi publish | UI mandatory + backend check |
| BR-042 | Import Reading: bắt buộc preview → sửa → publish; không auto-publish | UX flow |
| BR-043 | Đề Cambridge (hoặc nguồn có bản quyền rõ) KHÔNG được seed vào kho đề production | Quy trình review content |

## 6. Privacy & Consent Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-050 | HS dưới 16 tuổi: bắt buộc xác nhận phụ huynh trước khi sử dụng | Age-gate dựa trên năm sinh |
| BR-051 | Essay gửi qua API: KHÔNG chứa bất kỳ thông tin định danh HS | Prompt construction logic |
| BR-052 | Xóa tài khoản: xóa mềm 7 ngày (có thể hủy) → xóa cứng vĩnh viễn | Cron job hoặc scheduled task |
| BR-053 | Chỉ dùng paid tier LLM API cho dữ liệu HS thật | Environment config + startup check |

## 7. Cost Control Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-060 | Tối đa 10 bài Writing/ngày/HS | Redis rate limit per user |
| BR-061 | Context caching cho rubric prompt (phần tĩnh) | LLM client config |
| BR-062 | Log token usage mỗi lượt chấm → tính chi phí thực | WritingSubmission.tokens_input/output |
| BR-063 | Cảnh báo khi chi tiêu API ngày vượt ngưỡng | Threshold config + log alert |

---

# ══════════════════════════════════════════════════════
# NỘI DUNG GỐC TỪ PRD BAN ĐẦU (02/2025)
# Giữ lại để tham chiếu. Khi mâu thuẫn, phần trên ưu tiên.
# ══════════════════════════════════════════════════════

# 📏 Business Rules — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-11  
> **Phiên bản:** 1.1  
> **Ngày tạo:** 2025-02-21  
> **Ngày cập nhật:** 2026-04-13  
> **Trạng thái:** Revised  
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

### WR-008 — Band Consistency Check

| Attribute | Detail |
|-----------|--------|
| **ID** | WR-008 |
| **Title** | Kiểm tra tính hợp lý giữa các criterion scores |
| **Description** | Sau khi LLM trả scores, hệ thống kiểm tra: nếu `max(TR,CC,LR,GRA) - min(TR,CC,LR,GRA) > 3.0`, submission được flag `needs_review`. Trong thực tế IELTS, các criteria hiếm khi chênh hơn 2–3 band. Chênh lệch lớn có thể là dấu hiệu LLM hallucinate. Submission vẫn được lưu với score; metadata flag để instructor ưu tiên review. |
| **Enforcement Point** | `scoring.consumer.ts` — sau khi `validateFeedbackSchema`, trước khi save |
| **Action khi flag** | Vẫn lưu score, set `metadata.needs_review = true`. Instructor UI highlight submission có flag này. |
| **FR Ref** | FR-302, WR-002 |
| **Test Scenario** | LLM trả TR=8, CC=8, LR=4, GRA=8 → diff = 4 > 3 → flag set. TR=6, CC=6.5, LR=5.5, GRA=6 → diff = 1 < 3 → no flag. |

---

### WR-010 — Writing Submit Idempotency

| Attribute | Detail |
|-----------|--------|
| **ID** | WR-010 |
| **Title** | Chống duplicate submission trong 30 giây |
| **Description** | Trước khi tạo `WritingSubmission` mới, hệ thống check: có submission nào cùng `user_id + prompt_id + processing_status='pending' + created_at` trong 30 giây gần nhất không? Nếu có → trả lại submission cũ, KHÔNG tạo mới, KHÔNG enqueue job mới. Tránh double-submit khi user click nút 2 lần hoặc network retry. |
| **Enforcement Point** | `writing.service.ts` → `submitEssay()`, trước `prisma.writingSubmission.create()` |
| **Response** | Trả existing submission `{ id, processing_status: 'pending' }` |
| **FR Ref** | FR-302, NFR-R04 |
| **Test Scenario** | User POST `/writing/prompts/:id/submit` 2 lần trong 5s → lần thứ 2 trả về `id` của submission đầu, không có job mới trong BullMQ. |

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

### ADM-002 — Source Document Reference Requirement

| Attribute | Detail |
|-----------|--------|
| **ID** | ADM-002 |
| **Title** | File-imported content must reference source document |
| **Description** | When content (passage or prompt) is created from a DOCX/PDF upload, it **must** have a `source_document_id` pointing to a valid `SourceDocument` record and optionally an `import_job_id`. Manually created content via CMS forms may leave these fields null. |
| **Enforcement Point** | Admin import flow → validate `source_document_id` is set when content originates from file upload |
| **FR Ref** | FR-601, FR-602 |
| **Test Scenario** | Parse DOCX via `/reading/parse-docx` → admin saves output as passage → passage.source_document_id must be non-null. Passage created via `POST /admin/passages` without upload → source_document_id null (allowed). |

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

## 3.5 Auth/Authorization Domain (AU)

### AU-005 — Role Promotion/Demotion

| Attribute | Detail |
|-----------|--------|
| **ID** | AU-005 |
| **Title** | Chỉ admin mới thay đổi role user |
| **Description** | API endpoint `PATCH /admin/users/:id/role` chỉ cho phép user có role `admin`. Admin không thể demote chính mình nếu là admin duy nhất trong hệ thống (bảo vệ khỏi mất quyền admin cuối cùng). Mọi thay đổi role được ghi vào `content_versions` table (entity_type = 'user', action = 'role_change') để audit. |
| **Enforcement Point** | `PATCH /admin/users/:id/role` — role guard + business logic check (count admins) |
| **Error Response** | `403 Forbidden` nếu caller không phải admin; `400 Bad Request` nếu cố demote admin cuối cùng. |
| **FR Ref** | FR-105 |
| **Test Scenario** | Admin A promote user B từ learner → instructor → 200 OK. User B (instructor) gọi cùng endpoint → 403. Chỉ còn 1 admin, admin đó PATCH role của mình thành learner → 400. |

---

## 4. System/Sync Domain (SY)

### SY-001 — File Upload Storage & Processing

| Attribute | Detail |
|-----------|--------|
| **ID** | SY-001 |
| **Title** | DOCX/PDF upload storage and lifecycle |
| **Description** | File upload được lưu vào disk với UUID prefix filename (tránh collision). File metadata lưu trong `source_documents` table (file_name, file_url, uploaded_by, status). Trạng thái processing: `pending` → `done` / `failed`. File > 10MB bị reject ở middleware. |
| **Storage Location** | `uploads/` directory (dev); cloud blob storage (prod) |
| **Status Transitions** | `pending` → `done` (parse thành công) hoặc `failed` (AI error / schema invalid) |
| **Enforcement Point** | Upload controller → Multer middleware + DB record. Parse service → update status. |
| **FR Ref** | FR-601 |

---

### SY-002 — AI Parser Output Validation

| Attribute | Detail |
|-----------|--------|
| **ID** | SY-002 |
| **Title** | Validate JSON schema của Gemini parser output |
| **Description** | Output JSON từ Gemini parser phải có đúng format: `passage` (HTML string) + `question_groups` array. Passage HTML được sanitize (strip `<script>`, `<iframe>`, `on*` attributes). Mỗi question type trong `question_groups[].type` phải nằm trong enum `QuestionType` (mcq, true_false_notgiven, yes_no_notgiven, matching_headings, matching_information, matching_features, matching_sentence_endings, sentence_completion, summary_completion, table_completion, flowchart_completion, diagram_label_completion, short). Nếu validation fail → retry 1 lần với prompt nhấn mạnh schema; still fail → status = `failed`. |
| **Enforcement Point** | `parsing.service.ts`: JSON schema validator sau khi nhận response từ Gemini |
| **FR Ref** | FR-601, FR-602 |

---

### SY-003 — File Import Audit Trail

| Attribute | Detail |
|-----------|--------|
| **ID** | SY-003 |
| **Title** | Log uploader identity cho mỗi file upload |
| **Description** | Mỗi file upload ghi nhận `uploaded_by` (user_id), `file_name`, `file_url`, `status`, timestamp trong `source_documents` table. Cho phép truy xuất lại ai import file nào, khi nào, kết quả ra sao. |
| **Enforcement Point** | Upload controller: set `uploaded_by = req.user.sub` khi tạo SourceDocument record. |
| **FR Ref** | FR-601, FR-602 |

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
| `POST /writing/prompts/:id/submit` | WR-001, WR-002, WR-003, WR-004, WR-007, WR-010 |
| `GET /writing/prompts` | ADM-001 (filter published only) |
| `PATCH /instructor/writing-submissions/:id/review` | WR-006 |
| `POST /admin/passages` | ADM-002 (if imported), ADM-003 (version) |
| `PATCH /admin/passages/:id` | ADM-003 (version) |
| `POST /admin/content/:type/:id/publish` | ADM-001, ADM-003 |
| `POST /reading/parse-docx` | SY-001, SY-002, SY-003 |
| `PATCH /admin/users/:id/role` | AU-005 |
| BullMQ worker (writing scoring) | WR-002, WR-004, WR-005, WR-008 |
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

---

## Changelog
- v1.1 (2026-04-13): Rewrite SY-001/SY-002/SY-003 và ADM-002 từ NotebookLM context sang DOCX/PDF file upload + Gemini multimodal parser. Thêm AU-005 (Role Promotion/Demotion), WR-008 (Band Consistency Check), WR-010 (Writing Submit Idempotency). Cập nhật Rule Enforcement Map.
