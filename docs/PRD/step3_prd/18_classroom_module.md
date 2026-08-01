# 🏫 Classroom Module — IELTS Helper

> **Ma tai lieu:** PRD-18
> **Phien ban:** 1.0
> **Ngay tao:** 2026-03-15
> **Trang thai:** Draft
> **Tham chieu:** [09_api_specifications](09_api_specifications.md) | [10_ui_ux_specifications](10_ui_ux_specifications.md) | [11_business_rules](11_business_rules.md)

---

## 1. Tong quan

### 1.1 Muc dich

Module Classroom cho phep giang vien (instructor) tao va quan ly lop hoc truc tuyen, to chuc noi dung giang day theo cau truc Topic > Lesson, quan ly hoc vien, va theo doi tien do hoc tap. Day la module cot loi de IELTS Helper chuyen tu mot cong cu luyen thi ca nhan thanh nen tang quan ly lop hoc toan dien.

### 1.2 Gia tri mang lai

| Doi tuong | Gia tri |
|-----------|---------|
| **Giang vien** | Tao lop hoc, to chuc noi dung giang day co cau truc, theo doi tien do tung hoc vien, gui thong bao cho lop |
| **Hoc vien** | Tham gia lop qua ma moi, truy cap bai hoc duoc to chuc theo trinh tu, nop bai va nhan phan hoi |
| **Admin** | Quan ly toan bo he thong lop hoc, truy cap moi lop voi quyen admin |

### 1.3 Mo hinh du lieu tong quan

```
Classroom (1) ──► (N) ClassroomMember
    │
    ├──► (N) Topic
    │         │
    │         └──► (N) Lesson
    │                    │
    │                    └──► (N) LessonSubmission
    │
    └──► (N) Announcement
```

---

## 2. Classroom Entity

### 2.1 Tao lop hoc

| Thuoc tinh | Chi tiet |
|------------|----------|
| **Dieu kien** | Nguoi dung phai co role `instructor` hoac `admin` (CR-001) |
| **Truong bat buoc** | `name` (max 100 ky tu) |
| **Truong tuy chon** | `description` (max 1000 ky tu), `cover_image_url` (URL hop le), `max_members` (2-200, mac dinh 50) |
| **Tu dong tao** | `invite_code` (8 ky tu hex viet hoa, duy nhat), `status` = `active` |
| **Tu dong them member** | Owner duoc tu dong them vao lop voi role `teacher` |

### 2.2 Cap nhat lop hoc

- Chi owner hoac admin duoc phep cap nhat (CR-003).
- Co the cap nhat: `name`, `description`, `cover_image_url`, `max_members`, `status`.
- Status co the chuyen doi giua `active` va `archived`.

### 2.3 Xoa / Luu tru lop hoc

- Su dung **soft delete**: chuyen `status` tu `active` sang `archived` (CR-010).
- Lop da archived van luu tru du lieu nhung khong hoat dong.
- Chi owner hoac admin duoc phep thuc hien.

### 2.4 Ma moi (Invite Code)

- Tu dong tao khi tao lop: 8 ky tu hex viet hoa (vd: `A3F7C201`).
- Duoc tao bang `crypto.randomBytes(4).toString('hex').toUpperCase()`.
- Dam bao duy nhat (unique) trong he thong — kiem tra collision truoc khi luu.
- Co the tao lai ma moi (`regenerate`) bat ky luc nao boi owner.

### 2.5 Gioi han thanh vien

- Mac dinh: 50 thanh vien.
- Co the thiet lap khi tao/cap nhat: toi thieu 2, toi da 200.
- He thong tu dong tu choi khi vuot gioi han (CR-005).

---

## 3. Quan ly thanh vien (Member Management)

### 3.1 Tham gia lop qua ma moi (Join)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `POST /classrooms/join` |
| **Body** | `{invite_code}` (8 ky tu) |
| **Ket qua** | Nguoi dung duoc them voi role `student` |
| **Rang buoc** | Ma phai hop le (CR-002), lop chua day (CR-005), chua la thanh vien (CR-006) |

### 3.2 Them thanh vien boi Owner (Add Member)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `POST /classrooms/:id/members` |
| **Body** | `{email}` |
| **Quyen** | Chi owner hoac admin |
| **Logic** | Tim user theo email, them voi role `student` |
| **Rang buoc** | Email phai ton tai trong he thong, chua la thanh vien, lop chua day |

### 3.3 Xem danh sach thanh vien

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `GET /classrooms/:id/members` |
| **Quyen** | Chi owner hoac admin |
| **Ket qua** | Danh sach gom: `display_name`, `email`, `id`, `role`, `joined_at` |
| **Sap xep** | Theo `joined_at` tang dan |

### 3.4 Xoa thanh vien (Remove)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `DELETE /classrooms/:id/members/:userId` |
| **Quyen** | Chi owner hoac admin |
| **Rang buoc** | Thanh vien phai ton tai trong lop |

### 3.5 Vai tro thanh vien

| Role | Quyen |
|------|-------|
| `teacher` | Toan quyen quan ly: CRUD topic/lesson, xem submissions, quan ly thanh vien, gui thong bao |
| `student` | Xem noi dung da published, nop bai, xem submissions cua minh |

---

## 4. Quan ly chu de (Topic Management)

### 4.1 Tao Topic

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `POST /classrooms/:classroomId/topics` |
| **Quyen** | Classroom owner hoac admin |
| **Truong bat buoc** | `title` (max 200 ky tu) |
| **Truong tuy chon** | `description` (max 1000 ky tu) |
| **Tu dong** | `order_index` = max hien tai + 1, `status` = `draft` |

### 4.2 Cap nhat Topic

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `PATCH /topics/:id` |
| **Quyen** | Classroom owner hoac admin |
| **Truong cap nhat** | `title`, `description`, `status`, `order_index` |

### 4.3 Xoa Topic

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `DELETE /topics/:id` |
| **Quyen** | Classroom owner hoac admin |
| **Luu y** | **CASCADE**: xoa tat ca Lessons va LessonSubmissions lien quan |

### 4.4 Sap xep lai (Reorder)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `PATCH /classrooms/:classroomId/topics/reorder` |
| **Body** | `{topic_ids: [uuid, uuid, ...]}` |
| **Logic** | Cap nhat `order_index` theo thu tu mang, thuc hien trong transaction |

### 4.5 Chuyen doi trang thai (Toggle Status)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `PATCH /classrooms/topics/:topicId/toggle-status` |
| **Logic** | `published` ↔ `draft` |
| **Quyen** | Classroom owner hoac admin |

### 4.6 Nhan ban (Duplicate)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `POST /classrooms/topics/:topicId/duplicate` |
| **Logic** | Tao ban sao Topic kem tat ca Lessons, `status` = `draft`, title them hau to "(Copy)" |
| **Quyen** | Classroom owner hoac admin |

### 4.7 Hien thi theo vai tro (CR-007)

- **Teacher**: thay tat ca topics (draft + published).
- **Student**: chi thay topics co `status = 'published'`.

---

## 5. Quan ly bai hoc (Lesson Management)

### 5.1 Tao Lesson

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `POST /topics/:topicId/lessons` |
| **Quyen** | Classroom owner hoac admin |
| **Truong bat buoc** | `title` (max 200 ky tu) |
| **Truong tuy chon** | `content` (HTML/Text), `content_type`, `linked_entity_id`, `status`, `attachment_url`, `allow_submit`, `allow_checkscore`, `target_level`, `reading_payload` |
| **Tu dong** | `order_index` = max hien tai + 1 |

### 5.2 Cac loai noi dung (Content Types)

| content_type | Mo ta | Hanh vi hien thi |
|-------------|-------|-------------------|
| `text` | Noi dung HTML/Markdown tu do | Rendered HTML voi prose styling |
| `video` | URL video (YouTube/Vimeo) | Iframe embed, tu dong nhan dang URL |
| `passage` | Lien ket den Reading Passage | Launch card voi nut "Start Reading", lien ket qua `linked_entity_id` |
| `prompt` | Lien ket den Writing Prompt | Launch card voi nut "Start Writing", lien ket qua `linked_entity_id` |

### 5.3 Reading Payload (Inline Passage Creation)

Khi tao/cap nhat lesson voi `reading_payload`, he thong tu dong:
1. Tao hoac cap nhat `Passage` entity voi body va level.
2. Tao cac `Question` records tu payload.
3. Lien ket `linked_entity_id` vao passage moi tao.
4. Tao HTML render cho noi dung lesson.

### 5.4 Cap nhat Lesson

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `PATCH /lessons/:id` |
| **Quyen** | Classroom owner hoac admin |
| **Truong cap nhat** | Tat ca truong cua CreateLessonDto + `order_index` |

### 5.5 Xoa Lesson

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `DELETE /lessons/:id` |
| **Quyen** | Classroom owner hoac admin |
| **Luu y** | **CASCADE**: xoa tat ca LessonSubmissions lien quan |

### 5.6 Sap xep lai (Reorder)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `PATCH /topics/:topicId/lessons/reorder` |
| **Body** | `{lesson_ids: [uuid, uuid, ...]}` |
| **Logic** | Cap nhat `order_index` trong transaction |

### 5.7 Chuyen doi trang thai (Toggle Status)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `PATCH /classrooms/lessons/:lessonId/toggle-status` |
| **Logic** | `published` ↔ `draft` |

### 5.8 Nhan ban (Duplicate)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `POST /classrooms/lessons/:lessonId/duplicate` |
| **Logic** | Tao ban sao Lesson, `status` = `draft`, title them hau to "(Copy)" |

### 5.9 Hien thi theo vai tro (CR-007)

- **Teacher**: thay tat ca lessons (draft + published).
- **Student**: chi thay lessons co `status = 'published'`.

---

## 6. Nop bai (Lesson Submissions)

### 6.1 Hoc vien nop bai

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `POST /lessons/:id/submissions` |
| **Body** | `{content}` |
| **Dieu kien** | Lesson phai ton tai, `allow_submit = true` (CR-008), noi dung khong rong |
| **Tu dong** | Dem `word_count` bang cach tach khoang trang, `status` = `submitted` |

### 6.2 Xem tat ca submissions (Teacher)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `GET /lessons/:id/submissions` |
| **Ket qua** | Danh sach submissions gom thong tin user (`id`, `display_name`, `email`) |
| **Sap xep** | Theo `created_at` giam dan |

### 6.3 Xem submissions cua minh (Student)

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `GET /lessons/:id/my-submissions` |
| **Ket qua** | Chi submissions cua nguoi dung hien tai |
| **Sap xep** | Theo `created_at` giam dan |

### 6.4 Trang thai va cham diem

| Status | Mo ta |
|--------|-------|
| `submitted` | Bai da nop, chua duoc cham |
| `graded` | Giang vien da cham diem va phan hoi |

- Truong `score` (Float, nullable): diem do giang vien cham.
- Truong `feedback` (Text, nullable): nhan xet cua giang vien.

---

## 7. Theo doi tien do hoc vien (Student Progress)

### 7.1 Endpoint

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `GET /classrooms/:id/progress` |
| **Quyen** | Chi classroom owner hoac admin |

### 7.2 Du lieu tra ve cho moi hoc vien

| Truong | Mo ta |
|--------|-------|
| `user_id` | ID hoc vien |
| `display_name` | Ten hien thi |
| `email` | Email |
| `joined_at` | Ngay tham gia lop |
| `reading_count` | So bai Reading da lam (5 bai gan nhat) |
| `reading_avg` | Diem trung binh Reading (%) |
| `writing_count` | So bai Writing da cham (5 bai gan nhat, `processing_status = done`) |
| `writing_avg` | Diem trung binh Writing (overall score) |
| `recent_reading` | 3 bai Reading gan nhat |
| `recent_writing` | 3 bai Writing gan nhat |

### 7.3 Luu y

- Chi hien thi hoc vien co `role = 'student'` (khong gom teacher).
- Diem Reading lay tu `score_pct` cua `ReadingSubmission`.
- Diem Writing lay tu `scores.overall` cua `WritingSubmission` (chi bai `done`).
- Du lieu la **toan cuc** (tat ca submissions cua hoc vien, khong chi trong lop).

---

## 8. Thong bao (Announcements)

### 8.1 Xem thong bao

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `GET /classrooms/:id/announcements` |
| **Quyen** | Classroom owner hoac admin |
| **Ket qua** | 20 thong bao gan nhat, gom `author.display_name` |
| **Sap xep** | Theo `created_at` giam dan |

### 8.2 Tao thong bao

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `POST /classrooms/:id/announcements` |
| **Body** | `{message}` |
| **Quyen** | Chi classroom owner |

### 8.3 Xoa thong bao

| Khia canh | Chi tiet |
|-----------|----------|
| **Endpoint** | `DELETE /classrooms/:id/announcements/:announcementId` |
| **Quyen** | Chi classroom owner |

---

## 9. Business Rules

| ID | Rule | Enforcement | Hanh dong khi vi pham |
|----|------|-------------|----------------------|
| CR-001 | Chi instructor hoac admin duoc tao classroom | `RolesGuard` voi `@Roles('instructor', 'admin')` | 403 Forbidden |
| CR-002 | Tham gia lop yeu cau ma moi hop le (8 ky tu) | Backend validation — `findUnique({invite_code})` | 404 "Invalid invite code" |
| CR-003 | Chi owner hoac admin duoc cap nhat/xoa classroom | `checkOwnership()` trong controller | 403 "Only classroom owner can perform this action" |
| CR-004 | Owner tu dong duoc them vao lop voi role `teacher` khi tao lop | `classroomService.create()` — `members.create` | — |
| CR-005 | Khong the tham gia/them thanh vien khi lop da day (`members >= max_members`) | Backend check truoc khi tao member | 403 "Classroom is full" |
| CR-006 | Khong the tham gia lop neu da la thanh vien (unique constraint `classroom_id + user_id`) | `findUnique` + unique constraint | 409 "Already a member" / "User is already a member" |
| CR-007 | Hoc vien chi thay noi dung da published (topics va lessons); giang vien thay tat ca | `findOne()` / `findAllByClassroom()` / `findAllByTopic()` filter theo role | Noi dung draft bi an |
| CR-008 | Hoc vien chi duoc nop bai khi lesson co `allow_submit = true` | Backend check `lesson.allow_submit` | 403 "Submissions are not enabled for this lesson" |
| CR-009 | Noi dung bai nop khong duoc rong | Backend check `body.content?.trim()` | 403 "Content cannot be empty" |
| CR-010 | Xoa classroom la soft delete (chuyen sang `archived`), du lieu van luu tru | `classroomService.remove()` update status | — |

---

## 10. Tham chieu API (API Reference)

Toan bo API cua module Classroom duoc dinh nghia tai [PRD-09 — API Specifications](09_api_specifications.md), muc 10.x. Duoi day la bang tom tat:

### 10.1 Classroom Core

| Method | Path | Mo ta | Quyen | Muc PRD-09 |
|--------|------|-------|-------|------------|
| POST | `/classrooms` | Tao lop hoc | instructor/admin | 10.5 |
| GET | `/classrooms` | Danh sach lop (owned + joined) | authenticated | 10.5 |
| GET | `/classrooms/:id` | Chi tiet lop (gom topics + lessons) | member/admin | 10.5 |
| PATCH | `/classrooms/:id` | Cap nhat lop | owner/admin | 10.5 |
| DELETE | `/classrooms/:id` | Archive lop (soft delete) | owner/admin | 10.5 |

### 10.2 Members

| Method | Path | Mo ta | Quyen | Muc PRD-09 |
|--------|------|-------|-------|------------|
| POST | `/classrooms/:id/members` | Them thanh vien (qua email) | owner/admin | 10.5 |
| GET | `/classrooms/:id/members` | Danh sach thanh vien | owner/admin | 10.5 |
| DELETE | `/classrooms/:id/members/:userId` | Xoa thanh vien | owner/admin | 10.5 |

### 10.3 Invite

| Method | Path | Mo ta | Quyen | Muc PRD-09 |
|--------|------|-------|-------|------------|
| POST | `/classrooms/join` | Tham gia lop qua invite code | authenticated | 10.5 |
| GET | `/classrooms/:id/invite` | Lay invite code + URL + QR | owner | 10.5 |
| POST | `/classrooms/:id/invite/regenerate` | Tao lai ma moi moi | owner | 10.5 |

### 10.4 Topics

| Method | Path | Mo ta | Quyen | Muc PRD-09 |
|--------|------|-------|-------|------------|
| POST | `/classrooms/:classroomId/topics` | Tao topic | owner/admin | 10.5 |
| GET | `/classrooms/:classroomId/topics` | Danh sach topics | member | 10.5 |
| PATCH | `/topics/:id` | Cap nhat topic | owner/admin | 10.5 |
| DELETE | `/topics/:id` | Xoa topic (cascade) | owner/admin | 10.5 |
| PATCH | `/classrooms/:classroomId/topics/reorder` | Sap xep lai | owner/admin | 10.5 |
| PATCH | `/classrooms/topics/:topicId/toggle-status` | Chuyen published/draft | owner/admin | 10.1 |
| POST | `/classrooms/topics/:topicId/duplicate` | Nhan ban topic | owner/admin | 10.3 |

### 10.5 Lessons

| Method | Path | Mo ta | Quyen | Muc PRD-09 |
|--------|------|-------|-------|------------|
| POST | `/topics/:topicId/lessons` | Tao lesson | owner/admin | 10.5 |
| GET | `/topics/:topicId/lessons` | Danh sach lessons | member | 10.5 |
| GET | `/lessons/:id` | Chi tiet lesson | authenticated | 10.5 |
| PATCH | `/lessons/:id` | Cap nhat lesson | owner/admin | 10.5 |
| DELETE | `/lessons/:id` | Xoa lesson | owner/admin | 10.5 |
| PATCH | `/topics/:topicId/lessons/reorder` | Sap xep lai | owner/admin | 10.5 |
| PATCH | `/classrooms/lessons/:lessonId/toggle-status` | Chuyen published/draft | owner/admin | 10.1 |
| POST | `/classrooms/lessons/:lessonId/duplicate` | Nhan ban lesson | owner/admin | 10.3 |

### 10.6 Lesson Submissions

| Method | Path | Mo ta | Quyen | Muc PRD-09 |
|--------|------|-------|-------|------------|
| POST | `/lessons/:id/submissions` | Nop bai | authenticated | 10.7 |
| GET | `/lessons/:id/submissions` | Tat ca submissions | owner/admin | 10.7 |
| GET | `/lessons/:id/my-submissions` | Submissions cua minh | authenticated | 10.7 |

### 10.7 Announcements

| Method | Path | Mo ta | Quyen | Muc PRD-09 |
|--------|------|-------|-------|------------|
| GET | `/classrooms/:id/announcements` | Danh sach thong bao | owner/admin | 10.4 |
| POST | `/classrooms/:id/announcements` | Tao thong bao | owner | 10.4 |
| DELETE | `/classrooms/:id/announcements/:announcementId` | Xoa thong bao | owner | 10.4 |

### 10.8 Library & Progress

| Method | Path | Mo ta | Quyen | Muc PRD-09 |
|--------|------|-------|-------|------------|
| GET | `/classrooms/library/passages` | Passages da published | authenticated | 10.2 |
| GET | `/classrooms/library/prompts` | Prompts da published | authenticated | 10.2 |
| GET | `/classrooms/:id/progress` | Tien do hoc vien | owner/admin | 10.5 |

---

## 11. Tham chieu man hinh (Screen Specifications)

Tat ca man hinh cua module Classroom duoc dinh nghia tai [PRD-10 — UI/UX Specifications](10_ui_ux_specifications.md), muc 9. Duoi day la bang tom tat:

| Screen | Route | Mo ta | Muc PRD-10 |
|--------|-------|-------|------------|
| S30 | `/classrooms` | Danh sach lop hoc (grid cards) | 9 — S30 |
| S31 | `/classrooms/new`, `/classrooms/:id/edit` | Tao / Chinh sua lop | 9 — S31 |
| S32 | `/classrooms/:id` | Chi tiet lop (sidebar topics + main panel lessons) | 9 — S32 |
| S33 | Modal trong S32 | Invite modal (QR + link + code) | 9 — S33 |
| S34 | `/classrooms/:id/members` | Quan ly thanh vien | 9 — S34 |
| S35 | `/classrooms/join/:code` | Trang tham gia lop | 9 — S35 |
| S36 | Embedded trong S32 | Lesson viewer (smart renderer theo content_type) | 9 — S36 |
| S36b | `/classrooms/:id/lessons/:lessonId` | Trang chi tiet lesson (full page) | 9 — S36b |
| S37 | `/classrooms/:id/progress` | Theo doi tien do hoc vien | 9 — S37 |
| S38 | Tab trong S32 | Thong bao lop hoc | 9 — S38 |
| S39 | `/dashboard` (instructor) | Dashboard giang vien (stats cards) | 9 — S39 |

---

## 12. Cau truc database

### 12.1 Bang chinh

| Bang | Mo ta | Quan he |
|------|-------|--------|
| `classrooms` | Lop hoc | Owner → users, has many members, topics, announcements |
| `classroom_members` | Thanh vien lop | Belongs to classroom + user; unique(classroom_id, user_id) |
| `topics` | Chu de trong lop | Belongs to classroom; has many lessons; CASCADE on delete |
| `lessons` | Bai hoc trong chu de | Belongs to topic; has many submissions; CASCADE on delete |
| `lesson_submissions` | Bai nop cua hoc vien | Belongs to lesson + user; CASCADE on delete |
| `announcements` | Thong bao lop hoc | Belongs to classroom + author (user); CASCADE on delete |

### 12.2 Enums

| Enum | Gia tri | Su dung |
|------|---------|---------|
| `ClassroomStatus` | `active`, `archived` | Trang thai lop hoc |
| `ClassroomRole` | `teacher`, `student` | Vai tro thanh vien |
| `LessonContentType` | `text`, `video`, `passage`, `prompt` | Loai noi dung bai hoc |
| `ContentStatus` | `draft`, `published` | Trang thai topic va lesson |

### 12.3 Indexes

| Bang | Index | Muc dich |
|------|-------|---------|
| classrooms | `invite_code` (unique) | Tim lop theo ma moi |
| classrooms | `owner_id` | Loc lop theo owner |
| classrooms | `status` | Loc theo trang thai |
| classroom_members | `user_id` | Tim lop cua user |
| classroom_members | `classroom_id + user_id` (unique) | Dam bao khong trung member |
| topics | `classroom_id + order_index` | Sap xep topics |
| lessons | `topic_id + order_index` | Sap xep lessons |
| lesson_submissions | `lesson_id + created_at DESC` | Lich su nop bai |
| lesson_submissions | `user_id` | Tim bai nop theo user |
| announcements | `classroom_id + created_at` | Lich su thong bao |

---

> **Tham chieu:** [09_api_specifications](09_api_specifications.md) | [10_ui_ux_specifications](10_ui_ux_specifications.md) | [11_business_rules](11_business_rules.md) | [08_data_requirements](08_data_requirements.md)
