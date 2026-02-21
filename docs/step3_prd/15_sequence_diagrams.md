# 🔄 Sequence Diagrams — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-15  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [05_functional_requirements](05_functional_requirements.md) | [09_api_specifications](09_api_specifications.md)

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

## SD-07: Admin Import from NotebookLM

```mermaid
sequenceDiagram
    participant A as 🔧 Admin
    participant FE as 🖥️ Frontend
    participant BE as ⚙️ Backend
    participant RD as 📦 Redis
    participant NLM as 📓 NotebookLM
    participant DB as 🗄️ PostgreSQL

    A->>FE: Click "Import from NotebookLM"
    FE->>FE: Show import modal (URL input, title, tags)
    A->>FE: Enter URL + metadata, click Import
    FE->>BE: POST /admin/sources/import {url, title, tags, level}

    BE->>RD: GET notebooklm:source:{urlHash}
    alt Cache hit
        RD-->>BE: Cached content
    else Cache miss
        BE->>NLM: Fetch content from URL
        NLM-->>BE: Raw HTML/text content
        BE->>BE: Sanitize HTML (strip scripts, events)
        BE->>RD: SET notebooklm:source:{urlHash} TTL=30min
    end

    BE->>DB: INSERT INTO sources (title, url, origin, imported_by=admin.id)
    DB-->>BE: source_id
    BE->>BE: Split content into snippets
    BE->>DB: INSERT INTO snippets (source_id, text, tags, level)
    DB-->>BE: Snippet IDs
    BE-->>FE: 201 {source_id, snippets: [{id, text_preview}]}
    FE-->>A: Show imported snippets list

    %% Attach to content
    A->>FE: Select snippets → attach to passage
    FE->>BE: POST /admin/content/passages/{id}/sources {source_id, snippet_ids}
    BE->>DB: UPDATE passage SET source_ids = array_append(source_ids, ?)
    BE->>DB: UPDATE snippets SET linked_entity=?, linked_type='passage'
    BE-->>FE: 200 {updated}
    FE-->>A: Source attached confirmation
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
