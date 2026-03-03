# 📝 User Stories — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-04  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [03_user_personas_roles](03_user_personas_roles.md)

---

## 1. Quy ước

### 1.1 Ưu tiên (Priority)

| Mức | Ý nghĩa | Mô tả |
|-----|---------|-------|
| P0 | Must-have | Không có tính năng này thì MVP không thể release |
| P1 | Should-have | Quan trọng nhưng có thể delay 1–2 sprint nếu cần |
| P2 | Nice-to-have | Giá trị thêm; làm sau nếu còn thời gian |

### 1.2 Story Points (Fibonacci)

| Points | Effort | Ví dụ |
|--------|--------|-------|
| 1 | Trivial | Thêm 1 field vào form |
| 2 | Nhỏ | CRUD endpoint đơn giản |
| 3 | Vừa | Form + validation + API integration |
| 5 | Lớn | Full flow (UI + API + DB + tests) |
| 8 | Rất lớn | Module phức tạp (scoring pipeline) |
| 13 | Epic-level | Toàn bộ module end-to-end |

### 1.3 Format

Mỗi User Story theo format:
> *As a [role], I want to [action], so that [benefit].*

---

## 2. Tổng quan Epics

| Epic | Mô tả | Số Stories | Tổng SP |
|------|--------|-----------|---------|
| E1: Authentication & Profile | Đăng ký, đăng nhập, quản lý profile | 5 | 14 |
| E2: Reading Practice | Luyện đọc IELTS với auto-grade | 7 | 24 |
| E3: Writing Practice | Luyện viết với AI scoring | 8 | 34 |
| E4: Dashboard | Theo dõi tiến bộ | 3 | 8 |
| E5: Admin CMS | Quản lý nội dung | 6 | 21 |
| E6: Admin NotebookLM Import | Import nguồn từ NotebookLM | 3 | 10 |
| E7: Instructor Review | Instructor review & override Writing | 2 | 8 |
| E8: Classroom Management | Lớp học, quản lý thành viên, Topics, Lessons | 10 | 37 |
| E8 Extended: Classroom Enhancements | Video Embed, Announcements, Duplicate, Progress, Dashboard | 7 | 24 |
| **Tổng** | | **44** | **156** |

---

## 3. Epic 1: Authentication & Profile

### US-101: Đăng ký tài khoản Learner

| Field | Value |
|-------|-------|
| **As a** | Visitor (chưa có account) |
| **I want to** | Đăng ký tài khoản bằng email và password |
| **So that** | Tôi có thể bắt đầu luyện tập IELTS Reading & Writing |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-101](06_acceptance_criteria.md#ac-101) |
| **FR Ref** | FR-009 |
| **BR Ref** | — |

**Chi tiết:**
- Giao diện form với fields: email, password, confirm password, display_name (optional).
- Validation: email format, password min 8 chars (1 uppercase, 1 number, 1 special char).
- Default role = `learner`, language = `vi`, theme = `light`.
- Sau register thành công → auto-login → redirect to Dashboard.
- Nếu email đã tồn tại → hiển thị lỗi "Email already registered".

---

### US-102: Đăng nhập

| Field | Value |
|-------|-------|
| **As a** | User đã có account |
| **I want to** | Đăng nhập bằng email và password |
| **So that** | Tôi truy cập được hệ thống với đúng vai trò của mình |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-102](06_acceptance_criteria.md#ac-102) |
| **FR Ref** | FR-009 |

**Chi tiết:**
- Form: email + password.
- Thành công → nhận JWT access (15 min) + refresh token (7 days) → redirect theo role.
- Sai credentials → "Invalid email or password" (không tiết lộ field nào sai).
- Account locked sau 5 lần sai liên tiếp (optional P2).

---

### US-103: Auto-refresh token

| Field | Value |
|-------|-------|
| **As a** | User đang sử dụng hệ thống |
| **I want to** | Token tự động refresh khi gần hết hạn |
| **So that** | Tôi không bị logout giữa chừng khi đang luyện tập |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-103](06_acceptance_criteria.md#ac-103) |
| **FR Ref** | FR-009 |

**Chi tiết:**
- Frontend interceptor gọi POST /auth/refresh khi access token còn < 2 phút.
- Refresh token rotate: cấp token mới, revoke token cũ.
- Nếu refresh token hết hạn → redirect to login.

---

### US-104: Cập nhật profile

| Field | Value |
|-------|-------|
| **As a** | User bất kỳ |
| **I want to** | Thay đổi display name, ngôn ngữ giao diện, và theme |
| **So that** | Hệ thống hiển thị đúng theo sở thích cá nhân |
| **Priority** | P0 |
| **Story Points** | 2 |
| **Acceptance Criteria** | See [AC-104](06_acceptance_criteria.md#ac-104) |
| **FR Ref** | FR-009 |

**Chi tiết:**
- Trang Settings: form với display_name, language dropdown (vi/en), theme toggle (dark/light).
- Save → PATCH /me → cập nhật DB → FE apply ngay (không cần reload).

---

### US-105: Đăng xuất

| Field | Value |
|-------|-------|
| **As a** | User đang đăng nhập |
| **I want to** | Đăng xuất khỏi hệ thống |
| **So that** | Bảo vệ tài khoản khi dùng thiết bị chung |
| **Priority** | P1 |
| **Story Points** | 1 |
| **Acceptance Criteria** | See [AC-105](06_acceptance_criteria.md#ac-105) |
| **FR Ref** | FR-009 |

**Chi tiết:**
- Click Logout → xóa tokens ở client → redirect to Login page.
- Server-side: optional đưa refresh token vào blacklist (Redis TTL).

---

## 4. Epic 2: Reading Practice

### US-201: Duyệt danh sách passages

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem danh sách passages có thể filter theo level và topic |
| **So that** | Tôi chọn được bài phù hợp trình độ và chủ đề quan tâm |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-201](06_acceptance_criteria.md#ac-201) |
| **FR Ref** | FR-001 |

**Chi tiết:**
- Trang chính hiển thị danh sách dạng card: title, level badge, topic tags, question count, source icon.
- Filter: dropdown level (All / A2 / B1 / B2 / C1), multi-select topic tags.
- Pagination: 10 items/page; infinite scroll hoặc numbered pages.
- Sorted mặc định theo `created_at` DESC (mới nhất trước).

---

### US-202: Xem chi tiết passage + câu hỏi

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem full nội dung passage cùng danh sách câu hỏi |
| **So that** | Tôi có thể đọc và trả lời như trong bài thi thật |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-202](06_acceptance_criteria.md#ac-202) |
| **FR Ref** | FR-002 |

**Chi tiết:**
- Layout split view: bên trái = passage body (scrollable), bên phải = question list.
- MCQ: radio buttons cho single-choice.
- Short answer: text input.
- Explanations ẩn; chỉ hiện sau khi submit.
- Hiển thị question number và progress (answered/total).

---

### US-203: Bắt đầu Reading với timer

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Có timer countdown khi làm Reading |
| **So that** | Tôi mô phỏng áp lực thời gian như thi thật |
| **Priority** | P0 |
| **Story Points** | 2 |
| **Acceptance Criteria** | See [AC-203](06_acceptance_criteria.md#ac-203) |
| **FR Ref** | FR-003, RD-003 |

**Chi tiết:**
- Timer mặc định 20 phút; có thể chỉnh (5/10/15/20/30/60 phút) trước khi bắt đầu.
- Timer pin ở top; hiển thị mm:ss; đổi màu đỏ khi còn < 3 phút.
- Khi hết giờ: auto-submit câu đã trả lời; flag `timed_out = true`.
- Option: "No timer" cho luyện tập không áp lực.

---

### US-204: Nộp bài Reading

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Nộp bài và nhận kết quả chấm + giải thích |
| **So that** | Tôi biết ngay score và hiểu tại sao câu nào sai |
| **Priority** | P0 |
| **Story Points** | 5 |
| **Acceptance Criteria** | See [AC-204](06_acceptance_criteria.md#ac-204) |
| **FR Ref** | FR-003, RD-001, RD-002 |

**Chi tiết:**
- Kiểm tra rule RD-001: ≥80% questions đã answered → nếu không đủ, show warning "Please answer at least X more questions".
- Submit → Backend auto-grade:
  - MCQ: so sánh `value` với `answer_key`.
  - Short answer: case-insensitive, trim spaces, keyword match (match bất kỳ keyword nào trong answer_key[]).
- Response: `{score_pct, details: [{question_id, correct: boolean, your_answer, correct_answer, explanation}]}`.
- UI: hiển thị score_pct nổi bật; list câu hỏi với ✅/❌; click vào câu → expand explanation.
- Lưu attempt: `submissions_reading (user_id, passage_id, answers, score_pct, duration_sec, timed_out, completed_at)`.

---

### US-205: Xem lịch sử Reading

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem lại các bài Reading đã làm |
| **So that** | Tôi theo dõi tiến bộ và xem lại giải thích |
| **Priority** | P1 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-205](06_acceptance_criteria.md#ac-205) |
| **FR Ref** | FR-003, RD-004 |

**Chi tiết:**
- Trang history: list attempts sorted by date DESC.
- Mỗi item: passage title, score_pct, duration, timed_out flag, date.
- Click vào → xem lại chi tiết: passage, answers, correctness, explanations.
- Filter: by passage, by date range.

---

### US-206: Làm lại passage đã làm

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Làm lại một passage mà tôi đã làm trước đó |
| **So that** | Tôi thực hành lại để cải thiện điểm |
| **Priority** | P1 |
| **Story Points** | 2 |
| **Acceptance Criteria** | See [AC-206](06_acceptance_criteria.md#ac-206) |
| **FR Ref** | FR-003 |

**Chi tiết:**
- Nút "Retry" trên passage detail / history.
- Retry tạo attempt mới; không ghi đè attempt cũ.
- Hiển thị so sánh score attempt mới vs attempts trước (optional P2).

---

### US-207: Chọn chế độ luyện tập (IOT-inspired)

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Chọn giữa Practice mode và Simulation mode trước khi bắt đầu |
| **So that** | Tôi có thể luyện tập thoải mái hoặc mô phỏng thi thật |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-207](06_acceptance_criteria.md#ac-207) |
| **FR Ref** | FR-205, RD-005, RD-006 |
| **BR Ref** | RD-005, RD-006 |

**Chi tiết:**
- Khi click vào passage, hiển thị Mode Selector modal (S22).
- **Practice mode:** không timer, có thể chọn phần, pause/resume.
- **Simulation mode:** 60 phút standard IELTS timer, full test, auto-submit khi hết giờ, không pause.
- Lưu `test_mode` ('practice' / 'simulation') vào `submissions_reading`.
- Inspired by ieltsonlinetests.com Practice/Simulation mode selection.

---

## 5. Epic 3: Writing Practice

### US-301: Duyệt danh sách prompts

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem danh sách Writing prompts với filter |
| **So that** | Tôi chọn đúng loại bài (Task 1/2) và level phù hợp |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-301](06_acceptance_criteria.md#ac-301) |
| **FR Ref** | FR-004 |

**Chi tiết:**
- Danh sách cards: title, task_type badge (Task 1 / Task 2), level, topic tags.
- Filter: task_type, level, topic.
- Pagination: 10/page.

---

### US-302: Viết essay với editor

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Viết essay trong editor với word count trực tiếp |
| **So that** | Tôi kiểm soát được độ dài bài viết |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-302](06_acceptance_criteria.md#ac-302) |
| **FR Ref** | FR-005 |

**Chi tiết:**
- Layout: bên trái = prompt text; bên phải = textarea editor.
- Live word count hiển thị dưới editor; đổi màu đỏ nếu < 150 words (Task 2) hoặc < 150 words (Task 1).
- Min word count guidelines: Task 1 ≥ 150 words, Task 2 ≥ 250 words.
- Không block submit nếu word count thấp; chỉ warn.

---

### US-303: Nộp essay để chấm

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Nộp bài viết và nhận scores + feedback |
| **So that** | Tôi biết được band score theo từng tiêu chí và cách cải thiện |
| **Priority** | P0 |
| **Story Points** | 8 |
| **Acceptance Criteria** | See [AC-303](06_acceptance_criteria.md#ac-303) |
| **FR Ref** | FR-005, WR-001, WR-002, WR-003, WR-004 |

**Chi tiết:**
- Bấm Submit → check rate-limit (nếu vượt → toast "You have reached the daily limit") → gửi POST /writing/prompts/{id}/submit.
- Backend: enqueue BullMQ job → trả `{processing_status: "pending", submission_id}`.
- FE: hiển thị loading state "Scoring your essay..." → poll GET /writing/submissions/{id} mỗi 3s.
- Khi done: hiển thị scores panel (TR, CC, LR, GRA, overall) + summary + strengths + improvements.
- Khi failed: hiển thị "Scoring failed. Please try again later." + retry button.
- Scoring pipeline (backend):
  1. Rule checks: word count, basic keyword relevance.
  2. LLM call: prompt rubric scoring → expect JSON `{TR, CC, LR, GRA, overall, summary, strengths[], improvements[]}`.
  3. JSON validation: nếu LLM output không valid → retry (max 2).
  4. Persist: scores, feedback, model_tier, model_name, turnaround_ms, processing_status.
- Rate-limit: 5–10 essays/day/user (configurable env var).

---

### US-304: Xem feedback chi tiết

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem chi tiết feedback cho từng tiêu chí |
| **So that** | Tôi hiểu rõ điểm mạnh và cần cải thiện gì |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-304](06_acceptance_criteria.md#ac-304) |
| **FR Ref** | FR-005 |

**Chi tiết:**
- Panel hiển thị 4 score bars: TR (0–9), CC (0–9), LR (0–9), GRA (0–9) + overall.
- Mỗi criterion: score number + color-coded bar (red < 5, yellow 5–6, green > 6).
- Summary text (1–3 câu tổng quan).
- Strengths: list bullet points.
- Improvements: list bullet points với gợi ý cụ thể.

---

### US-305: Nộp lại essay (new attempt)

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Viết lại essay cho cùng prompt |
| **So that** | Tôi cải thiện score bằng cách áp dụng feedback |
| **Priority** | P1 |
| **Story Points** | 2 |
| **Acceptance Criteria** | See [AC-305](06_acceptance_criteria.md#ac-305) |
| **FR Ref** | FR-005 |

**Chi tiết:**
- Nút "Write Again" sau khi xem feedback.
- Mở editor mới (trống hoặc copy từ essay cũ — user chọn).
- Submit tạo submission mới, không ghi đè cũ.
- History hiển thị tất cả attempts cho prompt.

---

### US-306: Chọn model tier (optional)

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Chọn scoring tier (cheap/premium) nếu có quyền |
| **So that** | Tôi nhận feedback chi tiết hơn cho bài quan trọng |
| **Priority** | P1 |
| **Story Points** | 2 |
| **Acceptance Criteria** | See [AC-306](06_acceptance_criteria.md#ac-306) |
| **FR Ref** | FR-005, WR-003 |

**Chi tiết:**
- Dropdown hoặc toggle bên cạnh Submit button: "Standard" (default) / "Premium".
- Premium chỉ available nếu env config cho phép (hoặc user có `premium_learner` role - Phase 2).
- Hiển thị disclaimer: "Premium scoring may take slightly longer".

---

### US-307: Xem lịch sử Writing

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem lại tất cả bài Writing đã nộp |
| **So that** | Tôi theo dõi tiến bộ Writing qua thời gian |
| **Priority** | P1 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-307](06_acceptance_criteria.md#ac-307) |
| **FR Ref** | FR-005 |

**Chi tiết:**
- List submissions sorted by date DESC.
- Mỗi item: prompt title, task_type, overall score, processing_status, date.
- Filter: by prompt, by task_type, by date range.
- Click → xem submission detail + scores + feedback.
- Items có `processing_status = "pending"` hiển thị icon loading + auto-refresh.

---

### US-308: Xem gợi ý cải thiện chi tiết (IOT-inspired)

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem suggestions cụ thể kèm improvement plan |
| **So that** | Tôi biết rõ cần làm gì để tăng band score |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-308](06_acceptance_criteria.md#ac-308) |
| **FR Ref** | FR-302, FR-303, WR-007 |

**Chi tiết:**
- Feedback panel mở rộng với section "Suggestions" — gợi ý hành động cụ thể.
- LLM prompt yêu cầu thêm `suggestions` field trong JSON output.
- Schema validation (WR-007): feedback JSON phải có `{summary, strengths[], improvements[], suggestions}`.
- Inspired by ieltsonlinetests.com's detailed improvement suggestions.

---

## 6. Epic 4: Dashboard

### US-401: Xem tổng quan tiến bộ

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem tổng quan tiến bộ Reading & Writing trên Dashboard |
| **So that** | Tôi có cái nhìn toàn diện về quá trình luyện tập |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-401](06_acceptance_criteria.md#ac-401) |
| **FR Ref** | FR-006 |

**Chi tiết:**
- Cards hiển thị:
  - Reading: avg score_pct, completion rate, total attempts.
  - Writing: avg overall score, avg per criterion, total submissions.
- Nếu chưa có data → hiển thị empty state với CTA "Start your first practice!".

---

### US-402: Xem submissions gần đây

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem danh sách submissions gần nhất |
| **So that** | Tôi nhanh chóng quay lại xem kết quả |
| **Priority** | P0 |
| **Story Points** | 2 |
| **Acceptance Criteria** | See [AC-402](06_acceptance_criteria.md#ac-402) |
| **FR Ref** | FR-006 |

**Chi tiết:**
- List 10 submissions gần nhất (Reading + Writing mixed).
- Mỗi item: type icon (📖/✍️), title, score, date.
- Click → navigate to detail view.

---

### US-403: Xem trend charts

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem biểu đồ trend theo thời gian |
| **So that** | Tôi thấy được sự tiến bộ (hoặc cần cải thiện) |
| **Priority** | P1 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-403](06_acceptance_criteria.md#ac-403) |
| **FR Ref** | FR-006 |

**Chi tiết:**
- Line chart: trục X = tuần, trục Y = score.
- 2 lines: Reading avg score + Writing avg overall score.
- Period selector: Last 4 weeks / Last 3 months.
- Chart library: Recharts hoặc Chart.js.

---

## 7. Epic 5: Admin CMS

### US-501: Quản lý passages (CRUD)

| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | Tạo, sửa, xóa, xem danh sách passages |
| **So that** | Tôi duy trì ngân hàng đề Reading chất lượng |
| **Priority** | P0 |
| **Story Points** | 5 |
| **Acceptance Criteria** | See [AC-501](06_acceptance_criteria.md#ac-501) |
| **FR Ref** | FR-007, ADM-001 |

**Chi tiết:**
- List view: table với columns (title, level, tags, status [draft/published], questions count, submissions count, updated_at).
- Filter: level, status, search by title.
- Create/Edit form: title, body (textarea/rich text), level dropdown, topic_tags multi-select, source attachment.
- Delete: soft-delete (optional) hoặc hard-delete với confirm dialog.
- Validation: title required, body required, level required.

---

### US-502: Quản lý questions

| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | Thêm/sửa/xóa câu hỏi cho từng passage |
| **So that** | Mỗi passage có bộ câu hỏi đầy đủ và chính xác |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-502](06_acceptance_criteria.md#ac-502) |
| **FR Ref** | FR-007 |

**Chi tiết:**
- Questions inline trong passage edit form (hoặc tab riêng).
- Add question: chọn type (MCQ/Short answer) → nhập prompt, options (nếu MCQ), answer_key, explanation.
- MCQ: 4 options (A/B/C/D); mark correct answer.
- Short answer: answer_key là array of acceptable keywords.
- Reorder questions bằng drag & drop (P2).

---

### US-503: Quản lý Writing prompts (CRUD)

| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | Tạo/sửa/xóa Writing prompts |
| **So that** | Learners có đa dạng đề Writing để luyện tập |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-503](06_acceptance_criteria.md#ac-503) |
| **FR Ref** | FR-007 |

**Chi tiết:**
- Form: title, prompt_text (textarea), task_type (1/2), level, topic_tags, source attachment.
- Preview mode: xem prompt như learner thấy.
- Validation: title required, prompt_text required, task_type required.

---

### US-504: Publish/Unpublish content

| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | Publish hoặc unpublish passages/prompts |
| **So that** | Tôi kiểm soát content nào learners được thấy |
| **Priority** | P0 |
| **Story Points** | 2 |
| **Acceptance Criteria** | See [AC-504](06_acceptance_criteria.md#ac-504) |
| **FR Ref** | FR-007, ADM-001 |

**Chi tiết:**
- Toggle button trên list view hoặc detail form.
- Publish: status = `published` → xuất hiện trong learner catalog.
- Unpublish: status = `draft` → ẩn khỏi catalog; submissions đã có vẫn giữ.
- Ghi nhận version: tạo entry mới trong content_versions (ADM-003).

---

### US-505: Xem usage stats per content

| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | Xem số lượng submissions cho từng passage/prompt |
| **So that** | Tôi biết content nào popular, content nào cần cải thiện |
| **Priority** | P1 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-505](06_acceptance_criteria.md#ac-505) |
| **FR Ref** | FR-006 |

**Chi tiết:**
- Column "Submissions" trong admin list views.
- Optional sort by submissions count.
- Click → xem list recent submissions cho content đó.

---

### US-506: Quản lý user roles

| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | Xem danh sách users và thay đổi role |
| **So that** | Tôi phân quyền đúng cho instructors và admins |
| **Priority** | P1 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-506](06_acceptance_criteria.md#ac-506) |
| **FR Ref** | FR-009 |

**Chi tiết:**
- Table: email, display_name, role, created_at, last_login.
- Filter: by role.
- Change role: dropdown (learner/instructor/admin) → confirm → save.
- Không cho phép admin tự hạ role của mình.

---

## 8. Epic 6: Admin NotebookLM Import

### US-601: Import source từ NotebookLM

| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | Import source từ NotebookLM bằng URL |
| **So that** | Tôi có nội dung mới cho passages/prompts với provenance rõ ràng |
| **Priority** | P0 |
| **Story Points** | 5 |
| **Acceptance Criteria** | See [AC-601](06_acceptance_criteria.md#ac-601) |
| **FR Ref** | FR-008, SY-001, SY-002 |

**Chi tiết:**
- Modal: nhập URL + metadata (title, tags, level).
- Backend: fetch content → sanitize HTML → extract snippets → store source + snippets.
- Thành công: hiển thị list snippets imported.
- Thất bại: hiển thị error (unreachable, invalid content, rate-limited).
- Cache: Redis 15–60 min để tránh fetch lại cùng URL.
- Log: admin_id, timestamp, source_id (SY-003).

---

### US-602: Attach source/snippet to content

| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | Gắn source/snippet đã import vào passage hoặc prompt |
| **So that** | Content có truy xuất nguồn gốc rõ ràng |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-602](06_acceptance_criteria.md#ac-602) |
| **FR Ref** | FR-008, ADM-002 |

**Chi tiết:**
- Trong passage/prompt edit form: section "Sources" → autocomplete search existing sources/snippets → attach.
- Hiển thị attached sources/snippets với title, URL, imported date.
- Rule ADM-002: nếu content imported từ NotebookLM, phải có ít nhất 1 source attached.
- Remove source: unlink (không delete source record).

---

### US-603: Xem provenance trên content

| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | Xem provenance (nguồn gốc) của mỗi content item |
| **So that** | Tôi trace được nội dung đến từ đâu |
| **Priority** | P1 |
| **Story Points** | 2 |
| **Acceptance Criteria** | See [AC-603](06_acceptance_criteria.md#ac-603) |
| **FR Ref** | FR-008, SY-002 |

**Chi tiết:**
- Panel/section trên content detail hiển thị:
  - Source(s): title, URL, imported date, imported by.
  - Snippet(s): text preview (truncated), tags, level.
- Click source URL → external link to NotebookLM.

---

## 9. Epic 7: Instructor Review (Sprint 5) — IOT-inspired

### US-701: Review Writing submission

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Xem writing submission của learner kèm AI scores |
| **So that** | Tôi đánh giá chất lượng AI scoring và hỗ trợ learner |
| **Priority** | P0 |
| **Story Points** | 5 |
| **Acceptance Criteria** | See [AC-701](06_acceptance_criteria.md#ac-701) |
| **FR Ref** | FR-701 |
| **BR Ref** | WR-006 |

**Chi tiết:**
- Trang Instructor Review (S23): split view essay content + AI scores.
- List view: danh sách submissions chưa review, sorted by date.
- Detail view: essay full text, 4 score bars (TR/CC/LR/GRA + overall).
- Read-only mode cho essay và AI scores.

---

### US-702: Override AI score và thêm comment

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Override AI score và thêm nhận xét cá nhân |
| **So that** | Learner nhận feedback kết hợp AI + instructor |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Acceptance Criteria** | See [AC-702](06_acceptance_criteria.md#ac-702) |
| **FR Ref** | FR-702, WR-006 |

**Chi tiết:**
- Override score input: number 0–9 (0.5 increments); optional.
- Comment textarea: instructor's qualitative feedback.
- Save → `PATCH /instructor/writing-submissions/:id/review`.
- AI score gốc vẫn hiển thị cùng override → learner thấy cả hai.
- Lưu: `instructor_comment`, `instructor_override_score`, `reviewed_by`, `reviewed_at`.

---

## 8.5 Epic 8: Classroom Management

### US-801: Tạo lớp học

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Tạo lớp học mới với tên, mô tả, ảnh bìa |
| **So that** | Tôi có không gian quản lý học sinh và nội dung giảng dạy |
| **Priority** | P0 |
| **Story Points** | 3 |
| **FR Ref** | FR-701 |

**Chi tiết:**
- Form tạo lớp: name (bắt buộc), description, cover_image_url.
- Hệ thống tự sinh `invite_code` (8-char alphanumeric, unique).
- Sau khi tạo → redirect đến Classroom Detail.

---

### US-802: Thêm học sinh vào lớp (manually)

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Thêm học sinh vào lớp bằng cách nhập email |
| **So that** | Tôi có thể chủ động quản lý thành viên lớp |
| **Priority** | P0 |
| **Story Points** | 3 |
| **FR Ref** | FR-702 |

**Chi tiết:**
- Nhập email → lookup user trong hệ thống → nếu tồn tại → add vào classroom_members (role: student).
- Nếu email không tồn tại → hiển thị lỗi "User not found".
- Nếu đã là thành viên → hiển thị lỗi "Already a member".

---

### US-803: Tạo invite link + QR code

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Tạo invite link và QR code cho lớp học |
| **So that** | Học sinh có thể tự tham gia lớp mà không cần thêm manually |
| **Priority** | P0 |
| **Story Points** | 5 |
| **FR Ref** | FR-703 |

**Chi tiết:**
- GET invite → trả về `invite_url` (format: `{FRONTEND_URL}/classrooms/join/{invite_code}`) + QR code base64.
- Nút "Copy Link" và hiển thị QR code trong modal.
- Có thể regenerate invite_code (thay đổi code cũ, link cũ hết hạn).

---

### US-804: Tham gia lớp qua invite

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Tham gia lớp học bằng invite link hoặc QR code |
| **So that** | Tôi có thể truy cập nội dung mà giáo viên đã chuẩn bị |
| **Priority** | P0 |
| **Story Points** | 3 |
| **FR Ref** | FR-703, FR-702 |

**Chi tiết:**
- Learner có 2 cách tham gia:
  - **Nhập mã lớp**: Từ trang "Lớp học", click "+" → "Tham gia lớp học" → nhập class code (5-8 ký tự) → POST `/classrooms/join`.
  - **Quét QR / mở link**: Mở invite link / quét QR → landing page hiển thị tên lớp + nút "Tham gia".
- Nếu chưa login → redirect to login → quay lại join.
- Nếu lớp đầy (max_members) → hiển thị lỗi.
- Nếu đã join → hiển thị "Bạn đã là thành viên".
- UI trang lớp học: nút "+" với dropdown 2 options (giống Google Classroom):
  - "Tham gia lớp học" → mở JoinClassroomDialog
  - "Tạo lớp học" → navigate to `/classrooms/new`

---

### US-805: Xóa / kick học sinh

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Xóa học sinh khỏi lớp |
| **So that** | Tôi quản lý được thành viên lớp đúng cách |
| **Priority** | P1 |
| **Story Points** | 2 |
| **FR Ref** | FR-702 |

---

### US-806: CRUD Topics

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Tạo, sửa, xóa, sắp xếp các chủ đề (Topics) trong lớp |
| **So that** | Nội dung học được tổ chức rõ ràng theo chủ đề |
| **Priority** | P0 |
| **Story Points** | 5 |
| **FR Ref** | FR-704 |

**Chi tiết:**
- Tạo Topic: title (bắt buộc), description, order_index, status (draft/published).
- Sắp xếp bằng drag-and-drop hoặc API reorder.
- Xóa Topic → cascade xóa tất cả Lessons bên trong.
- Student chỉ thấy Topics có status = 'published'.

---

### US-807: CRUD Lessons

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Tạo, sửa, xóa, sắp xếp bài học (Lessons) trong chủ đề |
| **So that** | Mỗi chủ đề có các bài học cụ thể cho học sinh |
| **Priority** | P0 |
| **Story Points** | 5 |
| **FR Ref** | FR-705 |

**Chi tiết:**
- Lesson types: `text` (Markdown/Rich text), `video` (URL YouTube/Vimeo), `passage` (Reading Test), `prompt` (Writing Test).
- Nhập title → chọn content_type → hiển thị form phù hợp:
  - **Text**: textarea HTML content.
  - **Video**: input URL.
  - **Reading Test / Writing Test**: hiển thị 2 options:
    - **📚 Chọn từ thư viện** → search & chọn Passage/Prompt có sẵn (linked_entity_id).
    - **📎 Upload file** → nhập URL tài liệu (PDF, Google Docs, etc.) + optional mô tả/hướng dẫn.
- Attachment URL (optional) cho mọi lesson type.
- Status: draft/published.
- Sắp xếp bằng API reorder.

---

### US-808: Liên kết Lesson với nội dung (Library hoặc Upload)

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Liên kết Lesson với Passage/Prompt từ thư viện HOẶC upload file bên ngoài |
| **So that** | Tôi linh hoạt sử dụng nội dung có sẵn hoặc tài liệu riêng |
| **Priority** | P1 |
| **Story Points** | 3 |
| **FR Ref** | FR-705 |

**Chi tiết:**
- **Option A — Thư viện:** Search & chọn Passage/Prompt published → lưu `linked_entity_id`. Học sinh click → mở trang practice tương ứng.
- **Option B — Upload file:** Chọn file từ device (PDF, DOC, DOCX, TXT, images — max 10MB) HOẶC dán URL tài liệu (Google Docs, etc.) → lưu `attachment_url`. Optional textarea để GV viết mô tả/hướng dẫn → lưu `content`.
- Khi edit lesson đã tạo: hiển thị đúng mode (library/upload) dựa trên data đã lưu.
- Validation: phải chọn ít nhất 1 trong 2 options.

---

### US-809: Xem lớp + Topics + Lessons (Learner)

| Field | Value |
|-------|-------|
| **As a** | Learner |
| **I want to** | Xem danh sách lớp đã tham gia và nội dung Topics/Lessons |
| **So that** | Tôi có thể học theo lộ trình giáo viên đã chuẩn bị |
| **Priority** | P0 |
| **Story Points** | 3 |
| **FR Ref** | FR-701 |

---

### US-810: Xem thành viên lớp

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Xem danh sách thành viên trong lớp |
| **So that** | Tôi nắm được ai đang học trong lớp mình |
| **Priority** | P1 |
| **Story Points** | 5 |
| **FR Ref** | FR-702 |

---

### US-811: Toggle publish/draft cho Topics và Lessons

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Bật/tắt trạng thái publish/draft cho Topics và Lessons |
| **So that** | Tôi kiểm soát được nội dung nào hiển thị cho học viên |
| **Priority** | P0 |
| **Story Points** | 3 |
| **FR Ref** | FR-706 |

---

### US-812: Nhúng video YouTube/Vimeo trong bài học

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Tạo bài học dạng video bằng cách dán URL YouTube/Vimeo |
| **So that** | Học viên xem video trực tiếp trong giao diện lớp học |
| **Priority** | P1 |
| **Story Points** | 3 |
| **FR Ref** | FR-707 |

---

### US-813: Chọn Passage/Prompt từ thư viện khi tạo lesson

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Chọn Passage/Prompt từ dropdown thư viện khi tạo lesson |
| **So that** | Tôi liên kết nội dung luyện tập có sẵn mà không cần nhập UUID thủ công |
| **Priority** | P1 |
| **Story Points** | 3 |
| **FR Ref** | FR-708 |

---

### US-814: Gửi thông báo cho lớp học

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Gửi thông báo cho tất cả thành viên trong lớp |
| **So that** | Học viên nhận được thông tin cập nhật, deadline, tài liệu mới |
| **Priority** | P1 |
| **Story Points** | 5 |
| **FR Ref** | FR-709 |

---

### US-815: Nhân bản Topic hoặc Lesson

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Nhân bản (duplicate) một Topic kèm tất cả Lessons hoặc một Lesson riêng lẻ |
| **So that** | Tôi tái sử dụng nội dung đã soạn mà không phải tạo lại từ đầu |
| **Priority** | P1 |
| **Story Points** | 3 |
| **FR Ref** | FR-710 |

---

### US-816: Xem tiến độ học viên trong lớp

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Xem bảng tổng hợp tiến độ của tất cả học viên: số bài đã làm, điểm trung bình, hoạt động gần nhất |
| **So that** | Tôi đánh giá được mức độ tham gia và hiệu quả học tập |
| **Priority** | P1 |
| **Story Points** | 5 |
| **FR Ref** | FR-711 |

---

### US-817: Xem thống kê instructor trên Dashboard

| Field | Value |
|-------|-------|
| **As a** | Instructor |
| **I want to** | Xem tổng số lớp, tổng học viên, số bài chờ review ngay trên Dashboard |
| **So that** | Tôi có cái nhìn tổng quan nhanh về hoạt động giảng dạy |
| **Priority** | P1 |
| **Story Points** | 2 |
| **FR Ref** | FR-712 |

---

## 9. Tổng kết Sprint Planning

| Sprint | Epics | Stories | Story Points |
|--------|-------|---------|-------------|
| Sprint 1 (M1) | E1 (Auth) | US-101..105 | 14 |
| Sprint 2 (M2) | E2 (Reading) | US-201..207 | 24 |
| Sprint 3 (M3) | E3 (Writing) | US-301..308 | 34 |
| Sprint 4 (M4+M5) | E4 (Dashboard) + E5 (Admin) | US-401..403 + US-501..506 | 29 |
| Sprint 5 (M5+M6) | E6 (Import) + E7 (Instructor) | US-601..603 + US-701..702 | 18 |
| Sprint 6 | E8 (Classroom) | US-801..810 | 37 |
| Sprint 7 | E8 Extended (Video, Announcements, Progress) | US-811..817 | 24 |
| Sprint 8 | Polish + Bug fixes | — | TBD |
| **Tổng** | **8 Epics** | **51 Stories** | **180 SP** |

---

> **Tham chiếu:** [03_user_personas_roles](03_user_personas_roles.md) | [05_functional_requirements](05_functional_requirements.md) | [06_acceptance_criteria](06_acceptance_criteria.md)
