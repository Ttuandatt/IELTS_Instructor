# 📐 Use Case Diagram — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-14  
> **Phiên bản:** 1.2  
> **Ngày tạo:** 2025-02-21  
> **Cập nhật:** 2026-04-14  
> **Trạng thái:** Draft  
> **Tham chiếu:** [03_user_personas_roles](03_user_personas_roles.md) | [04_user_stories](04_user_stories.md)
>
> **Changelog:**
> - v1.2 (2026-04-14): UC-44 chuyển thành hybrid parser: Mammoth + IELTS post-processor primary, Gemini fallback. Actors thêm Mammoth; Gemini hạ xuống fallback-only với dotted arrow.
> - v1.1 (2026-04-14): Đổi actor NLM → Gemini Multimodal. Rewrite UC-44 thành DOCX/PDF Import via Gemini.

---

## 1. Actors

| Actor | Type | Description |
|-------|------|-------------|
| Learner | Primary | Self-study or center-based student practicing IELTS Reading & Writing |
| Instructor | Secondary | Reviews submissions, may curate content (limited in MVP) |
| Admin | Primary | Manages content, imports DOCX/PDF, manages users |
| System (BullMQ Worker) | Internal | Async process that scores writing submissions |
| LLM API | External | AI model provider (OpenAI/Google/Anthropic) for Writing scoring |
| Mammoth + IELTS PostProc | Internal (npm) | Primary DOCX parser — HTML conversion + IELTS structure detection |
| Gemini Multimodal | External (fallback) | Parses PDF or complex DOCX when Mammoth confidence < 0.6 |

---

## 2. Use Case Diagram

```mermaid
graph TB
    subgraph Actors
        L((👤 Learner))
        I((👨‍🏫 Instructor))
        A((🔧 Admin))
    end

    subgraph External
        LLM[🤖 LLM API]
        MM[📘 Mammoth + IELTS PostProc]
        GEM[📄 Gemini Multimodal<br/>fallback]
        Q[⚡ BullMQ Worker]
    end

    subgraph "UC — Authentication"
        UC01[UC-01: Register Account]
        UC02[UC-02: Login]
        UC03[UC-03: Refresh Token]
        UC04[UC-04: Update Profile]
    end

    subgraph "UC — Reading Practice"
        UC10[UC-10: Browse Passages]
        UC11[UC-11: Practice Reading]
        UC12[UC-12: Submit Reading Answers]
        UC13[UC-13: View Reading Results]
        UC14[UC-14: View Reading History]
    end

    subgraph "UC — Writing Practice"
        UC20[UC-20: Browse Prompts]
        UC21[UC-21: Write Essay]
        UC22[UC-22: Submit Essay]
        UC23[UC-23: View Writing Feedback]
        UC24[UC-24: View Writing History]
    end

    subgraph "UC — Dashboard"
        UC30[UC-30: View Progress Summary]
        UC31[UC-31: View Score Trends]
    end

    subgraph "UC — Admin CMS"
        UC40[UC-40: Manage Passages]
        UC41[UC-41: Manage Questions]
        UC42[UC-42: Manage Prompts]
        UC43[UC-43: Publish/Unpublish Content]
        UC44[UC-44: Import DOCX/PDF via Gemini]
        UC45[UC-45: Manage Sources & Snippets]
        UC46[UC-46: Manage Users]
    end

    subgraph "UC — Scoring Pipeline"
        UC50[UC-50: Score Essay - Async]
        UC51[UC-51: Retry Failed Scoring]
    end

    subgraph "UC — Classroom Management"
        UC60[UC-60: Create Classroom]
        UC61[UC-61: Manage Members]
        UC62[UC-62: Generate Invite Link/QR]
        UC63[UC-63: Join Classroom]
        UC64[UC-64: Manage Topics]
        UC65[UC-65: Manage Lessons]
    end

    %% Learner connections
    L --> UC01
    L --> UC02
    L --> UC03
    L --> UC04
    L --> UC10
    L --> UC11
    L --> UC12
    L --> UC13
    L --> UC14
    L --> UC20
    L --> UC21
    L --> UC22
    L --> UC23
    L --> UC24
    L --> UC30
    L --> UC31
    L --> UC63

    %% Instructor connections
    I --> UC02
    I --> UC10
    I --> UC20
    I --> UC23
    I --> UC60
    I --> UC61
    I --> UC62
    I --> UC64
    I --> UC65

    %% Admin connections
    A --> UC02
    A --> UC40
    A --> UC41
    A --> UC42
    A --> UC43
    A --> UC44
    A --> UC45
    A --> UC46

    %% System connections
    UC22 --> Q
    Q --> UC50
    UC50 --> LLM
    UC50 --> UC51
    UC44 --> MM
    UC44 -.fallback.-> GEM
```

---

## 3. Use Case Descriptions

### UC-01: Register Account

| Attribute | Detail |
|-----------|--------|
| **Actor** | Learner |
| **Precondition** | User has no existing account |
| **Flow** | 1. User fills email, password, display name. 2. System validates. 3. System creates account (role=learner). 4. System returns JWT tokens. |
| **Postcondition** | Account created; user logged in |
| **Alt Flow** | Duplicate email → 409 error |
| **FR Ref** | FR-101 |

### UC-02: Login

| Attribute | Detail |
|-----------|--------|
| **Actor** | Learner, Instructor, Admin |
| **Precondition** | User has account |
| **Flow** | 1. User enters email + password. 2. System validates credentials. 3. System returns JWT access + refresh tokens. |
| **Postcondition** | User authenticated |
| **Alt Flow** | Invalid credentials → 401 |
| **FR Ref** | FR-102 |

### UC-10: Browse Passages

| Attribute | Detail |
|-----------|--------|
| **Actor** | Learner, Instructor |
| **Precondition** | Authenticated |
| **Flow** | 1. User navigates to Reading page. 2. System displays published passages with filters (level, topic). 3. User browses/filters/paginates. |
| **Postcondition** | User sees passage list |
| **FR Ref** | FR-201 |

### UC-11: Practice Reading

| Attribute | Detail |
|-----------|--------|
| **Actor** | Learner |
| **Precondition** | Passage selected |
| **Flow** | 1. System loads passage text + questions. 2. User optionally starts timer. 3. User reads passage and answers questions. |
| **Postcondition** | User has answered questions (not yet submitted) |
| **FR Ref** | FR-202 |

### UC-12: Submit Reading Answers

| Attribute | Detail |
|-----------|--------|
| **Actor** | Learner |
| **Precondition** | ≥80% questions answered (or timer expired) |
| **Flow** | 1. User clicks Submit (or timer auto-submits). 2. System validates answer threshold. 3. System auto-grades each answer. 4. System returns score + explanations. |
| **Postcondition** | Submission saved; score calculated |
| **Business Rules** | RD-001, RD-002, RD-003 |
| **FR Ref** | FR-203 |

### UC-22: Submit Essay

| Attribute | Detail |
|-----------|--------|
| **Actor** | Learner |
| **Precondition** | Essay written; within daily rate limit |
| **Flow** | 1. User clicks Submit. 2. System validates (non-empty, rate limit). 3. System creates submission (status=pending). 4. System enqueues scoring job. 5. System returns 202 with submission_id. |
| **Postcondition** | Job in queue; user sees "scoring in progress" |
| **Business Rules** | WR-001, WR-003 |
| **FR Ref** | FR-302 |

### UC-50: Score Essay (Async)

| Attribute | Detail |
|-----------|--------|
| **Actor** | System (BullMQ Worker) |
| **Precondition** | Scoring job in queue |
| **Flow** | 1. Worker dequeues job. 2. Run rule checks. 3. Call LLM with rubric prompt. 4. Validate JSON response. 5. Store scores + feedback. 6. Update status=done. |
| **Postcondition** | Submission has scores and feedback |
| **Alt Flow** | LLM failure → retry 2x → status=failed, DLQ |
| **Business Rules** | WR-002, WR-004, WR-005 |
| **FR Ref** | FR-302, FR-303 |

### UC-40: Manage Passages

| Attribute | Detail |
|-----------|--------|
| **Actor** | Admin |
| **Precondition** | Admin authenticated |
| **Flow** | 1. Admin creates/edits/deletes passages. 2. System validates. 3. System records content version. |
| **Postcondition** | Passage updated; version logged |
| **Business Rules** | ADM-001, ADM-003 |
| **FR Ref** | FR-501 |

### UC-44: Import DOCX/PDF via Hybrid Parser

| Attribute | Detail |
|-----------|--------|
| **Actor** | Admin, Instructor |
| **Precondition** | Source file `.docx` or `.pdf` (≤10MB) available |
| **Flow** | 1. Actor uploads file via `POST /reading/parse-docx`. 2. Backend validates file type & size. 3. Backend hashes file; checks Redis cache. 4. On miss: if DOCX → Mammoth.js + IELTS post-processor (regex detect labels/blanks/question groups) → confidence score. 5. If confidence < 0.6 or file is PDF or Mammoth fails → fallback to Gemini Multimodal. 6. Normalize output to unified schema; sanitize HTML; validate. 7. Cache result (24h). 8. Create `SourceDocument` + draft `Passage` + `Question` rows. 9. Actor reviews warnings (if any) and publishes. |
| **Postcondition** | `SourceDocument` row persisted với `parser_used` + `confidence`; passage/questions created as draft |
| **Business Rules** | SY-001, SY-002, SY-003, ADM-002 |
| **FR Ref** | FR-601 |

### UC-60: Create Classroom

| Attribute | Detail |
|-----------|--------|
| **Actor** | Instructor |
| **Precondition** | User has role=instructor or admin |
| **Flow** | 1. Instructor clicks "Tạo lớp mới". 2. Fills name, description. 3. System auto-generates invite_code. 4. System creates classroom with owner_id. |
| **Postcondition** | Classroom created; instructor auto-added as teacher member |
| **Business Rules** | CR-001, CR-003 |
| **FR Ref** | FR-701 |

### UC-61: Manage Members

| Attribute | Detail |
|-----------|--------|
| **Actor** | Instructor (owner) |
| **Precondition** | Classroom exists; user is owner |
| **Flow** | 1. Instructor enters student email. 2. System looks up user. 3. If found and not already member, add as student. 4. Owner can also remove members. |
| **Postcondition** | Member added/removed |
| **Business Rules** | CR-002, CR-004, CR-005 |
| **FR Ref** | FR-702 |

### UC-62: Generate Invite Link/QR

| Attribute | Detail |
|-----------|--------|
| **Actor** | Instructor (owner) |
| **Precondition** | Classroom exists |
| **Flow** | 1. Owner clicks "Invite". 2. System generates QR code from invite_url. 3. Owner can copy link or show QR. 4. Optional: regenerate code. |
| **Postcondition** | Invite link/QR available |
| **FR Ref** | FR-703 |

### UC-63: Join Classroom

| Attribute | Detail |
|-----------|--------|
| **Actor** | Learner |
| **Precondition** | User authenticated; has valid invite link/code |
| **Flow** | 1. User opens invite link or enters code. 2. System shows classroom info. 3. User clicks "Tham gia". 4. System adds user as student. |
| **Postcondition** | User is member of classroom |
| **Business Rules** | CR-004, CR-005 |
| **FR Ref** | FR-703 |

### UC-64: Manage Topics

| Attribute | Detail |
|-----------|--------|
| **Actor** | Instructor (owner) |
| **Precondition** | Classroom exists; user is owner |
| **Flow** | 1. Owner creates/edits/deletes/reorders topics. 2. Sets status (draft/published). 3. Students only see published topics. |
| **Postcondition** | Topic CRUD complete |
| **Business Rules** | CR-006, CR-007 |
| **FR Ref** | FR-704 |

### UC-65: Manage Lessons

| Attribute | Detail |
|-----------|--------|
| **Actor** | Instructor (owner) |
| **Precondition** | Topic exists; user is classroom owner |
| **Flow** | 1. Owner creates/edits/deletes/reorders lessons within a topic. 2. Optionally links to existing Passage/Prompt. 3. Sets status (draft/published). |
| **Postcondition** | Lesson CRUD complete |
| **Business Rules** | CR-006, CR-007 |
| **FR Ref** | FR-705 |

---

## 4. Use Case — Story — FR Traceability

| Use Case | User Stories | Functional Requirements |
|----------|-------------|------------------------|
| UC-01 | US-101 | FR-101 |
| UC-02 | US-102 | FR-102 |
| UC-03 | US-103 | FR-103 |
| UC-04 | US-104 | FR-104 |
| UC-10 | US-201 | FR-201 |
| UC-11 | US-202 | FR-202 |
| UC-12 | US-203 | FR-203 |
| UC-13 | US-203 | FR-203 |
| UC-14 | US-204 | FR-204 |
| UC-20 | US-301 | FR-301 |
| UC-21 | US-302 | FR-302 |
| UC-22 | US-302 | FR-302 |
| UC-23 | US-303 | FR-303 |
| UC-24 | US-304 | FR-304 |
| UC-30 | US-401 | FR-401 |
| UC-31 | US-402 | FR-402 |
| UC-40 | US-501 | FR-501 |
| UC-41 | US-501 | FR-501 |
| UC-42 | US-502 | FR-502 |
| UC-43 | US-503 | FR-503 |
| UC-44 | US-601 | FR-601 |
| UC-45 | US-602 | FR-602 |
| UC-46 | US-603 | FR-603 |
| UC-50 | — (system) | FR-302, FR-303 |
| UC-51 | — (system) | FR-302 |
| UC-60 | US-801 | FR-701 |
| UC-61 | US-802, US-805, US-810 | FR-702 |
| UC-62 | US-803 | FR-703 |
| UC-63 | US-804 | FR-703 |
| UC-64 | US-806 | FR-704 |
| UC-65 | US-807, US-808 | FR-705 |

---

> **Tham chiếu:** [03_user_personas_roles](03_user_personas_roles.md) | [04_user_stories](04_user_stories.md) | [05_functional_requirements](05_functional_requirements.md)

---

# ══════════════════════════════════════════════════════
# BỔ SUNG TỪ BUSINESS ANALYSIS & REDESIGN (07/2026)
# Các mục dưới đây bổ sung từ BA 6 vòng elicitation,
# phân tích đối thủ, và thiết kế state machine mới.
# Khi có mâu thuẫn với nội dung trên, phần này được ưu tiên.
# ══════════════════════════════════════════════════════

# Use Case Diagram
## Dự án Langy

> **Phiên bản:** 1.0
> **Ngày tạo:** 06/07/2026

---

## 1. Use Case Diagram tổng quan

```mermaid
graph LR
    subgraph Actors
        GV["🧑‍🏫 Instructor"]
        HS["🧑‍🎓 Learner (classroom)"]
        HSS["🧑‍💻 Learner (self-study)"]
        AI["🤖 LLM API"]
        SYS["⚙️ System"]
    end

    subgraph UC_AUTH["Authentication"]
        UC01["UC-01: Đăng ký"]
        UC02["UC-02: Đăng nhập"]
        UC03["UC-03: Quên mật khẩu"]
        UC04["UC-04: Xóa tài khoản"]
    end

    subgraph UC_CLASS["Classroom"]
        UC10["UC-10: Tạo lớp"]
        UC11["UC-11: Mời HS"]
        UC12["UC-12: Tham gia lớp"]
        UC13["UC-13: Giao bài"]
        UC14["UC-14: Đổi chế độ Writing"]
    end

    subgraph UC_WRIT["Writing"]
        UC20["UC-20: Viết bài + auto-save"]
        UC21["UC-21: Nộp bài Writing"]
        UC22["UC-22: AI chấm bài"]
        UC23["UC-23: Xem feedback"]
        UC24["UC-24: Review + chốt điểm"]
        UC25["UC-25: Xem lịch sử Writing"]
    end

    subgraph UC_READ["Reading"]
        UC30["UC-30: Làm bài Reading"]
        UC31["UC-31: Xem kết quả + giải thích"]
        UC32["UC-32: Xem lịch sử Reading"]
    end

    subgraph UC_IMPORT["Import"]
        UC40["UC-40: Import Writing prompt"]
        UC41["UC-41: Import Reading passage"]
    end

    subgraph UC_DASH["Dashboard"]
        UC50["UC-50: Xem dashboard lớp"]
        UC51["UC-51: Xem tiến độ HS"]
        UC52["UC-52: Xem dashboard cá nhân"]
    end

    GV --> UC01 & UC02 & UC03 & UC04
    HS --> UC01 & UC02 & UC03 & UC04
    HSS --> UC01 & UC02 & UC03 & UC04

    GV --> UC10 & UC11 & UC13 & UC14
    HS --> UC12

    GV --> UC24
    HS --> UC20 & UC21 & UC23 & UC25
    HSS --> UC20 & UC21 & UC23 & UC25

    HS --> UC30 & UC31 & UC32
    HSS --> UC30 & UC31 & UC32

    GV --> UC40 & UC41

    GV --> UC50 & UC51
    HS --> UC52
    HSS --> UC52

    UC21 --> AI
    AI --> UC22
    UC22 --> SYS
```

---

## 2. Use Case Descriptions

### UC-21: Nộp bài Writing (trung tâm hệ thống)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Actor** | Learner (classroom hoặc self-study) |
| **Precondition** | Đã đăng nhập; đã mở đề Writing |
| **Trigger** | Bấm nút "Nộp bài" |
| **Main flow** | 1. HS viết bài trong editor (đếm từ real-time, auto-save 30s) → 2. Bấm "Nộp" → 3. Dialog xác nhận → 4. Hệ thống tạo submission (state=submitted) → 5. Enqueue job chấm AI → 6. Trả HTTP 202 → 7. HS thấy "đang chờ chấm" |
| **Alternative flow A** | Lớp chế độ instant / tự học: khi AI chấm xong → state=released_ai → HS thấy feedback + nhãn "ước lượng" |
| **Alternative flow B** | Lớp chế độ review_first: khi AI chấm xong → state=pending_review → HS thấy "đang chờ giáo viên" → GV review → finalized → HS thấy feedback |
| **Exception flow** | AI lỗi sau 3 retry → state=ai_failed → GV thấy nút "chấm lại"; HS thấy "đang chờ chấm" |
| **Postcondition** | Submission tồn tại trong DB với state phù hợp; job đã enqueue hoặc đã xử lý |

### UC-24: Review + chốt điểm

| Thuộc tính | Chi tiết |
|------------|----------|
| **Actor** | Instructor |
| **Precondition** | Có ≥1 submission ở state released_ai, pending_review, hoặc ai_failed |
| **Trigger** | Mở review queue |
| **Main flow** | 1. GV mở review queue → 2. Lọc theo lớp/trạng thái → 3. Click vào bài → 4. Thấy essay + feedback AI + band từng tiêu chí → 5. Giữ nguyên hoặc sửa band → 6. Thêm nhận xét (tùy chọn) → 7. Bấm "Chốt" → state=finalized |
| **Postcondition** | Cặp (scores AI, instructor_scores) được lưu; HS thấy bản chốt |

### UC-22: AI chấm bài (system use case)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Actor** | System (BullMQ Worker) + LLM API |
| **Precondition** | Job trong queue với submission_id |
| **Main flow** | 1. Worker lấy job → 2. Đọc submission (đề + essay) → 3. Xây prompt (rubric + few-shot anchors + đề + essay, KHÔNG có PII) → 4. Gọi LLM API (structured output, temperature 0, timeout 60s) → 5. Validate schema output → 6. Lưu scores + feedback + metadata (tokens, model, prompt_version) → 7. Resolve writing_mode → set state (released_ai hoặc pending_review) |
| **Exception** | Timeout/error → retry (max 3, exponential backoff) → vẫn lỗi → state=ai_failed |

### UC-41: Import Reading passage

| Thuộc tính | Chi tiết |
|------------|----------|
| **Actor** | Instructor |
| **Precondition** | Có file docx chứa đề Reading |
| **Main flow** | 1. GV upload docx → 2. Hệ thống parse: bóc passage + câu hỏi + đáp án → 3. Hiển thị preview → 4. GV sửa từng câu nếu cần → 5. Tick checkbox bản quyền → 6. Bấm "Publish" → Passage + Questions được tạo trong DB |
| **Alternative** | Parse sai → GV sửa tay trên preview; nếu quá sai → GV hủy và tạo manual |
| **Postcondition** | Passage mới thuộc sở hữu GV, sẵn sàng giao bài |
