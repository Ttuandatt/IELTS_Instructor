# 🔄 Sequence Diagrams — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-15  
> **Phiên bản:** 1.2  
> **Ngày tạo:** 2025-02-21  
> **Cập nhật:** 2026-04-14  
> **Trạng thái:** Draft  
> **Tham chiếu:** [05_functional_requirements](05_functional_requirements.md) | [09_api_specifications](09_api_specifications.md)
>
> **Changelog:**
> - v1.2 (2026-04-14): SD-07 chuyển sang hybrid parser flow: hash-based Redis cache → Mammoth primary + IELTS post-processor → Gemini fallback khi confidence < 0.6 hoặc PDF. Lưu `parser_used`, `confidence`, `warnings`.
> - v1.1 (2026-04-14): Rewrite SD-07 từ NotebookLM URL fetch → DOCX/PDF upload qua Gemini Multimodal (multipart, parse JSON, sanitize HTML, create draft passage + questions).

---

## SD-01: User Registration

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🖥️ Frontend
    participant BE as ⚙️ Backend
    participant DB as 🗄️ PostgreSQL

    U->>FE: Fill email, password, name, role
    FE->>FE: Client-side validation
    FE->>BE: POST /auth/register {email, password, display_name, role}
    BE->>BE: Validate input (email format, password policy, role enum)
    BE->>DB: SELECT user WHERE email = ?
    DB-->>BE: null (no duplicate)
    BE->>BE: Hash password (bcrypt, rounds=12)
    BE->>DB: INSERT INTO users (email, password_hash, role=chosen_role, ...)
    DB-->>BE: User row created
    BE->>BE: Generate JWT access + refresh tokens
    BE-->>FE: 201 {access_token, refresh_token, user}
    FE->>FE: Store tokens (localStorage / httpOnly cookie)
    FE-->>U: Redirect to Dashboard

    Note over BE,DB: Alt: Duplicate email
    BE->>DB: SELECT user WHERE email = ?
    DB-->>BE: Existing user found
    BE-->>FE: 409 {message: "Email already registered"}
    FE-->>U: Show inline error
```

---

## SD-02: User Login

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🖥️ Frontend
    participant BE as ⚙️ Backend
    participant DB as 🗄️ PostgreSQL

    U->>FE: Enter email + password
    FE->>BE: POST /auth/login {email, password}
    BE->>BE: Rate-limit check (5/15min per IP)
    BE->>DB: SELECT user WHERE email = ?
    DB-->>BE: User row (with password_hash)
    BE->>BE: bcrypt.compare(password, hash)
    alt Credentials valid
        BE->>BE: Generate JWT access + refresh tokens
        BE-->>FE: 200 {access_token, refresh_token, user}
        FE->>FE: Store tokens
        FE-->>U: Redirect to Dashboard
    else Credentials invalid
        BE-->>FE: 401 {message: "Invalid email or password"}
        FE-->>U: Show error
    end
```

---

## SD-03: Token Refresh

```mermaid
sequenceDiagram
    participant FE as 🖥️ Frontend
    participant BE as ⚙️ Backend

    FE->>BE: POST /auth/refresh {refresh_token}
    BE->>BE: Verify refresh token (JWT decode + expiry check)
    alt Token valid
        BE->>BE: Rotate: generate new access + new refresh token
        BE->>BE: Invalidate old refresh token
        BE-->>FE: 200 {access_token, refresh_token}
        FE->>FE: Store new tokens
    else Token expired/invalid
        BE-->>FE: 401 {message: "Refresh token expired"}
        FE->>FE: Clear tokens
        FE-->>FE: Redirect to /login
    end
```

---

## SD-04: Reading Practice (Browse → Submit → Result)

```mermaid
sequenceDiagram
    participant U as 👤 Learner
    participant FE as 🖥️ Frontend
    participant BE as ⚙️ Backend
    participant DB as 🗄️ PostgreSQL

    %% Browse
    U->>FE: Navigate to /reading
    FE->>BE: GET /reading/passages?level=B2&page=1
    BE->>DB: SELECT passages WHERE status='published' AND level='B2' LIMIT 10
    DB-->>BE: Passage list
    BE-->>FE: 200 {data: [...passages], meta: {...}}
    FE-->>U: Display passage cards

    %% Select & Load
    U->>FE: Click passage card
    FE->>BE: GET /reading/passages/{id}
    BE->>DB: SELECT passage + questions WHERE passage.id = ? AND status='published'
    DB-->>BE: Passage + questions (no answer_key)
    BE-->>FE: 200 {data: {passage, questions}}
    FE-->>U: Display split view (passage left, questions right)

    %% Answer & Submit
    U->>FE: Answer questions, start timer
    U->>FE: Click Submit (or timer expires)
    FE->>BE: POST /reading/passages/{id}/submit {answers[], timed_out, duration_sec}
    BE->>BE: Validate: answers.length / total >= 0.8 (skip if timed_out)
    BE->>DB: SELECT answer_key for each question
    DB-->>BE: Answer keys
    BE->>BE: Auto-grade (MCQ direct compare, short keyword match)
    BE->>BE: Calculate score_pct, correct_count
    BE->>DB: INSERT INTO submissions_reading (...)
    DB-->>BE: Submission saved
    BE-->>FE: 200 {submission_id, score_pct, correct_count, details[]}
    FE-->>U: Display results (score header + per-question breakdown)
```

---

## SD-05: Writing Submit — Async Scoring Pipeline

```mermaid
sequenceDiagram
    participant U as 👤 Learner
    participant FE as 🖥️ Frontend
    participant BE as ⚙️ Backend
    participant RD as 📦 Redis
    participant Q as ⚡ BullMQ
    participant W as 🔧 Worker
    participant LLM as 🤖 LLM API
    participant DB as 🗄️ PostgreSQL

    %% Submit
    U->>FE: Write essay, click Submit
    FE->>BE: POST /writing/prompts/{id}/submit {content, model_tier}
    BE->>RD: Check rate limit (user + day)
    RD-->>BE: count=4 (under limit)
    BE->>BE: Validate (non-empty, prompt exists)
    BE->>DB: INSERT submission (status=pending)
    DB-->>BE: submission_id
    BE->>Q: Enqueue job {submissionId, content, modelTier}
    Q-->>BE: Job ID
    BE->>RD: INCR rate limit counter
    BE-->>FE: 202 {processing_status: "pending", submission_id}
    FE-->>U: Show "Scoring in progress..." card

    %% Polling
    loop Every 3 seconds (max 5 min)
        FE->>BE: GET /writing/submissions/{id}
        BE->>DB: SELECT submission WHERE id = ?
        DB-->>BE: {processing_status: "pending"}
        BE-->>FE: 200 {processing_status: "pending"}
    end

    %% Worker processes
    Q->>W: Dequeue job
    W->>W: Rule checks (word count, prompt overlap, structure)
    W->>LLM: Send rubric prompt + essay + rule context
    LLM-->>W: JSON {TR, CC, LR, GRA, overall, summary, strengths[], improvements[]}
    W->>W: Validate JSON schema
    W->>W: Calculate overall = round(avg(TR,CC,LR,GRA))
    W->>DB: UPDATE submission SET scores=?, feedback=?, status='done', model_name=?, turnaround_ms=?, scored_at=now()
    DB-->>W: Updated

    %% Final poll
    FE->>BE: GET /writing/submissions/{id}
    BE->>DB: SELECT submission
    DB-->>BE: {processing_status: "done", scores, feedback}
    BE-->>FE: 200 {scores, feedback, model_name, turnaround_ms}
    FE-->>U: Display score bars + feedback panel
```

---

## SD-06: Writing Scoring Failure & Retry

```mermaid
sequenceDiagram
    participant Q as ⚡ BullMQ
    participant W as 🔧 Worker
    participant LLM as 🤖 LLM API
    participant DB as 🗄️ PostgreSQL
    participant DLQ as 💀 Dead Letter Queue

    Q->>W: Dequeue job (attempt 1)
    W->>LLM: Send scoring prompt
    LLM-->>W: ❌ Timeout (60s)
    W->>W: Log error; trigger retry

    Q->>W: Retry (attempt 2, after 1s backoff)
    W->>LLM: Send scoring prompt
    LLM-->>W: ❌ Invalid JSON response
    W->>W: Log error; trigger retry

    Q->>W: Retry (attempt 3, after 2s backoff)
    W->>LLM: Send scoring prompt
    LLM-->>W: ❌ 500 Server Error
    W->>W: Max retries exhausted

    W->>DB: UPDATE submission SET status='failed', error_message='Scoring service unavailable after 3 attempts'
    W->>DLQ: Move job to Dead Letter Queue
    
    Note over DLQ: Admin reviews failed jobs via /admin/queues
```

---

## SD-07: Admin DOCX/PDF Import via Hybrid Parser (Mammoth primary + Gemini fallback)

```mermaid
sequenceDiagram
    participant A as 🔧 Admin
    participant FE as 🖥️ Frontend
    participant BE as ⚙️ Backend
    participant MM as 📘 Mammoth + IELTS PostProc
    participant RD as 📦 Redis Cache
    participant GEM as 📄 Gemini Multimodal
    participant DB as 🗄️ PostgreSQL

    A->>FE: Click "Upload DOCX/PDF"
    FE->>FE: Show import modal (file picker, title, tags, level)
    A->>FE: Choose .docx/.pdf file, click Parse
    FE->>BE: POST /reading/parse-docx (multipart: file, metadata)
    BE->>BE: Validate file type (.docx/.pdf) + size (≤10MB)

    alt Invalid
        BE-->>FE: 400/413 error
        FE-->>A: Show error
    else Valid
        BE->>BE: Compute SHA-256 hash of file
        BE->>RD: GET parse:{hash}
        alt Cache hit
            RD-->>BE: Cached parse result
        else Cache miss
            alt File is DOCX
                BE->>MM: mammoth.convertToHtml(buffer) + IELTS post-process
                MM-->>BE: {body_html, paragraphs, questions, confidence, warnings}
                alt confidence ≥ 0.6
                    Note over BE: parser_used = "mammoth"
                else confidence < 0.6
                    BE->>GEM: uploadFile + generateContent(IELTS prompt, file)
                    GEM-->>BE: Normalized JSON (same schema)
                    Note over BE: parser_used = "gemini"
                end
            else File is PDF
                BE->>GEM: uploadFile + generateContent(IELTS prompt, file)
                GEM-->>BE: Normalized JSON
                Note over BE: parser_used = "gemini"
            end
            BE->>BE: sanitize-html(body_html); validate schema; check blank_refs
            BE->>RD: SET parse:{hash} TTL=24h
        end

        BE->>DB: INSERT source_documents (filename, mime, uploaded_by, parser_used, confidence, parse_status='done')
        DB-->>BE: source_document_id
        BE->>DB: INSERT passages (title, body_html, level, status='draft', source_document_id)
        BE->>DB: INSERT questions (passage_id, type, stem, options, correct_answer, group_id, blank_refs)
        DB-->>BE: passage_id + question_ids
        BE-->>FE: 200 {source_document_id, parser_used, confidence, warnings, passage, questions}
        FE-->>A: Preview panel: passage (full split-view) + questions + warnings banner
    end

    A->>FE: Review, click "Save as Draft"
    FE->>BE: PATCH /admin/content/passages/{id} (edits)
    BE->>DB: UPDATE passage, questions
    BE-->>FE: 200 {updated}
    FE-->>A: "Draft saved" toast
```

---

## SD-08: Admin Publish Content

```mermaid
sequenceDiagram
    participant A as 🔧 Admin
    participant FE as 🖥️ Frontend
    participant BE as ⚙️ Backend
    participant DB as 🗄️ PostgreSQL

    A->>FE: Click "Publish" on passage
    FE->>BE: POST /admin/content/passages/{id}/publish
    BE->>DB: SELECT passage WHERE id = ?
    DB-->>BE: Passage (status=draft)
    BE->>BE: Validate: has title, body, ≥1 question
    BE->>DB: UPDATE passage SET status='published', updated_at=now()
    BE->>DB: INSERT INTO content_versions (entity_id, entity_type='passage', action='publish', editor_id=admin.id, version=v+1)
    DB-->>BE: Done
    BE-->>FE: 200 {status: 'published', version: 3}
    FE-->>A: Status badge updates to "Published"
```

---

> **Tham chiếu:** [05_functional_requirements](05_functional_requirements.md) | [09_api_specifications](09_api_specifications.md) | [11_business_rules](11_business_rules.md)

---

# ══════════════════════════════════════════════════════
# BỔ SUNG TỪ BUSINESS ANALYSIS & REDESIGN (07/2026)
# Các mục dưới đây bổ sung từ BA 6 vòng elicitation,
# phân tích đối thủ, và thiết kế state machine mới.
# Khi có mâu thuẫn với nội dung trên, phần này được ưu tiên.
# ══════════════════════════════════════════════════════

# Sequence Diagrams
## Dự án Langy

> **Phiên bản:** 1.0
> **Ngày tạo:** 06/07/2026

---

## 1. Writing Submission — Chế độ A (instant)

```mermaid
sequenceDiagram
    actor HS as Học sinh
    participant FE as Frontend
    participant API as NestJS API
    participant DB as PostgreSQL
    participant Q as Redis/BullMQ
    participant W as Worker
    participant LLM as Gemini API

    HS->>FE: Viết bài (editor)
    loop Mỗi 30 giây
        FE->>API: PATCH /submissions/:id/draft
        API->>DB: Update content + updated_at
    end

    HS->>FE: Bấm "Nộp bài"
    FE->>FE: Dialog xác nhận
    HS->>FE: Xác nhận
    FE->>API: POST /writing/submissions
    API->>DB: Create submission (state=submitted)
    API->>Q: Enqueue job (id=submission_id)
    API-->>FE: 202 Accepted
    FE-->>HS: "Đang chờ chấm..."

    Q->>W: Deliver job
    W->>DB: Read submission (đề + essay)
    W->>LLM: Prompt (rubric + essay, NO PII)
    Note over W,LLM: timeout 60s, temperature 0
    LLM-->>W: JSON structured response
    W->>W: Validate schema
    W->>DB: Save scores + feedback + metadata
    W->>DB: Resolve writing_mode → instant
    W->>DB: Update state → released_ai

    FE->>API: Poll GET /submissions/:id
    API->>DB: Read (state=released_ai)
    API-->>FE: scores + feedback
    FE-->>HS: Feedback AI + nhãn "ước lượng"
```

---

## 2. Writing Submission — Chế độ B (review_first)

```mermaid
sequenceDiagram
    actor HS as Học sinh
    actor GV as Giáo viên
    participant FE as Frontend
    participant API as NestJS API
    participant DB as PostgreSQL
    participant W as Worker
    participant LLM as Gemini API

    HS->>FE: Nộp bài
    FE->>API: POST /writing/submissions
    API->>DB: Create (state=submitted)
    API-->>FE: 202

    W->>LLM: Chấm AI
    LLM-->>W: Kết quả
    W->>DB: Save scores, state → pending_review

    HS->>API: GET /submissions/:id
    API-->>HS: "Đã nộp — đang chờ giáo viên"
    Note over API,HS: scores/feedback bị CHE (server-side)

    GV->>API: GET /instructor/review-queue
    API-->>GV: Danh sách bài cần review
    GV->>API: GET /submissions/:id
    API-->>GV: Essay + AI feedback + band (đầy đủ)

    GV->>GV: Review, sửa band nếu cần
    GV->>API: POST /submissions/:id/finalize
    API->>DB: Save instructor_scores, state → finalized
    Note over DB: Lưu cặp (scores, instructor_scores)

    HS->>API: GET /submissions/:id
    API-->>HS: Bản chốt GV + highlight thay đổi
```

---

## 3. AI Scoring — Error Flow

```mermaid
sequenceDiagram
    participant Q as Redis Queue
    participant W as Worker
    participant LLM as LLM API
    participant DB as PostgreSQL
    actor GV as Giáo viên

    Q->>W: Job (attempt 1)
    W->>LLM: Call (timeout 60s)
    LLM--xW: Timeout/Error

    Q->>W: Job (attempt 2, backoff 5s)
    W->>LLM: Call
    LLM--xW: Error

    Q->>W: Job (attempt 3, backoff 25s)
    W->>LLM: Call
    LLM--xW: Error

    W->>DB: state → ai_failed
    Note over DB: error_message logged

    GV->>DB: Thấy trong review queue
    alt Chấm lại
        GV->>W: POST /submissions/:id/retry
        W->>DB: state → submitted
        W->>Q: Re-enqueue
    else Chấm tay
        GV->>DB: POST /submissions/:id/finalize
        Note over DB: state → finalized (skip AI)
    end
```

---

## 4. Classroom — Tạo lớp + HS tham gia

```mermaid
sequenceDiagram
    actor GV as Giáo viên
    actor HS as Học sinh
    participant API as NestJS API
    participant DB as PostgreSQL

    GV->>API: POST /classrooms {name, writing_mode}
    API->>DB: Create Classroom + generate invite_code
    API-->>GV: { id, invite_code: "ABC123", writing_mode: "instant" }

    GV->>HS: Chia sẻ mã "ABC123" (qua Zalo/lớp)

    HS->>API: POST /classrooms/join {invite_code: "ABC123"}
    API->>DB: Check code → Create ClassroomMember
    API-->>HS: { classroom: {...}, role: "student" }
```

---

## 5. Import Reading từ docx

```mermaid
sequenceDiagram
    actor GV as Giáo viên
    participant FE as Frontend
    participant API as NestJS API
    participant Parser as Docx Parser
    participant DB as PostgreSQL

    GV->>FE: Upload file .docx
    FE->>API: POST /upload/document (multipart)
    API->>DB: Create SourceDocument (status=pending)
    API->>Parser: Parse docx
    Parser-->>API: { passage, questions[], answers[] }
    API->>DB: Create ImportJob (parsed_raw_data)
    API-->>FE: { job_id, preview_data }

    FE-->>GV: Màn hình Preview

    GV->>FE: Sửa câu hỏi nếu cần
    GV->>FE: Tick checkbox bản quyền
    GV->>FE: Bấm "Publish"
    FE->>API: POST /upload/jobs/:id/confirm
    API->>DB: Create Passage + Questions
    API-->>FE: { passage_id }
    FE-->>GV: "Đã import thành công"
```

---

## 6. Đăng ký — HS dưới 16 tuổi

```mermaid
sequenceDiagram
    actor HS as Học sinh
    participant FE as Frontend
    participant API as NestJS API
    participant DB as PostgreSQL

    HS->>FE: Điền form (email, password, birth_year)
    FE->>FE: Tính tuổi từ birth_year
    alt Tuổi >= 16
        FE->>FE: Checkbox Điều khoản + Privacy Policy
        HS->>FE: Tick đồng ý
        FE->>API: POST /auth/register
        API->>DB: Create User
        API-->>FE: Success
    else Tuổi < 16
        FE->>FE: Hiện thêm: checkbox xác nhận phụ huynh + email phụ huynh
        HS->>FE: Tick + nhập email PH
        FE->>API: POST /auth/register {parent_consent: true, parent_email}
        API->>DB: Create User (flagged minor)
        API-->>FE: Success
    end
```
