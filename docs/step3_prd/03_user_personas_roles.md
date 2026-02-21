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
| **Mục tiêu** | Giảm thời gian chấm bài; đảm bảo feedback nhất quán; theo dõi learner progress |
| **Nhu cầu** | Xem bài nộp của learners; xem AI scoring để so sánh với đánh giá cá nhân; (tương lai) comment/override |
| **Pain points** | - Chấm 30 bài Writing/ngày → mệt mỏi, không nhất quán<br>- Không có tool track learner progress tập trung<br>- Muốn AI hỗ trợ chấm sơ bộ để mình chỉ cần review |
| **Kỳ vọng với IELTS Helper** | AI chấm chính xác ~80% so với human; giảm 60% thời gian review; dashboard learner progress |

**User Journey (MVP-lite):**
1. Login → View submissions list (filter by learner, date, prompt).
2. Click vào submission → xem essay + AI scores + feedback.
3. (Phase 2) Thêm comment hoặc adjust score.

---

### 2.3 Persona 3: Admin — Chị Hà (Content Operations)

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Tên đại diện** | Chị Hà Lê |
| **Tuổi** | 28 |
| **Nghề nghiệp** | Content Manager tại trung tâm, quản lý ngân hàng đề IELTS |
| **Trình độ kỹ thuật** | Trung bình; quen dùng CMS cơ bản; biết dùng NotebookLM |
| **Thiết bị** | Desktop |
| **Tần suất sử dụng** | Hàng ngày, mỗi lần 1–2 giờ |
| **Mục tiêu** | Xây dựng ngân hàng content chất lượng; đảm bảo provenance; publish content đúng thời hạn |
| **Nhu cầu** | Import tài liệu từ NotebookLM nhanh; quản lý passage/question/prompt dễ dàng; track source gốc |
| **Pain points** | - Copy-paste content từ nhiều nguồn → mất provenance<br>- Không biết content nào được dùng nhiều/ít<br>- Quản lý version content thủ công |
| **Kỳ vọng với IELTS Helper** | Import 1-click từ NotebookLM; auto-attach provenance; CMS trực quan; usage stats |

**User Journey (typical session):**
1. Login admin → đi đến Admin CMS.
2. Click "Import from NotebookLM" → nhập URL → review snippets → confirm import.
3. Tạo passage mới → paste body → attach imported snippets → add questions (MCQ + short).
4. Set level = B2, tags = ["environment", "science"] → Save draft.
5. Review → Publish → passage xuất hiện cho learners.
6. Xem Usage Stats: passage X có 45 submissions trong tuần → keep. Passage Y có 2 → review lại.

---

## 3. Vai trò hệ thống (System Roles)

| Role | Mô tả | Tạo bởi | Mặc định khi register |
|------|--------|---------|----------------------|
| `learner` | Người học; truy cập practice modules, dashboard, profile | Self-register | ✅ Có (default) |
| `instructor` | Giảng viên; xem submissions (MVP-lite); future: review/override | Self-register (chọn role) | ❌ Không |
| `admin` | Quản trị; full CRUD content, import, publish, manage users | Self-register (chọn role) / System seed | ❌ Không |

---

## 4. Ma trận phân quyền (Permission Matrix)

| Hành động | `learner` | `instructor` | `admin` |
|-----------|:---------:|:------------:|:-------:|
| **Auth** | | | |
| Register (self, chọn role) | ✅ | ✅ | ✅ |
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
| Import from NotebookLM | ❌ | ❌ | ✅ |
| View usage stats | ❌ | ❌ | ✅ |
| Manage user roles | ❌ | ❌ | ✅ |
| View audit log (content versions) | ❌ | ❌ | ✅ |

---

## 5. Luồng đăng ký & phân quyền

### 5.1 User Registration Flow (chọn role)

```
[User] → Chọn role (learner / instructor / admin) trên form đăng ký
       → POST /auth/register {email, password, display_name, role}
       → Server validate role ∈ [learner, instructor, admin]
       → Tạo account với role được chọn (default: learner)
       → Trả JWT access + refresh token
       → Redirect to Dashboard
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
