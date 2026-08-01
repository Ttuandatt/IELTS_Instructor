# 🏗️ Component Diagram — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-17  
> **Phiên bản:** 1.2  
> **Ngày tạo:** 2025-02-21  
> **Cập nhật:** 2026-04-14  
> **Trạng thái:** Draft  
> **Tham chiếu:** [12_technical_constraints](12_technical_constraints.md) | [15_sequence_diagrams](15_sequence_diagrams.md)
>
> **Changelog:**
> - v1.2 (2026-04-14): Thêm "Parse Subsystem" subgraph (Mammoth + IELTS Post-Processor + Parse Cache). Gemini hạ xuống fallback-only. Dataflow Import cập nhật. External services table thêm Mammoth primary.
> - v1.1 (2026-04-14): External Services node NLM → Gemini Multimodal. Dataflow "Import source" → "Import DOCX/PDF". External services table cập nhật.

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[🌐 Browser]
    end

    subgraph "Frontend — Next.js App :3000"
        FE_Pages[📄 Pages / App Router]
        FE_Components[🧩 UI Components]
        FE_State[📦 React Query + Context]
        FE_Auth[🔐 Auth Provider]
        FE_i18n[🌍 i18n Provider vi/en]
        FE_Theme[🎨 Theme Provider dark/light]
    end

    subgraph "Backend — NestJS API :3001"
        BE_Gateway[🚪 API Gateway]
        subgraph "Middleware"
            MW_Auth[🔐 JWT Guard]
            MW_RBAC[🛡️ RBAC Guard]
            MW_Rate[⏱️ Rate Limiter]
            MW_Log[📋 Request Logger]
        end
        subgraph "Modules"
            MOD_Auth[Auth Module]
            MOD_Reading[Reading Module]
            MOD_Writing[Writing Module]
            MOD_Dashboard[Dashboard Module]
            MOD_Admin[Admin Module]
            MOD_Import[Import Module]
        end
        subgraph "Services"
            SVC_Grading[📝 Grading Service]
            SVC_Scoring[🤖 Scoring Service]
            SVC_Import[📥 Import Service]
            SVC_Version[📋 Version Service]
        end
        BE_Queue[⚡ BullMQ Producer]
    end

    subgraph "Worker Process"
        W_Consumer[⚡ BullMQ Consumer]
        W_Rules[📏 Rule Engine]
        W_LLM[🤖 LLM Client]
    end

    subgraph "Data Layer"
        PG[(🗄️ PostgreSQL)]
        RD[(📦 Redis)]
    end

    subgraph "External Services"
        LLM_API[🤖 LLM API<br/>OpenAI / Google / Anthropic]
        GEM[📄 Gemini Multimodal<br/>fallback only]
    end

    subgraph "Parse Subsystem"
        MAMMOTH[📘 Mammoth.js<br/>DOCX → HTML]
        IELTS_PP[🔍 IELTS Post-Processor<br/>paragraph labels, blanks, types]
        PARSE_CACHE[(🗃️ Parse Cache<br/>Redis, TTL 24h)]
    end

    Browser --> FE_Pages
    FE_Pages --> FE_Components
    FE_Pages --> FE_State
    FE_Pages --> FE_Auth
    FE_Pages --> FE_i18n
    FE_Pages --> FE_Theme
    FE_State -->|HTTP/Axios| BE_Gateway

    BE_Gateway --> MW_Auth
    BE_Gateway --> MW_RBAC
    BE_Gateway --> MW_Rate
    BE_Gateway --> MW_Log
    MW_Auth --> MOD_Auth
    MW_RBAC --> MOD_Reading
    MW_RBAC --> MOD_Writing
    MW_RBAC --> MOD_Dashboard
    MW_RBAC --> MOD_Admin
    MW_RBAC --> MOD_Import

    MOD_Reading --> SVC_Grading
    MOD_Writing --> BE_Queue
    MOD_Admin --> SVC_Version
    MOD_Import --> SVC_Import

    BE_Queue -->|Enqueue| RD
    RD -->|Dequeue| W_Consumer
    W_Consumer --> W_Rules
    W_Rules --> W_LLM
    W_LLM --> LLM_API
    W_Consumer --> PG

    SVC_Grading --> PG
    SVC_Import --> PARSE_CACHE
    SVC_Import --> MAMMOTH
    MAMMOTH --> IELTS_PP
    IELTS_PP -->|confidence < 0.6| GEM
    SVC_Import -->|PDF only| GEM
    SVC_Import --> RD
    SVC_Version --> PG
    MOD_Auth --> PG
    MOD_Dashboard --> PG
    MW_Rate --> RD
```

---

## 2. Frontend Component Breakdown

```mermaid
graph TB
    subgraph "App Shell"
        Layout[RootLayout]
        Nav[Sidebar / BottomNav]
        Header[Header - logo, user menu, toggles]
    end

    subgraph "Auth Pages"
        LoginPage[/login]
        RegisterPage[/register]
    end

    subgraph "Reading Pages"
        ReadingList[/reading - Catalog]
        ReadingDetail[/reading/:id - Practice]
        ReadingResult[/reading/:id/result/:subId]
        ReadingHistory[/reading/history]
    end

    subgraph "Writing Pages"
        WritingList[/writing - Catalog]
        WritingEditor[/writing/:id - Editor]
        WritingFeedback[/writing/submissions/:id]
        WritingHistory[/writing/history]
    end

    subgraph "Dashboard Pages"
        DashboardMain[/dashboard]
    end

    subgraph "Admin Pages"
        AdminPassages[/admin/passages]
        AdminPassageForm[/admin/passages/new or :id]
        AdminPrompts[/admin/prompts]
        AdminPromptForm[/admin/prompts/new or :id]
        AdminSources[/admin/sources]
        AdminUsers[/admin/users]
    end

    subgraph "Shared Components"
        FilterBar[FilterBar - level, topic, search]
        PaginationC[Pagination]
        ScoreBar[ScoreBar - 0–9 with fill]
        Timer[Timer - countdown]
        WordCounter[WordCounter]
        Card[ContentCard]
        Badge[StatusBadge / LevelBadge]
        Modal[Modal - confirm, import]
        Toast[Toast - notifications]
        Skeleton[Skeleton - loading]
        EmptyState[EmptyState]
    end

    Layout --> Nav
    Layout --> Header
    ReadingList --> FilterBar
    ReadingList --> Card
    ReadingList --> PaginationC
    ReadingDetail --> Timer
    WritingEditor --> WordCounter
    WritingFeedback --> ScoreBar
    AdminPassages --> Modal
```

---

## 3. Backend Module Breakdown

```mermaid
graph TB
    subgraph "Auth Module"
        AuthController[AuthController]
        AuthService[AuthService]
        JwtStrategy[JwtStrategy]
        RolesGuard[RolesGuard]
    end

    subgraph "Reading Module"
        ReadingController[ReadingController]
        ReadingService[ReadingService]
        GradingService[GradingService]
    end

    subgraph "Writing Module"
        WritingController[WritingController]
        WritingService[WritingService]
        ScoringProducer[ScoringProducer - BullMQ]
    end

    subgraph "Scoring Worker - separate process"
        ScoringConsumer[ScoringConsumer]
        RuleEngine[RuleEngine]
        LLMClient[LLMClient]
        LLMAdapter[LLMAdapter - strategy pattern]
    end

    subgraph "Dashboard Module"
        DashboardController[DashboardController]
        ProgressService[ProgressService]
    end

    subgraph "Admin Module"
        AdminController[AdminController]
        ContentService[ContentService]
        VersionService[VersionService]
    end

    subgraph "Import Module"
        ImportController[ImportController]
        ImportService[ImportService]
        SanitizeUtil[SanitizeUtil]
    end

    subgraph "Shared"
        DB_Module[DatabaseModule - Prisma]
        Redis_Module[RedisModule]
        Config_Module[ConfigModule - env vars]
        Logger_Module[LoggerModule - Pino]
    end

    AuthController --> AuthService
    AuthService --> JwtStrategy
    ReadingController --> ReadingService
    ReadingService --> GradingService
    WritingController --> WritingService
    WritingService --> ScoringProducer
    ScoringConsumer --> RuleEngine
    ScoringConsumer --> LLMClient
    LLMClient --> LLMAdapter
    DashboardController --> ProgressService
    AdminController --> ContentService
    AdminController --> VersionService
    ImportController --> ImportService
    ImportService --> SanitizeUtil
```

---

## 4. Data Flow Summary

| Flow | Source | Destination | Protocol | Data |
|------|--------|-------------|----------|------|
| Browse content | FE | BE → PG | HTTP GET | Passage/prompt lists |
| Submit reading | FE | BE → PG | HTTP POST | Answers → score (sync) |
| Submit writing | FE | BE → Redis → Worker → PG | HTTP POST + Queue | Essay → scores (async) |
| Poll status | FE | BE → PG | HTTP GET | Submission status |
| Admin CRUD | FE | BE → PG | HTTP POST/PATCH/DELETE | Content mutations |
| Import DOCX/PDF | FE | BE → Mammoth + IELTS PostProc → (fallback Gemini) → PG | HTTP POST (multipart) | File → passage_html + paragraphs + questions JSON |
| LLM scoring | Worker | LLM API | HTTPS | Rubric prompt → JSON scores |
| Rate limiting | BE | Redis | Redis commands | INCR/GET counters |
| Caching | BE | Redis | Redis commands | GET/SET with TTL |

---

## 5. Deployment Architecture (Local Dev)

```
┌─────────────────────────────────────────────────┐
│                 Developer Machine                │
│                                                  │
│  ┌──────────────┐    ┌──────────────┐           │
│  │  Next.js FE  │    │  NestJS BE   │           │
│  │   :3000      │───►│   :3001      │           │
│  └──────────────┘    └──────┬───────┘           │
│                             │                    │
│         ┌───────────────────┼───────────────┐   │
│         │                   │               │   │
│         ▼                   ▼               │   │
│  ┌────────────┐     ┌────────────┐          │   │
│  │ PostgreSQL  │     │   Redis    │          │   │
│  │  :5432      │     │   :6379    │          │   │
│  │ (Docker)    │     │  (Docker)  │          │   │
│  └────────────┘     └────────────┘          │   │
│                                              │   │
│  ┌─────────────────────────┐                │   │
│  │  BullMQ Worker Process  │────────────────┘   │
│  │  (same or separate)     │                    │
│  └─────────────────────────┘                    │
│                                                  │
│  ┌──────────────────────────────────────┐       │
│  │  VS Code Dev Tunnel (for sharing)    │       │
│  │  https://<id>.devtunnels.ms          │       │
│  └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
                    │
                    ▼
        ┌────────────────────┐
        │  External APIs     │
        │  - OpenAI/Google   │
        │  - Gemini Multimodal│
        └────────────────────┘
```

---

## 6. Technology Stack Map

| Component | Technology | Port | Container |
|-----------|-----------|------|-----------|
| Frontend | Next.js 14 + React 18 + TypeScript | 3000 | No (native) |
| Backend API | NestJS 10 + TypeScript | 3001 | No (native) |
| Worker | NestJS (standalone or same process) | — | No |
| Database | PostgreSQL 15 | 5432 | Yes (Docker) |
| Cache/Queue | Redis 7 | 6379 | Yes (Docker) |
| LLM | OpenAI / Google / Anthropic SDK | — | External API |
| DOCX/PDF Parser (Primary) | Mammoth.js + sanitize-html (npm libs) | — | Local library |
| DOCX/PDF Parser (Fallback) | Google Gemini Multimodal API | — | External API |

---

> **Tham chiếu:** [12_technical_constraints](12_technical_constraints.md) | [09_api_specifications](09_api_specifications.md) | [08_data_requirements](08_data_requirements.md)

---

# ══════════════════════════════════════════════════════
# BỔ SUNG TỪ BUSINESS ANALYSIS & REDESIGN (07/2026)
# Các mục dưới đây bổ sung từ BA 6 vòng elicitation,
# phân tích đối thủ, và thiết kế state machine mới.
# Khi có mâu thuẫn với nội dung trên, phần này được ưu tiên.
# ══════════════════════════════════════════════════════

# Component Diagram
## Dự án Langy

> **Phiên bản:** 1.0
> **Ngày tạo:** 06/07/2026

---

## 1. System Architecture

```mermaid
C4Context
    title Langy — System Context

    Person(gv, "Giáo viên IELTS", "Tạo lớp, giao bài, review AI")
    Person(hs, "Học sinh", "Làm bài, xem feedback")

    System(langy, "Langy Platform", "Web app giao bài + chấm AI IELTS")

    System_Ext(gemini, "Google Gemini API", "LLM chấm Writing (primary)")
    System_Ext(openai, "OpenAI API", "LLM chấm Writing (fallback)")
    System_Ext(email, "Email Service", "Reset password, thông báo")

    Rel(gv, langy, "Quản lý lớp, review bài", "HTTPS")
    Rel(hs, langy, "Làm bài, xem feedback", "HTTPS")
    Rel(langy, gemini, "Chấm essay", "REST API")
    Rel(langy, openai, "Fallback chấm", "REST API")
    Rel(langy, email, "Gửi email", "SMTP")
```

---

## 2. Backend Component Diagram

```mermaid
graph TB
    subgraph Frontend["Frontend (Next.js 14)"]
        FE_AUTH["Auth Pages<br/>(login, register)"]
        FE_CLASS["Classroom Pages<br/>(create, manage, assign)"]
        FE_WRIT["Writing Pages<br/>(editor, feedback, history)"]
        FE_READ["Reading Pages<br/>(test player, history)"]
        FE_DASH["Dashboard Pages<br/>(instructor, learner)"]
        FE_IMPORT["Import Pages<br/>(upload, preview)"]
        FE_LANDING["Landing Page<br/>(SEO, register CTA)"]
    end

    subgraph API["Backend API (NestJS)"]
        direction TB
        AUTH["Auth Module<br/>register, login, JWT"]
        CLASS["Classroom Module<br/>CRUD, invite, members"]
        LESSON["Lesson Module<br/>assignment, due_at"]
        WRIT["Writing Module<br/>submit, history, feedback"]
        READ["Reading Module<br/>submit, score, attempts"]
        IMPORT["Upload Module<br/>docx parse, ImportJob"]
        DASH["Dashboard Module<br/>stats, review-queue"]
        SCORING["Scoring Module<br/>producer (enqueue)"]
        INSTRUCTOR["Instructor Module<br/>review-queue, finalize"]
        ADMIN["Admin Module<br/>user mgmt, content"]
        PRISMA_SVC["Prisma Service<br/>DB connection"]
    end

    subgraph Worker["Worker Process"]
        CONSUMER["BullMQ Consumer<br/>job processing"]
        LLM_CLIENT["LLM Client Service<br/>Gemini + OpenAI adapter"]
        VALIDATOR["Schema Validator<br/>score range, JSON shape"]
        STATE_RESOLVER["State Resolver<br/>writing_mode → state"]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        REDIS[(Redis)]
    end

    subgraph External["External APIs"]
        GEMINI["Google Gemini<br/>gemini-2.5-flash/pro"]
        OPENAI["OpenAI<br/>gpt-4o-mini"]
    end

    FE_AUTH --> AUTH
    FE_CLASS --> CLASS
    FE_CLASS --> LESSON
    FE_WRIT --> WRIT
    FE_WRIT --> SCORING
    FE_READ --> READ
    FE_DASH --> DASH
    FE_IMPORT --> IMPORT

    AUTH --> PRISMA_SVC
    CLASS --> PRISMA_SVC
    LESSON --> PRISMA_SVC
    WRIT --> PRISMA_SVC
    READ --> PRISMA_SVC
    DASH --> PRISMA_SVC
    INSTRUCTOR --> PRISMA_SVC
    SCORING --> REDIS

    PRISMA_SVC --> PG

    REDIS --> CONSUMER
    CONSUMER --> LLM_CLIENT
    LLM_CLIENT --> GEMINI
    LLM_CLIENT --> OPENAI
    CONSUMER --> VALIDATOR
    CONSUMER --> STATE_RESOLVER
    CONSUMER --> PRISMA_SVC

    style Worker fill:#fff3cd
    style External fill:#f0f0f0
```

---

## 3. NestJS Module Structure (hiện có trong repo)

```
apps/backend/src/
├── main.ts                    # Bootstrap
├── app.module.ts              # Root module
├── prisma/                    # Prisma service + schema
├── auth/                      # JWT auth, register, login
├── admin/                     # Admin CRUD (users, content)
├── classroom/                 # Classroom + members + invite
├── lesson/                    # Lesson CRUD + assignment
├── writing/                   # Writing submissions + prompts
├── reading/                   # Reading passages + submissions
├── scoring/                   # BullMQ producer + consumer
│   ├── scoring.producer.ts    #   Enqueue job
│   ├── scoring.consumer.ts    #   Process job
│   ├── llm-client.service.ts  #   Gemini/OpenAI adapter
│   ├── rubric.prompt.ts       #   Prompt template
│   └── schema-validator.ts    #   Output validation
├── instructor/                # Review queue, finalize
├── dashboard/                 # Stats endpoints
├── topic/                     # Topic management
├── upload/                    # Docx import pipeline
├── notification/              # Notification service
└── seeds/                     # Seed data scripts
```

---

## 4. Frontend Route Structure

```
apps/frontend/src/app/
├── page.tsx                   # Landing page (HS tự ôn)
├── login/                     # Auth
├── register/                  # Auth + consent
├── settings/                  # Profile + delete account
├── reading/
│   ├── page.tsx               # Reading list (kho đề)
│   ├── [id]/                  # Test player
│   └── attempts/[id]/         # Xem lại bài cũ
├── writing/
│   ├── page.tsx               # Writing list (kho đề)
│   ├── [id]/                  # Editor + submit
│   └── history/               # Lịch sử
├── classrooms/
│   ├── page.tsx               # Danh sách lớp (GV)
│   └── [id]/                  # Chi tiết lớp + members
├── instructor/
│   ├── page.tsx               # Review queue
│   └── dashboard/             # Dashboard GV
└── dashboard/                 # Dashboard HS cá nhân
```

---

## 5. Data Flow Summary

```mermaid
flowchart LR
    HS["Học sinh"] -->|viết essay| FE["Frontend"]
    FE -->|POST /submissions| API["NestJS API"]
    API -->|enqueue| Redis["Redis Queue"]
    Redis -->|job| Worker["Worker"]
    Worker -->|prompt| LLM["Gemini/OpenAI"]
    LLM -->|JSON scores| Worker
    Worker -->|save| DB["PostgreSQL"]
    DB -->|query| API
    API -->|feedback| FE
    FE -->|hiển thị| HS

    GV["Giáo viên"] -->|review| FE2["Frontend"]
    FE2 -->|GET review-queue| API
    FE2 -->|POST finalize| API
    API -->|save calibration| DB
```
