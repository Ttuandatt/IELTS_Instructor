# 📋 Executive Summary — IELTS Helper

> **Mã tài liệu:** PRD-01  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tác giả:** IELTS Helper Team  

---

## 1. Tổng quan dự án

### 1.1 Tầm nhìn (Vision)

> Xây dựng nền tảng luyện thi IELTS Reading & Writing thông minh, giúp người học nhận phản hồi nhanh, chính xác theo rubric, và hỗ trợ giảng viên/admin quản lý nội dung hiệu quả thông qua tích hợp NotebookLM.

### 1.2 Mô tả ngắn gọn

**IELTS Helper** là ứng dụng web hỗ trợ luyện thi IELTS cho kỹ năng Reading và Writing (pha 1), với kế hoạch mở rộng sang Listening và Speaking trong các pha tiếp theo. Ứng dụng sử dụng kết hợp rule-based checks và AI (LLM) để chấm điểm Writing theo đúng rubric IELTS (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy), đồng thời tự động chấm Reading với giải thích chi tiết cho từng câu hỏi.

### 1.3 Bối cảnh dự án

Hiện tại, người học IELTS gặp nhiều khó khăn:

- **Phản hồi Writing chậm:** Giảng viên thường mất 1–3 ngày để chấm và phản hồi một bài viết, khiến người học mất động lực.
- **Tỷ lệ hoàn thành Reading thấp:** Learners thường bỏ dở bài Reading do thiếu hướng dẫn và giải thích ngay lập tức.
- **Nội dung phân tán:** Nguồn tài liệu IELTS nằm rải rác, thiếu hệ thống quản lý tập trung với truy xuất nguồn gốc (provenance).
- **Chấm điểm không nhất quán:** Giảng viên khác nhau có thể cho điểm khác nhau trên cùng một bài viết.

---

## 2. Đối tượng sử dụng

| Persona | Đặc điểm | Nhu cầu chính | Nền tảng |
|---------|-----------|---------------|----------|
| **Learner** (tự học / trung tâm) | Học sinh, sinh viên, người đi làm chuẩn bị thi IELTS | Luyện Reading có timer, nhận feedback Writing nhanh theo rubric, theo dõi tiến bộ | Web (desktop & mobile) |
| **Instructor/Marker** | Giảng viên, người chấm bài tại trung tâm | Xem bài nộp, thống kê learner, comment/override score (tương lai) | Web (desktop) |
| **Admin/Content Ops** | Quản trị viên nội dung | Import/curate tài liệu từ NotebookLM, publish content, quản lý provenance, theo dõi usage | Web (desktop) |

---

## 3. Vấn đề cần giải quyết

| # | Vấn đề (Pain Point) | Đối tượng bị ảnh hưởng | Mức độ | Giải pháp đề xuất |
|---|---------------------|------------------------|--------|-------------------|
| P-01 | Phản hồi Writing chậm (1–3 ngày) | Learner | 🔴 Cao | Hybrid scoring (rule + LLM) trả kết quả < 5 phút |
| P-02 | Tỷ lệ hoàn thành Reading thấp | Learner | 🟡 Trung bình | Timer, auto-grade, giải thích tức thì, lịch sử attempts |
| P-03 | Nội dung phân tán, thiếu nguồn gốc | Admin | 🟡 Trung bình | CMS tích hợp NotebookLM import với provenance tracking |
| P-04 | Chấm điểm không nhất quán | Learner, Instructor | 🔴 Cao | Rubric-based scoring pipeline với calibration + guardrails |
| P-05 | Thiếu theo dõi tiến bộ | Learner | 🟡 Trung bình | Dashboard với metrics (accuracy, scores, trends) |

---

## 4. Giải pháp tổng quan

### 4.1 Reading Practice
- Hệ thống passage + question bank (MCQ, short answer) theo level (A2–C1) và topic.
- Timer mô phỏng điều kiện thi thực tế.
- Auto-grade tức thì + giải thích chi tiết từng câu hỏi.
- Lịch sử attempts để learner tự đánh giá tiến triển.

### 4.2 Writing Practice
- Prompts theo Task 1 (report/letter) và Task 2 (essay) với level và tags.
- Hybrid scoring pipeline:
  - **Bước 1 — Rule-based checks:** Word count, task relevance keywords, basic grammar checks.
  - **Bước 2 — LLM rubric scoring:** Chấm điểm 0–9 theo 4 tiêu chí (TR/CC/LR/GRA), trả JSON chuẩn.
- Feedback chi tiết: điểm từng tiêu chí, tóm tắt, điểm mạnh, gợi ý cải thiện.
- Default tier "cheap" (GPT-4o-mini/o3-mini/Gemini Flash); premium optional (GPT-4o/Claude 3.5 Sonnet).
- Async processing qua BullMQ với SLA < 5 phút cho 90% bài.

### 4.3 Admin CMS & NotebookLM Integration
- CRUD passages, questions, prompts với version control.
- Import/sync sources & snippets từ NotebookLM.
- Provenance tracking (source_id, snippet_ids, admin_id, timestamp).
- Publish/unpublish workflow; drafts ẩn khỏi learners.

### 4.4 Dashboard & Analytics
- Learner: tỷ lệ hoàn thành Reading, accuracy, avg Writing scores, recent submissions, trend charts.
- Admin: usage stats (submissions count, popular content, failure rates).

### 4.5 Classroom Management
- Giảng viên (instructor) tạo và quản lý lớp học trực tuyến, mời học viên qua mã mời 8 ký tự hoặc QR code, và tổ chức nội dung giảng dạy theo cấu trúc phân cấp Topic > Lesson.
- Mỗi Lesson hỗ trợ nhiều loại nội dung (text, video, passage, prompt) và có thể liên kết trực tiếp đến Reading passages hoặc Writing prompts trong hệ thống.
- Học viên tham gia lớp, xem nội dung đã published, nộp bài viết trong từng lesson, và nhận phản hồi từ giảng viên.
- Giảng viên theo dõi tiến độ học tập tổng quan của từng học viên (điểm Reading, Writing trung bình) và gửi thông báo cho cả lớp qua hệ thống Announcements.

---

## 5. Phạm vi dự án

| Hạng mục | MVP (Phase 1) | Phase 2 (dự kiến) |
|----------|---------------|-------------------|
| Reading practice | ✅ MCQ + short answer, timer, auto-grade, explanations | Matching, diagram labeling, True/False/Not Given |
| Writing practice | ✅ Task 1 & 2, hybrid scoring, feedback | Speaking/Listening, plagiarism detection |
| Dashboard | ✅ Progress summary, recent submissions | Advanced analytics, cohort comparison |
| Admin CMS | ✅ CRUD, NotebookLM import, provenance | Bulk import, version diff view |
| Auth & roles | ✅ JWT, learner/instructor/admin | OAuth (Google), 2FA |
| i18n & theme | ✅ vi/en, dark/light | Thêm ngôn ngữ (JP, KR) |
| Instructor features | ❌ Chỉ view submissions (optional) | Manual override, detailed comments |
| Payments | ❌ | Premium tier billing |
| Mobile native | ❌ | React Native / PWA |
| Listening/Speaking | ❌ | Full module với audio/video |

---

## 6. Công nghệ sử dụng

| Layer | Công nghệ | Ghi chú |
|-------|-----------|---------|
| Frontend | Next.js / React + TypeScript | SSR/SSG, responsive, dark/light, vi/en |
| Backend | NestJS / Node.js + TypeScript | REST API, modular architecture |
| Database | PostgreSQL | UUID PK, JSONB columns, migrations |
| Cache & Queue | Redis + BullMQ | Cache NotebookLM 15–60 min, rate-limit, async scoring queue |
| AI / LLM | OpenAI (GPT-4o-mini) / Google (Gemini Flash) | Default cheap tier; premium optional |
| Auth | JWT + Refresh Token | RBAC middleware |
| Dev Sharing | VS Code Dev Tunnels / Port Forward | Local-first development |
| Observability | Pino / Winston + custom metrics | Structured logs, request_id, latency tracking |

---

## 7. Stakeholders & Vai trò

| Vai trò | Trách nhiệm | Ghi chú |
|---------|-------------|---------|
| Product Owner | Định hướng sản phẩm, ưu tiên backlog, phê duyệt PRD | — |
| Developer(s) | Thiết kế, implement, test, deploy | Full-stack |
| Content Ops (Admin) | Nhập liệu, curate content, QA nội dung | Sử dụng Admin CMS |
| Instructor (optional) | Review submissions, feedback bổ sung | MVP-lite: chỉ view |

---

## 8. Chỉ số thành công (KPIs)

| # | KPI | Mục tiêu (MVP) | Cách đo | Tần suất đo |
|---|-----|----------------|---------|-------------|
| KPI-01 | Reading completion rate | ≥ 70% bài nộp có ≥ 80% câu trả lời | `submissions_reading.answers.length / questions.count` per session | Weekly |
| KPI-02 | Writing rubric score trung bình | 5.5–6.0 (cho new users sau 10+ bài) | Avg TR+CC+LR+GRA per user cohort | Monthly |
| KPI-03 | 7-day retention | ≥ 20% learners quay lại trong 7 ngày | Cohort analysis based on `created_at` vs `last_activity` | Weekly |
| KPI-04 | Writing feedback turnaround | < 5 phút cho 90% bài | `turnaround_ms` on `submissions_writing` | Daily |
| KPI-05 | p95 API latency | < 500ms cho standard endpoints | APM / structured logs | Real-time |
| KPI-06 | Submit error rate | < 1% | Error count / total submits | Daily |

---

## 9. Timeline dự kiến (MVP)

| Milestone | Mô tả | Ước tính |
|-----------|--------|----------|
| M1 | Auth + Shell (theme/lang toggles, layout) | 3–5 ngày |
| M2 | Reading Module (list, detail, submit, auto-grade, history) | 5–7 ngày |
| M3 | Writing Module (submit, hybrid scoring pipeline, feedback UI) | 7–10 ngày |
| M4 | Dashboard (progress summary, recent, trends) | 3–5 ngày |
| M5 | Admin CMS + NotebookLM Import | 5–7 ngày |
| M6 | Observability + Rate Limits + Polish | 3–5 ngày |
| **Tổng** | **MVP Release** | **~26–39 ngày** |

---

## 10. Rủi ro chính

| # | Rủi ro | Xác suất | Tác động | Chiến lược giảm thiểu |
|---|--------|----------|----------|----------------------|
| R-01 | Chi phí model vượt ngân sách | Trung bình | Trung bình | Default cheap tier; rate-limit 5–10/day/user; token caps ~600–900; usage logs |
| R-02 | Scoring không nhất quán giữa models | Trung bình | Cao | JSON schema validation; calibration set; rule-based pre-checks; guardrails |
| R-03 | Chất lượng nội dung import kém | Thấp | Trung bình | Admin review step; sanitize HTML; provenance tracking; manual QA |
| R-04 | Latency scoring vượt SLA | Trung bình | Trung bình | Queue timeout; retry/backoff; DLQ + alerts; monitor SLA metrics |
| R-05 | Mất dữ liệu dev (local) | Thấp | Thấp | Docker volumes; seed scripts; regular git commits |

---

## 11. Bước tiếp theo

- ☐ Hoàn thiện PRD (docs 02–17) với đầy đủ cross-references.
- ☐ Lock scope tại Gate 3 (PRD Approval).
- ☐ Setup dev environment (Postgres + Redis + project scaffold).
- ☐ Implement Milestone M1 (Auth + Shell).
- ☐ Demo POC tại Gate 4.

---

> **Tham chiếu:** Tài liệu này là một phần của bộ PRD theo Vibe Coding Framework v2.0.  
> Xem thêm: [02_scope_definition](02_scope_definition.md) | [05_functional_requirements](05_functional_requirements.md) | [08_data_requirements](08_data_requirements.md)
