# 📐 Scope Definition — IELTS Helper

> **Mã tài liệu:** PRD-02  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [01_executive_summary](01_executive_summary.md)

---

## 1. Mục đích tài liệu

Xác định rõ ràng ranh giới phạm vi của MVP (Phase 1) để tránh scope creep, giúp team tập trung vào những tính năng mang lại giá trị cao nhất cho người dùng trong thời gian ngắn nhất.

---

## 2. Phạm vi MVP (In-Scope)

### 2.1 Module Reading Practice

| Tính năng | Mô tả chi tiết | Ưu tiên | Liên kết FR |
|-----------|----------------|---------|-------------|
| Passage Catalog | Danh sách passages với filter theo level (A2–C1), topic tags; pagination; hiển thị title, level, tags, source refs | P0 | FR-001 |
| Passage Detail | Hiển thị full body passage + danh sách questions (MCQ, short answer); explanations ẩn đến khi submit | P0 | FR-002 |
| Timer | Countdown timer tùy chỉnh (mặc định 20 phút cho 1 passage); pin ở header; auto-submit khi hết giờ | P0 | FR-003 |
| Mode Selection | Chọn Practice (no timer, choose parts) hoặc Simulation (60 min, full test) trước khi bắt đầu. Inspired by ieltsonlinetests.com | P0 | RD-005, RD-006 |
| Submit & Auto-grade | Gửi câu trả lời; yêu cầu ≥80% đã trả lời (RD-001); chấm MCQ bằng answer key; chấm short answer bằng keyword match (case-insensitive, trimmed) | P0 | FR-003 |
| Explanations | Hiển thị giải thích cho từng câu sau khi submit (đúng/sai + explanation text) | P0 | FR-003 |
| Attempt History | Lưu mỗi attempt: score_pct, duration_sec, timed_out, test_mode, answers; learner có thể xem lại | P1 | FR-003 |
| DOCX Auto-Parser | Import file DOCX → AI phân tích tự động passage + question groups → lưu DB. Hỗ trợ tất cả question types IELTS (matching headings, T/F/NG, Y/N/NG, MCQ, matching info, matching features, sentence endings, fill-in-blank, summary, table, flowchart, diagram label, short answer) | P0 | FR-716 |

### 2.2 Module Writing Practice

| Tính năng | Mô tả chi tiết | Ưu tiên | Liên kết FR |
|-----------|----------------|---------|-------------|
| Prompt Catalog | Danh sách prompts filter theo level, task_type (1/2), topic; pagination | P0 | FR-004 |
| Essay Editor | Text editor với live word count; hiển thị prompt bên cạnh | P0 | FR-005 |
| Hybrid Scoring | Rule checks (word count, keywords) → LLM rubric scoring (TR/CC/LR/GRA 0–9) → JSON feedback | P0 | FR-005 |
| Async Processing | Submit trả `pending` + `submission_id`; client poll cho đến `done`/`failed` | P0 | FR-005 |
| Feedback Display | Hiển thị scores từng tiêu chí (TR/CC/LR/GRA), overall, summary, strengths[], improvements[], suggestions. Color-coded bars (red <5, yellow 5–6, green >6) | P0 | FR-005 |
| Model Tier Selection | Default `cheap`; optional `premium` trên UI (nếu cho phép) | P1 | FR-005 |
| Resubmit | Learner có thể nộp attempt mới cho cùng prompt; mỗi attempt lưu riêng | P1 | FR-005 |
| Rate Limiting | 5–10 bài/ngày/user; API trả 429 khi vượt | P0 | WR-003 |

### 2.3 Dashboard

| Tính năng | Mô tả chi tiết | Ưu tiên | Liên kết FR |
|-----------|----------------|---------|-------------|
| Reading Progress | Avg score_pct, completion_rate, total attempts | P0 | FR-006 |
| Writing Progress | Avg scores (TR/CC/LR/GRA/overall), total submissions | P0 | FR-006 |
| Recent Submissions | List 10 gần nhất: type (reading/writing), score, date, link to detail | P0 | FR-006 |
| Trend Charts | Line chart theo tuần cho accuracy (Reading) và avg score (Writing) | P1 | FR-006 |

### 2.4 Admin CMS

| Tính năng | Mô tả chi tiết | Ưu tiên | Liên kết FR |
|-----------|----------------|---------|-------------|
| Content CRUD | Create/Read/Update/Delete passages, questions, prompts; set level, topic_tags | P0 | FR-007 |
| Publish/Unpublish | Toggle trạng thái publish; drafts ẩn khỏi learner catalog | P0 | FR-007 |
| NotebookLM Import | Nhập source URL → fetch snippets → lưu sources & snippets → attach to content | P0 | FR-008 |
| Provenance Display | Hiển thị source_id, snippet_ids, admin_id, timestamp trên mỗi content item | P0 | FR-008 |
| Content Versions | Ghi nhận version, editor_id, timestamp mỗi khi publish/update | P1 | ADM-003 |
| Usage Stats | Hiển thị submissions count per passage/prompt để admin biết content nào được dùng nhiều | P1 | FR-006 |
| DOCX Import | Admin import file DOCX → AI parser trích xuất passage + questions → preview → save DB | P0 | FR-716 |

### 2.5 Auth & Profile

| Tính năng | Mô tả chi tiết | Ưu tiên | Liên kết FR |
|-----------|----------------|---------|-------------|
| Register | Email + password; chọn role (learner / instructor / admin, mặc định learner); chọn language/theme | P0 | FR-009 |
| Login | Email + password → JWT access + refresh token | P0 | FR-009 |
| Refresh Token | Auto-refresh khi access token hết hạn | P0 | FR-009 |
| Profile | GET/UPDATE display_name, language (vi/en), theme (dark/light) | P0 | FR-009 |
| RBAC | Middleware guard cho admin routes; learner chỉ truy cập practice/dashboard | P0 | FR-009 |
| Logout | Client-side xóa tokens; server-side optional blacklist | P1 | FR-009 |

### 2.7 Module Classroom Management

| Tính năng | Mô tả chi tiết | Ưu tiên | Liên kết FR |
|-----------|----------------|---------|-------------|
| Classroom CRUD | Instructor tạo/sửa/xóa/archive lớp học (tên, mô tả, ảnh bìa) | P0 | FR-701 |
| Member Management | Instructor thêm/xóa học sinh vào lớp bằng email (manually) | P0 | FR-702 |
| Invite Link & QR | Tạo invite link + QR code để học sinh tự tham gia lớp | P0 | FR-703 |
| Join Classroom | Learner tham gia lớp qua invite link hoặc mã QR | P0 | FR-703 |
| Topic CRUD | Instructor tạo/sửa/xóa/sắp xếp chủ đề học trong lớp | P0 | FR-704 |
| Lesson CRUD | Instructor tạo/sửa/xóa/sắp xếp bài học trong chủ đề; hỗ trợ liên kết với Passage/Prompt có sẵn | P0 | FR-705 |
| Content Status Toggle | Instructor bật/tắt trạng thái publish/draft cho Topics và Lessons | P0 | FR-706 |
| Video Embed | Lesson hỗ trợ nhúng video YouTube/Vimeo; tự động detect URL và render iframe | P1 | FR-707 |
| Library Content Linking | Khi tạo lesson, instructor chọn Passage/Prompt từ thư viện hệ thống qua dropdown | P1 | FR-708 |
| Announcements | Instructor gửi thông báo cho lớp; student xem danh sách thông báo; instructor xóa thông báo | P1 | FR-709 |
| Duplicate Topic/Lesson | Instructor nhân bản Topic (bao gồm tất cả Lessons) hoặc Lesson riêng lẻ | P1 | FR-710 |
| Student Progress Tracking | Instructor xem tiến độ học viên: số lượng submissions, điểm trung bình, hoạt động gần nhất | P1 | FR-711 |
| Instructor Dashboard Stats | Dashboard hiển thị tổng lớp, tổng học viên, bài chờ review cho instructor | P1 | FR-712 |
| Classroom View (Learner) | Learner xem danh sách lớp đã tham gia + Topics + Lessons đã published | P0 | FR-701 |
| Members Overview | Instructor xem danh sách thành viên lớp | P1 | FR-702 |
| File Upload | Instructor upload file (ảnh, PDF, DOCX) đính kèm vào lesson qua Multer | P0 | FR-714 |
| Lesson Submission | Learner nộp bài viết (essay) trong lesson cho giáo viên chấm; GV xem danh sách bài nộp | P0 | FR-715 |
| Student Passage Preview | Trong Classroom, khi lesson có content_type='passage', học sinh thấy preview đoạn đầu bài đọc (faded gradient) trước khi click "View Full Lesson" | P0 | FR-717 |

### 2.10 Module Instructor Content Management

| Tính năng | Mô tả chi tiết | Ưu tiên | Liên kết FR |
|-----------|----------------|---------|-------------|
| Instructor Passage CRUD | Instructor tạo/xem/sửa/xóa passages y hệt Admin; import DOCX qua AI parser | P0 | FR-718 |
| Instructor Prompt CRUD | Instructor tạo/xem/sửa/xóa writing prompts y hệt Admin | P0 | FR-718 |
| Ownership Access Control | Chỉ owner (created_by) mới sửa/xóa passage/prompt; Admin bypass; tất cả authenticated users xem được | P0 | CR-015 |
| Unified Sidebar Nav | Sidebar phân quyền theo role: Admin (full), Instructor (Classrooms, Passages, Prompts, Learners, Submissions), Learner (Reading, Writing, Classrooms) | P0 | — |

### 2.8 Module File Attachments

| Tính năng | Mô tả chi tiết | Ưu tiên | Liên kết FR |
|-----------|----------------|---------|-------------|
| File Upload | Instructor tải lên file (PDF, image, DOCX,...) đính kèm vào bài học qua `POST /api/uploads` (Multer) | P0 | FR-714 |
| File Viewer/Download | Student xem ảnh inline hoặc tải xuống file đính kèm trong giao diện bài học | P0 | FR-714 |

### 2.9 Cross-cutting Concerns

| Tính năng | Mô tả chi tiết | Ưu tiên |
|-----------|----------------|---------|
| i18n (vi/en) | Tất cả UI labels, messages, error texts hỗ trợ 2 ngôn ngữ | P0 |
| Dark/Light Theme | Toggle theme; persist trong user profile; apply qua CSS variables | P0 |
| Responsive Layout | Desktop-first; mobile-friendly (min 360px width) | P0 |
| Error Handling | Consistent error format `{statusCode, message, error?}`; toast notifications trên FE | P0 |
| Loading States | Skeleton loaders cho lists; spinner cho submit; progress indicator cho scoring | P0 |

---

## 3. Ngoài phạm vi (Out-of-Scope — Phase 1)

| Hạng mục | Lý do loại bỏ | Phase dự kiến |
|----------|---------------|---------------|
| Listening module | Yêu cầu audio player, transcription engine — phức tạp | Phase 2 |
| Speaking module | Yêu cầu voice recording, speech-to-text, pronunciation scoring | Phase 2 |
| Advanced plagiarism detection | Cần tích hợp service riêng (Turnitin/Copyscape) | Phase 2 |
| Payment/billing | MVP miễn phí; chưa cần payment gateway | Phase 2+ |
| Social/community features | Forums, study groups, peer review — không phải core value | Phase 3 |
| Native mobile app | Web responsive đủ cho MVP; native cần resource riêng | Phase 2+ |
| OAuth / 2FA | Email/password đủ cho MVP; OAuth phức tạp hóa auth flow | Phase 2 |
| Instructor manual override | ~~MVP chỉ AI scoring~~ → Sprint 5: instructor override + comment | ~~Phase 2~~ Sprint 5 |
| Offline mode / PWA | Cần service worker, sync logic — phức tạp | Phase 3 |
| Multi-tenant / organization | MVP single-tenant; multi-tenant cần schema redesign | Phase 3 |
| Bulk content import | Admin import từng source; bulk cần queue + progress tracking riêng | Phase 2 |
| AR/VR immersive learning | Ngoài scope hoàn toàn | N/A |

---

## 4. Ứng viên Phase 2 (Backlog Items)

| # | Tính năng | Giá trị dự kiến | Phức tạp | Ghi chú |
|---|-----------|----------------|----------|---------|
| B-01 | Listening practice module | Cao | Cao | Audio player + transcript + question types mới |
| B-02 | Speaking practice module | Cao | Rất cao | Voice recording + STT + pronunciation scoring |
| B-03 | Premium scoring tier billing | Trung bình | Trung bình | Stripe/payment integration |
| B-04 | Instructor review workflow | Trung bình | Trung bình | ~~Manual score override + comments + approval~~ → Moved to Sprint 5 |
| B-05 | Plagiarism detection service | Thấp | Trung bình | API integration (Turnitin hoặc custom) |
| B-06 | Advanced analytics | Trung bình | Trung bình | Cohort analysis, skill gap, recommendation engine |
| B-07 | Offline/PWA support | Thấp | Cao | Service workers, local storage sync |
| B-08 | Bulk import với progress | Trung bình | Trung bình | Queue-based import + progress bar |
| B-09 | ~~True/False/Not Given questions~~ | ~~Trung bình~~ | ~~Thấp~~ | ~~Mở rộng question_type enum~~ → **Đã implemented Sprint 8** (DOCX Auto-Parser) |
| B-10 | Version diff view (admin) | Thấp | Thấp | Show diff giữa versions của content |
| B-11 | 6-Step Learning Path | Cao | Trung bình | IOT-inspired: Placement → Practice → AI Test → Full Services |
| B-12 | Social proof stats | Trung bình | Thấp | IOT-inspired: Show "X lượt thi" per test/prompt |
| B-13 | Exam Library tabs & filters | Cao | Trung bình | IOT-inspired: Filter by skill/level, card grid with badges |

---

## 5. Giả định (Assumptions)

| # | Giả định | Ảnh hưởng nếu sai | Hành động nếu sai |
|---|----------|-------------------|--------------------|
| A-01 | NotebookLM cung cấp accessible HTTP endpoints/snippets | Không import được content | Cần manual content entry hoặc alternative source |
| A-02 | Users chấp nhận AI-based scoring nếu rubric và nguồn minh bạch | Mất trust → thấp adoption | Thêm instructor review layer sớm hơn |
| A-03 | Dev environment chạy local; Postgres + Redis available via Docker | Không setup được | Dùng cloud-hosted dev DB (Supabase, Railway) |
| A-04 | Model API (OpenAI/Google/Anthropic) available với latency < 30s | Scoring chậm hoặc fail | Fallback sang model khác; tăng retry; dùng cache |
| A-05 | Team 1–2 full-stack developers | Timeline 26–39 ngày | Tăng nhân lực hoặc cắt scope |
| A-06 | Users có thể chấp nhận feedback turnaround async (< 5 min) thay vì real-time | UX mong đợi real-time | Optimize prompt + model hoặc dùng WebSocket |

---

## 6. Ràng buộc (Constraints)

| # | Ràng buộc | Loại | Ảnh hưởng |
|---|-----------|------|-----------|
| C-01 | Budget-conscious: prefer cheap model tier by default | Tài chính | Giới hạn model choices; cần rate-limit |
| C-02 | Local-first development; cloud deploy later | Infra | Docker required; no CI/CD initially |
| C-03 | Single-language codebase (TypeScript end-to-end) | Kỹ thuật | Consistent nhưng giới hạn framework choices |
| C-04 | Max 5–10 writing submissions/day/user (MVP) | Business | Tránh cost spike; có thể ảnh hưởng power users |
| C-05 | No native mobile in MVP | UX | Responsive web phải đủ tốt trên mobile |
| C-06 | HTTPS assumed for production nhưng không enforce trong dev | Security | Dev Tunnels cung cấp HTTPS |

---

## 7. Tiêu chí Scope Lock (Gate 3)

Trước khi bắt đầu implementation, scope cần được lock với các điều kiện:

- ✅ Tất cả Functional Requirements (FR-001 → FR-009) đã được phê duyệt.
- ✅ Acceptance Criteria cho core flows (Reading submit, Writing submit, Admin import) đã được review.
- ✅ Data model (tables, enums, JSON shapes) đã được xác nhận.
- ✅ OpenAPI spec đã được validate.
- ✅ KPIs table đã được agree.
- ✅ Out-of-scope list đã được stakeholders đồng ý.

> **Lưu ý:** Mọi thay đổi scope sau Gate 3 cần đi qua Change Request process (đánh giá impact → approve/reject → update PRD).

---

> **Tham chiếu:** [01_executive_summary](01_executive_summary.md) | [05_functional_requirements](05_functional_requirements.md) | [06_acceptance_criteria](06_acceptance_criteria.md)
