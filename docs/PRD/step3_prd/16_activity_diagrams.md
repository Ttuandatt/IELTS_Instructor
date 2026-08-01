# 🔀 Activity Diagrams — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-16  
> **Phiên bản:** 1.2  
> **Ngày tạo:** 2025-02-21  
> **Cập nhật:** 2026-04-14  
> **Trạng thái:** Draft  
> **Tham chiếu:** [04_user_stories](04_user_stories.md) | [14_usecase_diagram](14_usecase_diagram.md)
>
> **Changelog:**
> - v1.2 (2026-04-14): AD-05 cập nhật hybrid flow: Redis cache → Mammoth primary + IELTS post-processor → confidence gate → Gemini fallback. Thêm nhánh PDF tự động vào Gemini. Preview panel có warnings banner.
> - v1.1 (2026-04-14): Rewrite AD-05 thành DOCX/PDF Import Flow (file validation → Gemini parse → HTML sanitize → schema validate → draft passage + questions).

---

## AD-01: Reading Practice Flow (Learner)

```mermaid
flowchart TD
    A([Start]) --> B[Navigate to /reading]
    B --> C[Browse passage catalog]
    C --> D{Apply filters?}
    D -->|Yes| E[Select level / topic]
    E --> C
    D -->|No| F[Select passage]
    F --> G[Load passage + questions]
    G --> H{Start timer?}
    H -->|Yes| I[Select duration & start countdown]
    H -->|No| J[No timer mode]
    I --> K[Read passage & answer questions]
    J --> K
    K --> L{Timer expired?}
    L -->|Yes| M[Auto-submit with timed_out=true]
    L -->|No| N{Answered ≥80%?}
    N -->|No| O[Show warning: answer more questions]
    O --> K
    N -->|Yes| P[Click Submit]
    P --> Q[Send answers to backend]
    M --> Q
    Q --> R[Auto-grade each answer]
    R --> S[Calculate score %]
    S --> T[Save submission]
    T --> U[Display results]
    U --> V{User action?}
    V -->|Retry| G
    V -->|Back to catalog| C
    V -->|View history| W[Show reading history]
    W --> X([End])
    V -->|Done| X
```

---

## AD-02: Writing Practice Flow (Learner)

```mermaid
flowchart TD
    A([Start]) --> B[Navigate to /writing]
    B --> C[Browse prompt catalog]
    C --> D{Apply filters?}
    D -->|Yes| E[Select task type / level / topic]
    E --> C
    D -->|No| F[Select prompt]
    F --> G[Load prompt + editor]
    G --> H[Write essay in editor]
    H --> I[Live word count updates]
    I --> J{Word count ≥ min?}
    J -->|No| K[Show warning - below minimum]
    J -->|Yes| L[Word count turns green]
    K --> M{Continue writing?}
    M -->|Yes| H
    M -->|No - submit anyway| N[Select model tier]
    L --> N
    N --> O{Check daily rate limit}
    O -->|Exceeded| P[Show 429: limit reached]
    P --> Q([End])
    O -->|Within limit| R[Click Submit]
    R --> S[POST to backend - 202 Accepted]
    S --> T[Show scoring progress card]
    T --> U[Poll GET /submissions/id every 3s]
    U --> V{Status?}
    V -->|pending| U
    V -->|done| W[Display scores + feedback]
    V -->|failed| X[Show error + retry button]
    X --> Y{Retry?}
    Y -->|Yes| R
    Y -->|No| Q
    W --> Z{User action?}
    Z -->|Write again| G
    Z -->|View history| AA[Show writing history]
    AA --> Q
    Z -->|Done| Q
```

---

## AD-03: Writing Scoring Pipeline (System)

```mermaid
flowchart TD
    A([Job dequeued from BullMQ]) --> B[Load submission from DB]
    B --> C[Run rule checks]
    C --> C1{Word count check}
    C1 -->|Below min| C2[Flag: low word count]
    C1 -->|Above min| C3[Pass]
    C2 --> C4{Prompt plagiarism check}
    C3 --> C4
    C4 -->|>60% overlap| C5[Flag: possible copy-paste]
    C4 -->|<60%| C6[Pass]
    C5 --> D[Build LLM prompt with flags]
    C6 --> D
    D --> E[Call LLM API with rubric + essay + context]
    E --> F{LLM response received?}
    F -->|Timeout| G{Retries left?}
    F -->|Error 5xx| G
    F -->|Success| H[Parse response]
    G -->|Yes| I[Wait backoff period]
    I --> E
    G -->|No| J[Mark submission failed]
    J --> K[Move to DLQ]
    K --> L([End - Failed])
    H --> M{Valid JSON?}
    M -->|No| N{Retries left?}
    N -->|Yes| O[Retry with JSON instruction]
    O --> E
    N -->|No| J
    M -->|Yes| P[Extract TR, CC, LR, GRA scores]
    P --> Q[Calculate overall = round avg to 0.5]
    Q --> R[Extract feedback: summary, strengths, improvements]
    R --> S[Update submission in DB]
    S --> S1[Set scores, feedback, model_name]
    S1 --> S2[Set turnaround_ms, scored_at]
    S2 --> S3[Set processing_status = done]
    S3 --> T([End - Success])
```

---

## AD-04: Admin Content Publishing Flow

```mermaid
flowchart TD
    A([Admin logged in]) --> B[Navigate to /admin/passages or /admin/prompts]
    B --> C[View content list]
    C --> D{Action?}
    D -->|Create new| E[Fill content form]
    D -->|Edit existing| F[Load content into form]
    D -->|Delete| G[Show confirm dialog]
    D -->|Publish/Unpublish| H{Current status?}
    
    E --> I[Enter title, body/prompt, level, tags]
    I --> J{Add questions? - passages only}
    J -->|Yes| K[Add question type, prompt, options, answer key]
    K --> J
    J -->|No| L[Save as draft]
    L --> M[Record content version v1 action=create]
    M --> C

    F --> N[Edit fields]
    N --> O[Save changes]
    O --> P[Record content version v+1 action=update]
    P --> C

    G --> G1{Confirm delete?}
    G1 -->|Yes| G2[Delete content + cascade questions]
    G2 --> G3[Record content version action=delete]
    G3 --> C
    G1 -->|No| C

    H -->|draft| H1{Has required fields?}
    H1 -->|Yes - title, body, ≥1 question| H2[Set status=published]
    H1 -->|No| H3[Show validation errors]
    H3 --> C
    H2 --> H4[Record version action=publish]
    H4 --> C
    H -->|published| H5[Set status=draft]
    H5 --> H6[Record version action=unpublish]
    H6 --> C
```

---

## AD-05: DOCX/PDF Import Flow (Hybrid Mammoth + Gemini Fallback)

```mermaid
flowchart TD
    A([Admin clicks Upload DOCX/PDF]) --> B[Show import modal]
    B --> C[Select .docx or .pdf file]
    C --> D[Enter title, level, tags]
    D --> E[Click Parse button]
    E --> F{Validate file type & size}
    F -->|Invalid type| G[Show 400 error]
    F -->|Too large >10MB| H[Show 413 error]
    F -->|Valid| I[POST /reading/parse-docx]
    I --> J[Compute SHA-256 file hash]
    J --> K{Redis cache hit?}
    K -->|Yes| S[Use cached parse result]
    K -->|No| L{File type?}
    L -->|DOCX| M[Mammoth convert → HTML + styles]
    M --> N[IELTS post-processor:<br/>paragraph labels, question groups, blanks]
    N --> O{Confidence ≥ 0.6?}
    O -->|Yes| P[parser_used = mammoth]
    O -->|No| Q[Gemini fallback]
    L -->|PDF| Q
    Q --> R[parser_used = gemini; normalize schema]
    P --> T[sanitize-html body_html]
    R --> T
    T --> U[Validate schema + blank_refs]
    U --> V{Valid?}
    V -->|No| W[Show parse error + warnings]
    V -->|Yes| X[Cache result in Redis TTL=24h]
    X --> S
    S --> Y[Create SourceDocument row]
    Y --> Z[Create draft Passage + Questions]
    Z --> AA[Display preview: passage split-view + questions + warnings banner]
    AA --> AB{Admin action}
    AB -->|Save Draft| AC[Commit as draft]
    AB -->|Edit & Save| AD[PATCH passage/questions]
    AB -->|Discard| AE[Rollback DB inserts]
    AC --> AF[Success toast]
    AD --> AF
    AE --> AF
    AF --> AG([End])
    G --> AG
    H --> AG
    W --> AG
```

---

## AD-06: Authentication Flow

```mermaid
flowchart TD
    A([User opens app]) --> B{Has valid access token?}
    B -->|Yes| C[Load dashboard/last page]
    B -->|No| D{Has refresh token?}
    D -->|Yes| E[POST /auth/refresh]
    E --> F{Refresh successful?}
    F -->|Yes| G[Store new tokens]
    G --> C
    F -->|No - expired| H[Clear tokens]
    H --> I[Redirect to /login]
    D -->|No| I
    I --> J{Has account?}
    J -->|Yes| K[Login form]
    J -->|No| L[Register form]
    K --> M[POST /auth/login]
    M --> N{Valid credentials?}
    N -->|Yes| O[Store tokens]
    O --> C
    N -->|No| P[Show error]
    P --> K
    L --> Q[POST /auth/register]
    Q --> R{Registration successful?}
    R -->|Yes| O
    R -->|No - duplicate email| S[Show error]
    S --> L
```

---

## AD-07: Dashboard View Flow

```mermaid
flowchart TD
    A([Navigate to /dashboard]) --> B[Fetch GET /me/progress]
    B --> C{Has any submissions?}
    C -->|No| D[Show welcome empty state]
    D --> E{User clicks CTA?}
    E -->|Practice Reading| F[Navigate to /reading]
    E -->|Practice Writing| G[Navigate to /writing]
    C -->|Yes| H[Display stat cards]
    H --> I[Reading: avg score, completion rate, total]
    H --> J[Writing: avg scores per criterion, total]
    H --> K[Recent submissions timeline]
    K --> L[Fetch GET /me/progress/trends?period=4w]
    L --> M[Display trend chart]
    M --> N{User interaction?}
    N -->|Click submission| O[Navigate to result detail]
    N -->|Change period| P[Re-fetch trends]
    P --> M
    N -->|Navigate away| Q([End])
    F --> Q
    G --> Q
    O --> Q
```

---

> **Tham chiếu:** [04_user_stories](04_user_stories.md) | [14_usecase_diagram](14_usecase_diagram.md) | [15_sequence_diagrams](15_sequence_diagrams.md)

---

# ══════════════════════════════════════════════════════
# BỔ SUNG TỪ BUSINESS ANALYSIS & REDESIGN (07/2026)
# Các mục dưới đây bổ sung từ BA 6 vòng elicitation,
# phân tích đối thủ, và thiết kế state machine mới.
# Khi có mâu thuẫn với nội dung trên, phần này được ưu tiên.
# ══════════════════════════════════════════════════════

# Activity Diagrams
## Dự án Langy

> **Phiên bản:** 1.0
> **Ngày tạo:** 06/07/2026

---

## 1. Writing Submission — State Machine

```mermaid
stateDiagram-v2
    [*] --> draft: HS tạo draft

    draft --> submitted: HS nộp bài

    submitted --> ai_scored: Worker chấm xong
    submitted --> ai_failed: Lỗi sau 3 retry

    ai_scored --> released_ai: Chế độ A hoặc tự học
    ai_scored --> pending_review: Chế độ B

    released_ai --> finalized: GV chốt điểm
    pending_review --> finalized: GV chốt điểm
    ai_failed --> finalized: GV chấm tay
    ai_failed --> submitted: GV bấm "chấm lại"

    finalized --> [*]

    note right of released_ai
        HS thấy feedback AI
        Nhãn "ước lượng"
    end note

    note right of pending_review
        Chỉ GV thấy feedback
        HS thấy "đang chờ GV"
    end note

    note right of finalized
        Trạng thái hút
        Không thoát ra
    end note
```

### Bất biến (invariants):
1. Bài tự học (lesson_id = null) KHÔNG BAO GIỜ vào pending_review hoặc finalized
2. Đổi writing_mode của lớp KHÔNG đổi state của submission cũ
3. finalized là trạng thái hút — không có transition ra

---

## 2. Luồng tổng thể — GV giao bài đến HS nhận feedback

```mermaid
flowchart TD
    A[GV tạo lớp + chọn chế độ A/B] --> B[GV import đề hoặc chọn từ kho]
    B --> C[GV giao bài cho lớp + đặt deadline]
    C --> D[HS thấy bài trong 'Bài tập của tôi']
    D --> E[HS viết bài Writing]
    E --> F{Nộp bài?}
    F -- Chưa --> G[Auto-save draft mỗi 30s]
    G --> E
    F -- Nộp --> H[Hệ thống enqueue AI]
    H --> I{AI chấm thành công?}
    I -- Lỗi sau 3 retry --> J[state = ai_failed]
    J --> K{GV quyết định}
    K -- Chấm lại --> H
    K -- Chấm tay --> L[state = finalized]
    I -- Thành công --> M{Chế độ lớp?}
    M -- A: instant --> N[state = released_ai]
    M -- B: review_first --> O[state = pending_review]
    N --> P{GV review?}
    O --> P
    P -- Đồng ý AI --> L
    P -- Sửa band --> Q[Lưu instructor_scores]
    Q --> L
    L --> R[HS thấy feedback cuối cùng]

    style N fill:#d4edda
    style O fill:#e2d5f1
    style L fill:#d4edda
    style J fill:#f8d7da
```

---

## 3. Luồng HS tự ôn (self-study)

```mermaid
flowchart TD
    A[HS truy cập landing page] --> B[Đăng ký tự do, không mã lớp]
    B --> C{Tuổi < 16?}
    C -- Có --> D[Xác nhận phụ huynh]
    C -- Không --> E[Chấp thuận ToS]
    D --> E
    E --> F[Đăng nhập → Trang chủ]
    F --> G{Chọn hoạt động}
    G -- Reading --> H[Chọn đề từ kho]
    H --> I[Làm bài]
    I --> J[Chấm tự động + giải thích]
    J --> K[Xem dashboard cá nhân]
    G -- Writing --> L[Chọn prompt từ kho]
    L --> M[Viết bài + auto-save]
    M --> N[Nộp → AI chấm]
    N --> O[Feedback ngay, nhãn ước lượng]
    O --> P[Gợi ý: tham gia lớp GV]
    O --> K

    style O fill:#d4edda
    style P fill:#fff3cd
```

---

## 4. Import đề Reading

```mermaid
flowchart TD
    A[GV upload file .docx] --> B[Hệ thống parse]
    B --> C{Parse thành công?}
    C -- Lỗi --> D[Thông báo lỗi định dạng]
    D --> A
    C -- OK --> E[Hiển thị Preview]
    E --> F{GV kiểm tra}
    F -- Sai --> G[GV sửa câu hỏi/đáp án trên preview]
    G --> F
    F -- OK --> H{Tick checkbox bản quyền?}
    H -- Chưa --> H
    H -- Đã tick --> I[Bấm Publish]
    I --> J[Tạo Passage + Questions trong DB]
    J --> K[Đề sẵn sàng giao bài]

    style K fill:#d4edda
    style D fill:#f8d7da
```

---

## 5. Xóa tài khoản

```mermaid
flowchart TD
    A[Người dùng vào Settings] --> B[Bấm 'Xóa tài khoản']
    B --> C[Dialog xác nhận: nhập email để confirm]
    C --> D{Email khớp?}
    D -- Sai --> C
    D -- Đúng --> E[Xóa mềm: đánh dấu deleted_at]
    E --> F[Đăng xuất ngay]
    F --> G[7 ngày chờ]
    G --> H{Đăng nhập lại trong 7 ngày?}
    H -- Có --> I[Hủy xóa, khôi phục tài khoản]
    H -- Không --> J[Cron job: xóa cứng toàn bộ dữ liệu]
    J --> K[Tài khoản + bài làm biến mất vĩnh viễn]

    style J fill:#f8d7da
    style I fill:#d4edda
```
