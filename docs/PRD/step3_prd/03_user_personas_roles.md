# 👥 User Personas & Roles — IELTS Helper

> **Mã tài liệu:** PRD-03  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [01_executive_summary](01_executive_summary.md)

---

## 1. Mục đích tài liệu

Mô tả chi tiết các persona (nhóm người dùng mục tiêu), vai trò (roles) trong hệ thống, và ma trận phân quyền (permission matrix) để đảm bảo mọi tính năng phục vụ đúng đối tượng.

---

## 2. Personas

### 2.1 Persona 1: Learner — Minh (Sinh viên tự học)

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Tên đại diện** | Minh Nguyễn |
| **Tuổi** | 22 |
| **Nghề nghiệp** | Sinh viên năm 4, chuẩn bị thi IELTS để du học |
| **Trình độ IELTS hiện tại** | 5.0 (target 6.5) |
| **Thiết bị** | Laptop (chủ yếu), điện thoại (phụ) |
| **Tần suất sử dụng** | 4–5 lần/tuần, mỗi lần 30–60 phút |
| **Mục tiêu** | Nâng band Reading từ 5.0 → 6.5; cải thiện Writing từ 4.5 → 6.0 |
| **Nhu cầu** | Luyện Reading có timer giống thi thật; nhận feedback Writing nhanh để biết sai ở đâu; theo dõi tiến bộ |
| **Pain points** | - Gửi bài Writing cho giảng viên → chờ 2–3 ngày → mất động lực<br>- Không biết sai ở đâu trong Reading → bỏ dở<br>- Tài liệu luyện thi nằm rải rác trên nhiều website |
| **Kỳ vọng với IELTS Helper** | Feedback Writing trong vài phút; giải thích Reading ngay; UI đẹp dễ dùng; track tiến bộ |

**User Journey (typical session):**
1. Login → Dashboard: xem progress tổng quan.
2. Chọn "Reading Practice" → filter theo level (B1) → chọn passage.
3. Bật timer → đọc passage → trả lời 10/13 câu → submit.
4. Xem score (77%) + giải thích từng câu sai → ghi chú.
5. Chuyển sang "Writing Practice" → chọn Task 2 prompt.
6. Viết essay ~250 words → submit → chờ 1–3 phút.
7. Nhận feedback: TR=5.5, CC=5.0, LR=6.0, GRA=5.5 → đọc suggestions.
8. Logout hoặc chuyển sang bài khác.

---

### 2.2 Persona 2: Instructor — Thầy Nam (Giảng viên trung tâm)

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Tên đại diện** | Thầy Nam Trần |
| **Tuổi** | 35 |
| **Nghề nghiệp** | Giảng viên IELTS tại trung tâm Anh ngữ, 8 năm kinh nghiệm |
| **Trình độ** | IELTS 8.0; CELTA certified |
| **Thiết bị** | Desktop tại trung tâm, laptop cá nhân |
| **Tần suất sử dụng** | 2–3 lần/tuần, mỗi lần 15–30 phút (review submissions) |
| **Mục tiêu** | Giảm thời gian chấm bài; tạo lớp học để quản lý học sinh; tổ chức nội dung học thành Topics → Lessons |
| **Nhu cầu** | Tạo lớp, thêm học sinh (manually hoặc QR/link); CRUD chủ đề + bài học; xem submissions; (tương lai) comment/override |
| **Pain points** | - Chấm 30 bài Writing/ngày → mệt mỏi, không nhất quán<br>- Không có tool quản lý lớp học + nội dung tập trung<br>- Muốn AI hỗ trợ chấm sơ bộ để mình chỉ cần review |
| **Kỳ vọng với IELTS Helper** | Tạo lớp dễ; share QR cho học sinh join; tổ chức Topics/Lessons rõ ràng; AI chấm chính xác ~80% so với human |

**User Journey (MVP):**
1. Login → Tạo lớp "IELTS B2 - K10" → nhận invite link + QR code.
2. Share QR cho học sinh tham gia lớp.
3. Vào lớp → tạo Topic "Reading Skills" → thêm Lesson "Skimming & Scanning" + link Passage có sẵn.
4. Xem danh sách thành viên → kiểm tra tiến độ.
5. View submissions list → click submission → xem essay + AI scores + feedback.
6. (Phase 2) Thêm comment hoặc adjust score.

---

### 2.3 Persona 3: Admin — Chị Hà (Content Operations)

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Tên đại diện** | Chị Hà Lê |
| **Tuổi** | 28 |
| **Nghề nghiệp** | Content Manager tại trung tâm, quản lý ngân hàng đề IELTS |
| **Trình độ kỹ thuật** | Trung bình; quen dùng CMS cơ bản; biết soạn nội dung IELTS trên DOCX/PDF |
| **Thiết bị** | Desktop |
| **Tần suất sử dụng** | Hàng ngày, mỗi lần 1–2 giờ |
| **Mục tiêu** | Xây dựng ngân hàng content chất lượng; đảm bảo provenance; publish content đúng thời hạn |
| **Nhu cầu** | Upload DOCX/PDF và tự động trích xuất passage + questions; quản lý passage/question/prompt dễ dàng; track source document gốc |
| **Pain points** | - Copy-paste content từ nhiều nguồn → mất provenance<br>- Không biết content nào được dùng nhiều/ít<br>- Quản lý version content thủ công |
| **Kỳ vọng với IELTS Helper** | Upload file 1-click → AI parse → review → publish; auto-link source document; CMS trực quan; usage stats |

**User Journey (typical session):**
1. Login admin → đi đến Admin CMS.
2. Click "Import DOCX/PDF" → chọn file → AI parse → review passage + questions → confirm save.
3. Tạo passage mới → paste body → attach imported snippets → add questions (MCQ + short).
4. Set level = B2, tags = ["environment", "science"] → Save draft.
5. Review → Publish → passage xuất hiện cho learners.
6. Xem Usage Stats: passage X có 45 submissions trong tuần → keep. Passage Y có 2 → review lại.

---

## 3. Vai trò hệ thống (System Roles)

| Role | Mô tả | Tạo bởi | Mặc định khi register |
|------|--------|---------|----------------------|
| `learner` | Người học; truy cập practice modules, dashboard, profile | Self-register | ✅ Có (mặc định, luôn luôn) |
| `instructor` | Giảng viên; xem submissions (MVP-lite); future: review/override | Admin gán qua PATCH /admin/users/{id}/role | ❌ Không |
| `admin` | Quản trị; full CRUD content, import, publish, manage users | Admin gán qua PATCH /admin/users/{id}/role / System seed | ❌ Không |

---

## 4. Ma trận phân quyền (Permission Matrix)

| Hành động | `learner` | `instructor` | `admin` |
|-----------|:---------:|:------------:|:-------:|
| **Auth** | | | |
| Register (self, mặc định learner) | ✅ | — | — |
| Login / Refresh / Logout | ✅ | ✅ | ✅ |
| View & update own profile | ✅ | ✅ | ✅ |
| **Reading** | | | |
| Browse passages catalog | ✅ | ✅ | ✅ |
| View passage detail + questions | ✅ | ✅ | ✅ |
| Submit reading answers | ✅ | ❌ | ❌ |
| View own reading history | ✅ | ❌ | ❌ |
| **Writing** | | | |
| Browse prompts catalog | ✅ | ✅ | ✅ |
| Submit essay for scoring | ✅ | ❌ | ❌ |
| View own writing submissions + feedback | ✅ | ❌ | ❌ |
| View any learner's submissions | ❌ | ✅ | ✅ |
| **Dashboard** | | | |
| View own progress dashboard | ✅ | ❌ | ❌ |
| View learner progress (aggregate) | ❌ | ✅ | ✅ |
| **Admin CMS** | | | |
| CRUD passages | ❌ | ❌ | ✅ |
| CRUD questions | ❌ | ❌ | ✅ |
| CRUD prompts | ❌ | ❌ | ✅ |
| Publish / unpublish content | ❌ | ❌ | ✅ |
| Import DOCX/PDF | ❌ | ✅ | ✅ |
| View usage stats | ❌ | ❌ | ✅ |
| Manage user roles | ❌ | ❌ | ✅ |
| View audit log (content versions) | ❌ | ❌ | ✅ |
| **Classroom** | | | |
| Create classroom | ❌ | ✅ | ✅ |
| Edit/delete/archive own classroom | ❌ | ✅ (owner) | ✅ |
| Add/remove members | ❌ | ✅ (owner) | ✅ |
| Join classroom via invite code | ✅ | ✅ | ✅ |
| CRUD topics/lessons (own classroom) | ❌ | ✅ (owner) | ✅ |
| View published topics/lessons (member) | ✅ | ✅ | ✅ |
| View member list | ❌ | ✅ (owner) | ✅ |

---

## 5. Luồng đăng ký & phân quyền

### 5.1 User Registration Flow (mặc định learner)

```
[User] → Điền email, password, display_name trên form đăng ký
       → POST /auth/register {email, password, display_name}
       → Server tạo account với role = learner (LUÔN LUÔN)
       → Trả JWT access + refresh token
       → Redirect to Dashboard

Lưu ý: Không cho phép chọn role khi đăng ký.
Chỉ Admin có quyền thay đổi role qua PATCH /admin/users/{id}/role
```

### 5.2 Admin Role Management (bổ sung)

```
[Admin] → GET /admin/users → Tìm user
        → PATCH /admin/users/{id}/role {role:"instructor"}
        → User account cập nhật role
        → Áp dụng cho trường hợp cần thay đổi role sau đăng ký
```

### 5.3 Token Lifecycle

| Token | TTL | Lưu trữ | Refresh |
|-------|-----|---------|---------|
| Access Token (JWT) | 15 phút | Memory / httpOnly cookie | Auto-refresh khi gần hết |
| Refresh Token | 7 ngày | httpOnly cookie | Rotate on use; revoke on logout |

---

## 6. Quy tắc RBAC Implementation

### 6.1 Backend Middleware
- Mỗi route được guard bởi `@Roles(...)` decorator (NestJS).
- JWT payload chứa `{sub: userId, role: "learner"}`.
- Middleware extract JWT → verify → check role against route requirement.
- Nếu role không đủ → trả `403 Forbidden`.
- Nếu token invalid/expired → trả `401 Unauthorized`.

### 6.2 Frontend Route Guard
- React context lưu user role sau login.
- Routes admin (`/admin/*`) chỉ render nếu `role === 'admin'`.
- Routes instructor (`/instructor/*`) chỉ render nếu `role === 'instructor' || role === 'admin'`.
- Unauthorized access → redirect to `/login` hoặc hiển thị 403 page.

### 6.3 API Response khi thiếu quyền

```json
{
  "statusCode": 403,
  "message": "Forbidden: insufficient role",
  "error": "Forbidden"
}
```

---

## 7. Mở rộng vai trò (Phase 2+ considerations)

| Vai trò mới | Mô tả | Khi nào |
|-------------|--------|---------|
| `super_admin` | Quản lý admins, system config, billing | Phase 2 nếu có multi-tenant |
| `reviewer` | Chỉ review/approve content (không edit) | Phase 2 nếu workflow phức tạp |
| `premium_learner` | Learner có quyền sử dụng premium scoring tier | Phase 2 nếu có billing |

---

> **Tham chiếu:** [04_user_stories](04_user_stories.md) | [05_functional_requirements](05_functional_requirements.md) | [11_business_rules](11_business_rules.md)

---

# ══════════════════════════════════════════════════════
# BỔ SUNG TỪ BUSINESS ANALYSIS & REDESIGN (07/2026)
# Các mục dưới đây bổ sung từ BA 6 vòng elicitation,
# phân tích đối thủ, và thiết kế state machine mới.
# Khi có mâu thuẫn với nội dung trên, phần này được ưu tiên.
# ══════════════════════════════════════════════════════

# User Personas & Roles
## Dự án Langy

> **Phiên bản:** 1.0
> **Ngày tạo:** 06/07/2026

---

## 1. Personas

### 1.1 Persona 1: Giáo viên IELTS tự do (Instructor)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên đại diện** | Cô Linh |
| **Tuổi** | 28–40 |
| **Nghề nghiệp** | Gia sư IELTS tự do, dạy lớp 10–15 HS |
| **Thu nhập từ dạy** | 1.5–3 triệu/HS/khóa |
| **Trình độ công nghệ** | Quen Zalo, Google Docs, Google Classroom; không biết code |
| **Thiết bị chính** | Laptop |
| **Workflow hiện tại** | Giao đề qua Zalo/Docs → HS làm bài trên Docs → chấm tay hoặc copy-paste từng bài vào ChatGPT → báo điểm qua tin nhắn → nhập Excel |
| **Nỗi đau lớn nhất** | "Vòng lặp copy-paste" — mỗi bài Writing phải copy từ Docs, dán vào ChatGPT, chờ kết quả, copy ngược lại |
| **Rào cản chuyển đổi** | Mất công nhập lại kho đề; ngại công nghệ mới, quen Zalo |
| **Giá trị Langy mang lại** | Tiết kiệm hàng giờ chấm bài mỗi tuần; dashboard tổng hợp cả lớp; kho đề tập trung |
| **Quyền quyết định** | Tự quyết mọi công cụ — không cần duyệt qua trung tâm |

**Job-to-be-done:**
> "Khi học sinh nộp bài Writing, tôi muốn AI chấm ngay theo chuẩn IELTS để tôi chỉ cần review và bổ sung, thay vì chấm tay hoặc copy-paste từng bài."

---

### 1.2 Persona 2: Học sinh trong lớp (Learner — classroom)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên đại diện** | Minh |
| **Tuổi** | 15–22 (phần lớn dưới 18 — lưu ý pháp lý) |
| **Mục tiêu** | Đạt band IELTS theo yêu cầu (xét tuyển ĐH, du học, chuẩn đầu ra) |
| **Trình độ công nghệ** | Native mobile; quen dùng app |
| **Thiết bị chính** | Điện thoại khi làm bài tập, laptop khi làm đề dài |
| **Cách vào Langy** | Không tự chọn — dùng vì giáo viên yêu cầu |
| **Nỗi đau** | Tài liệu phân tán; không biết mình tiến bộ hay thụt lùi; chờ feedback GV lâu |
| **Giá trị Langy mang lại** | Feedback Writing trong vài phút (chế độ A); biểu đồ tiến bộ band; giải thích đáp án Reading |
| **Ai trả tiền** | Phụ huynh hoặc tự trả (tùy độ tuổi) |
| **Lưu ý đặc biệt** | Phần lớn dưới 18 → consent phụ huynh bắt buộc theo Luật 91/2025/QH15 |

**Job-to-be-done:**
> "Sau khi nộp bài, tôi muốn biết ngay mình được bao nhiêu và sai ở đâu, thay vì chờ cô chấm 3 ngày."

---

### 1.3 Persona 3: Học sinh tự ôn (Learner — self-study)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên đại diện** | Hà |
| **Tuổi** | 18–30 |
| **Nghề nghiệp** | Sinh viên hoặc người đi làm; tự ôn không qua GV/trung tâm |
| **Trình độ công nghệ** | Cao hơn trung bình; đã quen dùng ChatGPT, Study4 |
| **Thiết bị** | Cả điện thoại lẫn laptop |
| **Cách vào Langy** | Tự tìm thấy (search, group Facebook, chia sẻ link) |
| **Nỗi đau** | Paste bài vào ChatGPT → không lưu lịch sử, rubric không nhất quán, mỗi lần chấm mỗi kiểu |
| **Giá trị Langy mang lại** | Chấm nhất quán theo rubric chuẩn; lịch sử band theo thời gian; kho đề có giải thích |
| **Sẵn sàng trả tiền** | Chưa validate — giả định A3; giá trị phải đủ lớn so với ChatGPT free |

**Job-to-be-done:**
> "Tôi muốn một chỗ chấm Writing theo đúng chuẩn IELTS và cho tôi thấy mình tiến bộ qua từng tuần, thay vì paste vào ChatGPT rồi quên."

---

## 2. RBAC Matrix (Role-Based Access Control)

| Chức năng | Admin | Instructor | Learner (classroom) | Learner (self-study) |
|-----------|:-----:|:----------:|:-------------------:|:--------------------:|
| Quản lý users | ✅ | ❌ | ❌ | ❌ |
| Tạo/quản lý classroom | ❌ | ✅ | ❌ | ❌ |
| Mời HS vào lớp | ❌ | ✅ | ❌ | ❌ |
| Tham gia lớp bằng mã mời | ❌ | ❌ | ✅ | ❌ |
| Giao bài (lesson) | ❌ | ✅ | ❌ | ❌ |
| Cấu hình chế độ Writing A/B | ❌ | ✅ | ❌ | ❌ |
| Tạo/import đề (Passage, Prompt) | ✅ | ✅ | ❌ | ❌ |
| Làm bài Reading | ❌ | ❌ | ✅ | ✅ |
| Nộp bài Writing | ❌ | ❌ | ✅ | ✅ |
| Xem feedback AI (tùy chế độ lớp) | ❌ | ✅ | ✅* | ✅ |
| Review + chốt điểm Writing | ❌ | ✅ | ❌ | ❌ |
| Xem dashboard lớp | ❌ | ✅ | ❌ | ❌ |
| Xem tiến bộ cá nhân | ❌ | ❌ | ✅ | ✅ |
| Xóa tài khoản + dữ liệu | ✅ | ✅ | ✅ | ✅ |

*HS classroom chế độ B: chỉ thấy sau GV duyệt

---

## 3. Phân biệt hai loại Learner trong hệ thống

| Tiêu chí | Learner (classroom) | Learner (self-study) |
|----------|:-------------------:|:--------------------:|
| Có `classroom_id` | ✅ (thuộc ≥1 lớp) | ❌ (không thuộc lớp nào) |
| Writing state machine | Nhánh A hoặc B tùy lớp | Luôn nhánh A (released_ai là điểm cuối) |
| Có GV review | ✅ → có trạng thái `finalized` | ❌ → dừng ở `released_ai` |
| Band AI nhãn | "Ước lượng — chờ GV xác nhận" | "Ước lượng bởi AI" |
| Nhận bài giao | ✅ (qua Lesson) | ❌ (tự chọn từ kho) |
| Dashboard | Xem trong ngữ cảnh lớp | Dashboard cá nhân |
| GTM | GV kéo vào (teacher-led) | Tự đến (organic) |

---

## 4. Stakeholder map

```
                    ┌─────────────────────┐
                    │     Founder         │
                    │  (Dev + GV + Admin) │
                    └──────────┬──────────┘
                               │ builds & operates
               ┌───────────────┼───────────────┐
               ▼                               ▼
    ┌──────────────────┐            ┌──────────────────┐
    │   Instructor     │            │  Learner         │
    │   (buyer/wedge)  │──assigns──▶│  (end user)      │
    └──────────────────┘            └────────┬─────────┘
                                             │
                                    ┌────────▼─────────┐
                                    │   Phụ huynh      │
                                    │   (payer/approver)│
                                    └──────────────────┘
```
