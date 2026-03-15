# 📏 Business Rules — IELTS Helper (MVP, Step 2 Summary)

> **Mã tài liệu:** STEP2-RULES  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Framework:** Vibe Coding v2.0 — Step 2: Low-Code Prototype  
> **Full detail:** [11_business_rules](../step3_prd/11_business_rules.md)

---

## 1. Reading Rules

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| RD-001 | ≥ 80% questions answered before submit | Backend validation | 400 error; prompt to complete more |
| RD-002 | Auto-grade: MCQ direct compare; short answer case-insensitive keyword match | Backend grading service | — |
| RD-003 | Timer expiry → auto-submit (bypass 80% rule); flag `timed_out=true` | Frontend timer + backend override | Accept partial answers |
| RD-004 | Keep all attempt history (INSERT only, no UPDATE) | Backend service | — |
| RD-005 | Mode selection required before starting: Practice (no timer, choose parts) vs Simulation (60 min, full test) | Frontend modal (S22) + backend `test_mode` field | — |
| RD-006 | Simulation mode: 60 min countdown, no pause, auto-submit on expiry | Frontend Timer + backend validation | Reject late submissions |
| RD-007 | Auto-save reading answers to localStorage every 5s; clear on submit | Frontend hook | — |

---

## 2. Writing Rules

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| WR-001 | Word count below prompt `min_words` → warn but allow submit | Frontend warning + backend store | Visual warning; feedback may note |
| WR-002 | Hybrid scoring: rule checks → LLM rubric (TR/CC/LR/GRA 0–9) → JSON feedback | BullMQ worker | — |
| WR-003 | Default cheap tier; rate limit 5–10/day/user | Backend rate-limit middleware | 429 error if exceeded |
| WR-004 | SLA < 5 min for 90% jobs; timeout 90s; retry 2x; DLQ on failure | BullMQ config | Mark status=failed with error |
| WR-005 | Store full scoring metadata (scores, feedback, model, turnaround) | Worker after scoring | — |
| WR-006 | Instructor can override AI score (0–9) and add comment; original AI score preserved | Backend PATCH endpoint | — |
| WR-007 | Feedback must include: TR/CC/LR/GRA scores, summary, strengths[], improvements[], suggestions | LLM prompt + JSON schema validation | Retry if malformed |
| WR-008 | Submissions stuck in 'pending' > 10 min are auto-marked 'failed' with error message | Cron service (every 5 min) | Mark failed; log warning |
| WR-009 | Auto-save essay draft to localStorage every 5s; clear on submit | Frontend hook | — |

---

## 3. Admin/Content Rules

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| ADM-001 | Draft content hidden from learners; only published visible | Backend: `WHERE status='published'` | Content not shown |
| ADM-002 | Imported content must reference ≥ 1 source | Backend validation on import | Validation error |
| ADM-003 | Record content version on every mutation | Backend service middleware | — |

---

## 4. System/Sync Rules

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| SY-001 | Cache NotebookLM fetch in Redis (TTL 15–60 min) | Import service | — |
| SY-002 | Sanitize all imported HTML (strip scripts, events) | Sanitize utility | Reject malformed content |
| SY-003 | Log admin ID for every import action | Import service | — |

---

## 5. Auth Rules

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| AU-001 | Password: min 8 chars, 1 upper, 1 lower, 1 digit | Backend + frontend validation | 400 error |
| AU-002 | JWT access token TTL = 15 min; refresh TTL = 7 days | Auth service | Auto-refresh or re-login |
| AU-003 | Refresh token rotated on each use; old invalidated | Auth service | 401 if old token used |
| AU-004 | Login rate-limit: 5/15min per IP; Register: 3/15min per IP | Rate-limit middleware | 429 error |
| AU-005 | Registration always creates learner role; role changes require admin action | Backend validation | Reject any role field in register payload |

---

## 6. Classroom Rules (CR)

| ID | Rule | Enforcement | Action on Violation |
|----|------|-------------|---------------------|
| CR-001 | Chỉ instructor hoặc admin được tạo classroom | `RolesGuard` với `@Roles('instructor', 'admin')` trên `POST /classrooms` | 403 Forbidden |
| CR-002 | Tham gia lớp yêu cầu mã mời hợp lệ (invite_code 8 ký tự) | Backend validation — `findUnique({invite_code})` | 404 "Invalid invite code" |
| CR-003 | Chỉ owner hoặc admin được cập nhật/xóa classroom | `checkOwnership()` guard trong controller | 403 "Only classroom owner can perform this action" |
| CR-004 | Owner tự động được thêm vào lớp với role `teacher` khi tạo lớp | `classroomService.create()` — nested `members.create` | — |
| CR-005 | Không thể tham gia/thêm thành viên khi lớp đã đầy (`members >= max_members`) | Backend check `_count.members >= max_members` | 403 "Classroom is full" |
| CR-006 | Không thể tham gia lớp nếu đã là thành viên | Unique constraint `classroom_id + user_id` + `findUnique` check | 409 "Already a member" |
| CR-007 | Học viên chỉ thấy nội dung đã published (topics và lessons); giảng viên thấy tất cả | Filter `status = 'published'` khi role = `student` trong `findOne`, `findAllByClassroom`, `findAllByTopic` | Nội dung draft bị ẩn |
| CR-008 | Học viên chỉ được nộp bài khi lesson có `allow_submit = true` | Backend check `lesson.allow_submit` trước khi tạo submission | 403 "Submissions are not enabled for this lesson" |
| CR-009 | Nội dung bài nộp không được rỗng | Backend check `body.content?.trim()` | 403 "Content cannot be empty" |
| CR-010 | Xóa classroom là soft delete (chuyển sang `archived`), dữ liệu vẫn lưu trữ | `classroomService.remove()` — `update({status: 'archived'})` thay vì `delete` | — |

---

> **Tham chiếu:** [11_business_rules](../step3_prd/11_business_rules.md) (full detail with test scenarios) | [18_classroom_module](../step3_prd/18_classroom_module.md)
