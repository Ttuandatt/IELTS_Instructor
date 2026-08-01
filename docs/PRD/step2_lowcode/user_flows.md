# 🔄 User Flows — Langy (Pre-pilot MVP)

> **Mã tài liệu:** STEP2-FLOWS
> **Phiên bản:** 2.0 — Viết lại theo BA/PRD 07/2026
> **Trạng thái:** Updated
> **Tham chiếu:** [15_sequence_diagrams](../step3_prd/15_sequence_diagrams.md) · [16_activity_diagrams](../step3_prd/16_activity_diagrams.md)

---

## 1. Flow Summary

| # | Flow | Actor | Steps | Key Decisions |
|---|------|-------|-------|---------------|
| F01 | Đăng ký + Consent | All | 5 | Age-gate < 16, consent PH, ToS, không hỏi mã lớp |
| F02 | Đăng nhập | All | 3 | JWT access 15m + refresh 7d |
| F03 | Quên mật khẩu | All | 4 | Email reset link |
| F04 | GV tạo lớp + mời HS | Instructor | 5 | Chế độ Writing A/B, mã mời 6 ký tự |
| F05 | HS tham gia lớp | Learner | 3 | Nhập mã mời |
| F06 | GV giao bài | Instructor | 4 | Chọn đề từ kho/import, deadline tùy chọn |
| F07 | HS nộp Writing (classroom) | Learner | 7 | Auto-save 30s, xác nhận nộp, enqueue AI |
| F08 | AI chấm + rẽ nhánh A/B | System | 6 | State machine 7 trạng thái, timeout 60s, retry 3x |
| F09 | GV review + chốt điểm | Instructor | 5 | Sửa band từng tiêu chí, lưu calibration |
| F10 | HS tự ôn end-to-end | Learner (self-study) | 6 | Luôn chế độ A, band AI là điểm cuối |
| F11 | Import đề từ docx | Instructor | 6 | Preview bắt buộc, checkbox bản quyền |
| F12 | Xóa tài khoản | All | 4 | Soft delete 7d → hard delete |

---

## 2. F01 — Đăng ký + Consent

**Actor:** Bất kỳ ai
**Goal:** Tạo tài khoản mới với consent hợp lệ
**Precondition:** Chưa có tài khoản

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Điền email, mật khẩu, tên, năm sinh | Client-side validation; tính tuổi từ năm sinh | S02 |
| 2a | Tuổi ≥ 16 | Hiển thị checkbox ToS + Privacy Policy | S02 |
| 2b | Tuổi < 16 | Hiển thị thêm: checkbox "Phụ huynh đã đồng ý" + email PH | S02 |
| 3 | Tick checkbox(es) + bấm Đăng ký | POST /auth/register → tạo account → JWT | S02 |
| 4 | — | Redirect → Dashboard (hoặc Landing nếu chưa verify email) | S40 |

**Quan trọng:** KHÔNG hỏi mã lớp khi đăng ký. HS tự ôn vào thẳng Dashboard. HS muốn vào lớp → join sau (F05).

**Error paths:**
- Email trùng → "Email đã đăng ký"
- Tuổi < 16 mà không tick consent PH → chặn submit
- Password yếu (< 8 ký tự, thiếu upper/lower/digit) → inline error

---

## 3. F02 — Đăng nhập

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Điền email + mật khẩu | Client-side validation | S01 |
| 2 | Bấm Đăng nhập | POST /auth/login → JWT (access 15m, refresh 7d) | S01 |
| 3 | — | Store tokens; redirect theo role: Learner → S40, Instructor → S50 | — |

**Error paths:** Sai credentials → "Email hoặc mật khẩu không đúng". Rate limit 5 lần/15 phút/IP → "Thử lại sau X phút".

---

## 4. F04 — GV tạo lớp + mời HS

**Actor:** Instructor
**Goal:** Tạo lớp IELTS và lấy mã mời cho học sinh

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Bấm "Tạo lớp" | Hiện form tạo lớp | S52 |
| 2 | Điền: tên lớp (bắt buộc), mô tả, chế độ Writing A/B (mặc định A) | Tooltip giải thích A vs B khi hover | S52 |
| 3 | Bấm "Tạo" | POST /classrooms → tạo + sinh mã mời 6 ký tự + GV tự thêm vào lớp (role=teacher) | S52 |
| 4 | — | Redirect → Classroom Detail; hiển thị mã mời nổi bật | S53 |
| 5 | GV copy mã, gửi cho HS qua Zalo/tin nhắn | — | — |

**Business rules:** CR-001 (chỉ instructor/admin tạo lớp), CR-004 (owner tự thêm vào lớp), D5 (mặc định instant).

---

## 5. F05 — HS tham gia lớp

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Bấm "Tham gia lớp" hoặc truy cập link mời | Hiện form nhập mã | S31 |
| 2 | Nhập mã 6 ký tự | POST /classrooms/join → validate mã | S31 |
| 3 | — | Thêm vào lớp (role=student); redirect → Classroom Detail | S53 |

**Error paths:** Mã sai → "Mã mời không hợp lệ". Đã là thành viên → "Bạn đã ở trong lớp này". Lớp đầy → "Lớp đã đầy".

---

## 6. F06 — GV giao bài

**Actor:** Instructor
**Goal:** Giao đề Reading hoặc Writing cho cả lớp

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Từ Classroom Detail, bấm "Giao bài" | Hiện form giao bài | S58 |
| 2 | Chọn đề từ kho (Passage hoặc Prompt) hoặc đề đã import | Hiện preview đề | S58 |
| 3 | Đặt deadline (tùy chọn) | Date picker | S58 |
| 4 | Bấm "Giao" | POST /lessons → tạo Lesson (content_type, linked_entity_id, due_at) | S58 |

**Postcondition:** Mọi HS trong lớp thấy bài trong "Bài tập của tôi" (S30). Nộp sau deadline → gắn nhãn "trễ" nhưng không khóa (BR-032).

---

## 7. F07 — HS nộp Writing (classroom)

**Actor:** Learner (classroom)
**Goal:** Viết và nộp bài Writing từ bài được giao

| Step | Action | System Response | Screen | Rules |
|------|--------|----------------|--------|-------|
| 1 | Mở bài từ "Bài tập của tôi" | Load đề + editor | S21 | — |
| 2 | Viết bài | Đếm từ real-time; auto-save mỗi 30s (PATCH /draft) | S21 | BR-006 |
| 3 | Bấm "Nộp bài" | Dialog xác nhận: "Bạn chắc chắn muốn nộp?" | S21 | — |
| 4 | Xác nhận | POST /writing/submissions (lesson_id, content) → 202 | S21 | FR-WRIT-004 |
| 5 | — | Enqueue AI job; state=submitted; HS thấy "đang chờ chấm" | S22 | — |
| 6a | AI thành công + chế độ A | state=released_ai → HS thấy feedback + nhãn "ước lượng" | S22 | D5 |
| 6b | AI thành công + chế độ B | state=pending_review → HS thấy "đang chờ giáo viên" | S22 | D5 |
| 7 | (Sau) GV chốt | state=finalized → HS thấy bản cuối, highlight thay đổi | S22 | — |

**Error paths:** Essay < 50 từ → server reject. Rate limit 10/ngày → "Đã đạt giới hạn". AI fail → state=ai_failed, HS thấy "đang chờ chấm" (không lộ lỗi).

---

## 8. F08 — AI chấm + rẽ nhánh A/B (System flow)

**Actor:** System (BullMQ Worker)
**Trigger:** Job trong queue

| Step | Action | System Response |
|------|--------|----------------|
| 1 | Worker lấy job (id = submission_id) | Đọc submission từ DB |
| 2 | Xây prompt: rubric + few-shot anchors + đề + essay | **KHÔNG** gửi tên/email/ID HS (data minimization) |
| 3 | Gọi LLM API (Gemini primary, OpenAI fallback) | Structured output, temperature 0, timeout 60s |
| 4 | Validate output schema | Band 0–9, bội 0.5; reject nếu ngoài range |
| 5 | Lưu scores + feedback + metadata (tokens, model, prompt_version) | Transaction |
| 6 | Resolve writing_mode: lesson→classroom.writing_mode | instant → released_ai; review_first → pending_review; lesson_id null → released_ai |

**Error flow:** Timeout/error → retry (max 3, exponential 5s/25s/125s) → vẫn lỗi → state=ai_failed, error_message logged.
**Idempotency:** Job id = submission id → nộp trùng không chấm hai lần.

---

## 9. F09 — GV review + chốt điểm

**Actor:** Instructor
**Goal:** Review feedback AI, điều chỉnh nếu cần, chốt điểm cho HS

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Mở Review Queue | GET /instructor/review-queue → danh sách submission cần review | S56 |
| 2 | Lọc theo lớp, trạng thái | Filter applied | S56 |
| 3 | Click vào bài | Load: essay + feedback AI + band từng tiêu chí (editable) + ô nhận xét | S57 |
| 4 | Giữ nguyên / sửa band từng tiêu chí + thêm nhận xét | — | S57 |
| 5 | Bấm "Chốt" | POST /submissions/:id/finalize → state=finalized; lưu cặp (scores AI, instructor_scores) | S57 |

**Chốt nhanh:** Nếu GV đồng ý AI → ≤ 3 click (click bài → click "Chốt" → confirm).
**ai_failed:** GV thấy nút "Chấm lại" (re-enqueue) hoặc chấm tay (finalize trực tiếp).
**Calibration:** Cặp (band AI, band GV) lưu tự động → tài sản quý nhất cho D9 Pha 3.

---

## 10. F10 — HS tự ôn end-to-end

**Actor:** Learner (self-study)
**Goal:** Tự luyện Writing/Reading, nhận feedback AI, xem tiến bộ

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Truy cập landing page, đăng ký (F01 — không mã lớp) | Tạo account, redirect Dashboard | S05 → S40 |
| 2 | Chọn đề Writing/Reading từ kho | Load đề | S20/S10 |
| 3 | Làm bài + nộp | Writing: AI chấm (luôn chế độ A); Reading: chấm tự động | S21/S11 |
| 4 | Xem feedback ngay | Writing: band + nhãn "ước lượng bởi AI"; Reading: % + giải thích | S22/S12 |
| 5 | Xem dashboard cá nhân | Biểu đồ band Writing + % Reading theo thời gian | S41 |
| 6 | (Gợi ý) "Để được GV review, tham gia lớp học →" | Cross-sell nhẹ nhàng cuối feedback | S22 |

**Khác biệt so với classroom:** Không có finalized (band AI là điểm cuối); không có "Bài tập của tôi"; dashboard không có ngữ cảnh lớp.

---

## 11. F11 — Import đề từ docx

**Actor:** Instructor
**Goal:** Đưa kho đề Word có sẵn vào hệ thống

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Bấm "Import đề" | Hiện form upload | S60 |
| 2a | **Writing:** Upload docx hoặc paste text | Extract nội dung | S60 |
| 2b | **Reading:** Upload docx | Parse: bóc passage + câu hỏi + đáp án | S60 |
| 3 | — | Hiển thị preview bắt buộc | S61 |
| 4 | GV kiểm tra, sửa câu hỏi/đáp án nếu cần | Inline edit trên preview | S61 |
| 5 | Tick checkbox "Tôi có quyền sử dụng nội dung này" | Bắt buộc trước publish | S61 |
| 6 | Bấm "Publish" | POST /upload/jobs/:id/confirm → tạo Passage/Prompt | S61 |

**Mục tiêu chất lượng:** ≥70% câu hỏi Reading nhận diện đúng không cần sửa tay (đo trên đề thật 5 GV pilot).
**Phase:** Writing prompts trước (gần free), Reading sau (phức tạp hơn — descope #1 nếu trễ).

---

## 12. F12 — Xóa tài khoản

**Actor:** Bất kỳ user nào
**Goal:** Xóa tài khoản và toàn bộ dữ liệu

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Vào Settings, bấm "Xóa tài khoản" | Dialog xác nhận: nhập email để confirm | S71 |
| 2 | Nhập email khớp + bấm "Xóa" | DELETE /auth/account → soft delete (đánh dấu deleted_at) | S71 |
| 3 | — | Đăng xuất ngay; gửi email xác nhận đã đánh dấu xóa | — |
| 4a | 7 ngày không đăng nhập lại | Cron job: hard delete toàn bộ dữ liệu (essay, scores, profile) | — |
| 4b | Đăng nhập lại trong 7 ngày | Hủy xóa, khôi phục tài khoản | — |

**Pháp lý:** Đáp ứng quyền yêu cầu xóa theo Luật BVDLCN 91/2025/QH15.
