# 📘 IELTS Helper

**Ứng dụng luyện thi IELTS Reading & Writing thông minh** — hỗ trợ người học tự luyện, chấm bài tự động, và phản hồi chi tiết bằng AI.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-e0234e?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## 🎯 Giới thiệu

IELTS Helper giải quyết 3 vấn đề lớn của người luyện thi IELTS:

| Vấn đề | Giải pháp |
|---------|-----------|
| **Chờ đợi phản hồi** — Gửi bài Writing cho giảng viên, chờ 2–3 ngày | Chấm bài AI trong vài phút, phản hồi chi tiết theo 4 tiêu chí IELTS |
| **Không biết sai ở đâu** — Làm Reading xong chỉ biết đúng/sai | Giải thích từng câu, hiển thị đáp án đúng ngay sau khi nộp bài |
| **Tài liệu rải rác** — Passage trên web A, đề Writing trên web B | Tất cả tập trung trong 1 ứng dụng, phân loại theo level CEFR |

---

## 👥 Đối tượng sử dụng

### 🎓 Learner (Người học)
- Luyện Reading với passage phân loại theo level (A2 → C1), timer giống thi thật
- Luyện Writing Task 1 & Task 2, nhận feedback AI tức thì
- Theo dõi tiến bộ qua dashboard với biểu đồ & lịch sử bài làm

### 👨‍🏫 Instructor (Giảng viên)
- Xem danh sách người học và kết quả bài nộp
- Review bài Writing đã được AI chấm sơ bộ, giảm ~60% thời gian chấm
- Theo dõi tiến bộ của từng learner tập trung tại 1 nơi

### 🛡️ Admin (Quản trị viên)
- Quản lý nội dung: tạo/sửa/xóa passage + questions, writing prompts
- Quản lý người dùng: phân quyền, tìm kiếm, thay đổi role
- Xem thống kê hệ thống tổng quan (users, submissions, content)

---

## ✨ Tính năng chính

### Reading Practice
- 📖 Danh sách passage phân loại theo CEFR level (A2, B1, B2, C1)
- ❓ Hỗ trợ câu hỏi MCQ (trắc nghiệm) và Short Answer (điền đáp án)
- ✅ Chấm bài tự động ngay khi nộp — hiển thị điểm %, số câu đúng/sai
- 📊 Lịch sử bài làm với thống kê chi tiết

### Writing Practice
- ✍️ Đề bài Task 1 & Task 2 phân loại theo level
- 📝 Trình soạn bài luận với bộ đếm từ real-time
- 🤖 AI chấm bài theo 4 tiêu chí IELTS (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range)
- 💬 Feedback chi tiết: điểm mạnh, cần cải thiện, gợi ý cụ thể

### Role-Based Access Control (RBAC)
- 🔒 Phân quyền 3 cấp: Learner → Instructor → Admin
- 🧭 Sidebar & Dashboard tự động thay đổi theo role
- 🛡️ API endpoints bảo vệ bởi JWT + RolesGuard

### Đa ngôn ngữ
- 🇻🇳 Tiếng Việt
- 🇬🇧 English
- Chuyển đổi ngôn ngữ real-time, không cần reload

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React, TypeScript | App Router, SSR/SSG, Turbopack |
| **UI State** | TanStack React Query | Server state management, caching |
| **HTTP Client** | Axios | JWT interceptors, auto refresh token |
| **Backend** | NestJS 10, TypeScript | REST API, modular architecture |
| **ORM** | Prisma 6 | Type-safe database access, migrations |
| **Database** | PostgreSQL 15 | Primary data store |
| **Cache** | Redis 7 | Session cache, rate limiting |
| **Auth** | JWT (access + refresh token) | Stateless authentication |
| **AI** | OpenAI / Google Gemini | Writing scoring (hybrid rule + LLM) |
| **Infra** | Docker Compose | Local development environment |

---

## 📁 Cấu trúc dự án

```
IELTS_Instructor/
├── apps/
│   ├── backend/                 # NestJS 10 — API server (port 3001)
│   │   ├── prisma/              # Schema + migrations
│   │   └── src/
│   │       ├── auth/            # Authentication (JWT, register, login)
│   │       ├── admin/           # Admin CRUD (passages, prompts, users)
│   │       ├── instructor/      # Instructor features (learners, submissions)
│   │       ├── dashboard/       # Learner dashboard stats
│   │       ├── reading/         # Reading practice + auto-grading
│   │       ├── writing/         # Writing practice + AI scoring
│   │       └── prisma/          # PrismaService
│   │
│   └── frontend/                # Next.js 16 — Web app (port 3000)
│       └── src/
│           ├── app/
│           │   ├── admin/       # Admin pages (passages, prompts, users)
│           │   ├── instructor/  # Instructor pages (learners, submissions)
│           │   ├── reading/     # Reading practice + history
│           │   ├── writing/     # Writing practice + history
│           │   ├── dashboard/   # Role-specific dashboards
│           │   └── settings/    # User preferences
│           ├── components/      # Shared components (Sidebar, Header)
│           ├── i18n/            # en.json, vi.json
│           └── providers/       # Auth, i18n, React Query providers
│
├── docs/                        # Documentation
│   ├── GETTING_STARTED.md       # Setup guide (chi tiết từng bước)
│   ├── step1_business_idea/     # Business requirements
│   ├── step2_lowcode/           # UI wireframes, data flows
│   ├── step3_prd/               # PRD (17 files + OpenAPI spec)
│   └── step4_implementation_plan/ # Sprint plan, testing guide
│
├── docker-compose.yml           # PostgreSQL 15 + Redis 7
└── README.md                    # 📌 File này
```

---

## ⚡ Quick Start

> Xem hướng dẫn chi tiết tại [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md)

```bash
# 1. Clone & cài đặt
git clone https://github.com/Ttuandatt/IELTS_Instructor.git
cd IELTS_Instructor

# 2. Khởi động PostgreSQL + Redis
docker compose up -d

# 3. Backend
cd apps/backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run seed                    # Tạo tài khoản admin
npm run start:dev               # → http://localhost:3001

# 4. Frontend (terminal mới)
cd apps/frontend
npm install
npm run dev                     # → http://localhost:3000

# 5. Đăng nhập
#    Email: admin@ieltshelper.local
#    Password: Admin1234!
```

---

## 🗄️ Database Schema

```
┌──────────┐     ┌───────────┐     ┌──────────────────────┐
│  users   │────▶│ passages  │────▶│ submissions_reading   │
│          │     │           │     │ (auto-graded)         │
│ id       │     │ id        │     └──────────────────────┘
│ email    │     │ title     │
│ role     │     │ body      │     ┌──────────────────────┐
│ ...      │     │ level     │     │ questions            │
└──────────┘     │ status    │────▶│ (MCQ / short answer) │
     │           └───────────┘     └──────────────────────┘
     │
     │           ┌───────────┐     ┌──────────────────────┐
     └──────────▶│ prompts   │────▶│ submissions_writing   │
                 │           │     │ (AI-scored)           │
                 │ task_type │     └──────────────────────┘
                 │ level     │
                 └───────────┘
```

**5 models** — User, Passage, Question, Prompt, ReadingSubmission, WritingSubmission  
**6 enums** — CefrLevel, ContentStatus, QuestionType, TaskType, ModelTier, ProcessingStatus

---

## 🔑 API Endpoints

| Module | Method | Endpoint | Auth |
|--------|--------|----------|------|
| **Auth** | POST | `/api/auth/register` | Public |
| | POST | `/api/auth/login` | Public |
| | POST | `/api/auth/refresh` | Public |
| | GET | `/api/auth/profile` | JWT |
| **Reading** | GET | `/api/reading/passages` | JWT |
| | GET | `/api/reading/passages/:id` | JWT |
| | POST | `/api/reading/passages/:id/submit` | JWT |
| | GET | `/api/reading/history` | JWT |
| **Writing** | GET | `/api/writing/prompts` | JWT |
| | GET | `/api/writing/prompts/:id` | JWT |
| | POST | `/api/writing/prompts/:id/submit` | JWT |
| | GET | `/api/writing/history` | JWT |
| **Dashboard** | GET | `/api/dashboard/stats` | JWT |
| **Admin** | GET/POST/PATCH/DELETE | `/api/admin/passages/*` | Admin |
| | GET/POST/PATCH/DELETE | `/api/admin/prompts/*` | Admin |
| | GET/PATCH/DELETE | `/api/admin/users/*` | Admin |
| **Instructor** | GET | `/api/instructor/learners` | Instructor+ |
| | GET | `/api/instructor/writing-submissions` | Instructor+ |
| | GET | `/api/instructor/reading-submissions` | Instructor+ |

---

## 📚 Tài liệu

| Tài liệu | Mô tả |
|-----------|--------|
| [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md) | Hướng dẫn cài đặt chi tiết cho người mới |
| [`docs/step3_prd/`](docs/step3_prd/) | PRD đầy đủ (17 files): user stories, data model, API spec |
| [`docs/step4_implementation_plan/`](docs/step4_implementation_plan/) | Sprint plan, testing guide, CLI commands |

---

## 🛣️ Roadmap

- [x] Sprint 0: Scaffolding (monorepo, Docker, Prisma, auth)
- [x] Sprint 1: Auth + App Shell (login, register, role picker, sidebar)
- [x] Sprint 2: Role-based features (DB schema, RBAC, full CRUD, 19 frontend routes)
- [ ] Sprint 3: AI Writing Scoring (BullMQ pipeline, LLM integration, 4-criteria TR/CC/LR/GRA feedback UI)
- [ ] Sprint 4: Reading enhancements (timer chuẩn IELTS, Practice/Simulation modes, explanation per question)
- [ ] Sprint 5: Instructor review workflow (comment, override AI score, notifications)
- [ ] Sprint 6: Performance & polish (caching, pagination, social proof stats, responsive refinement)

> **📌 Reference site:** [ieltsonlinetests.com](https://ieltsonlinetests.com/) — Phân tích chi tiết tại [`docs/ielts_online_tests_analysis.md`](docs/ielts_online_tests_analysis.md)

---

## 📄 License

Private — All rights reserved.
