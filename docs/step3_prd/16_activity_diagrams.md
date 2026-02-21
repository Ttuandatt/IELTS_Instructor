# 🔀 Activity Diagrams — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-16  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [04_user_stories](04_user_stories.md) | [14_usecase_diagram](14_usecase_diagram.md)

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

## AD-05: NotebookLM Import Flow

```mermaid
flowchart TD
    A([Admin clicks Import]) --> B[Show import modal]
    B --> C[Enter NotebookLM URL]
    C --> D[Enter title, level, tags]
    D --> E[Click Import button]
    E --> F{Check Redis cache}
    F -->|Cache hit| G[Use cached content]
    F -->|Cache miss| H[Fetch from NotebookLM URL]
    H --> I{Fetch successful?}
    I -->|No - network error| J[Show error in modal]
    J --> K{Retry?}
    K -->|Yes| H
    K -->|No| L[Close modal]
    I -->|Yes| M[Sanitize HTML content]
    M --> N[Cache in Redis TTL=30min]
    N --> G
    G --> O[Create source record]
    O --> P[Split content into snippets]
    P --> Q[Save snippets to DB]
    Q --> R[Display snippet list in modal]
    R --> S{Attach to content?}
    S -->|Yes| T[Select target passage/prompt]
    T --> U[Attach source + snippets]
    U --> V[Show confirmation]
    S -->|No - later| V
    V --> W[Close modal]
    W --> X([End])
    L --> X
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
