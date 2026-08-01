# 📏 Business Rules — Langy (Pre-pilot MVP, Step 2 Summary)

> **Mã tài liệu:** STEP2-RULES
> **Phiên bản:** 2.0 — Viết lại theo BA/PRD 07/2026
> **Trạng thái:** Updated
> **Full detail:** [11_business_rules](../step3_prd/11_business_rules.md) (63 rules)

---

## 1. IELTS Writing Scoring

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-001 | Chấm theo 4 tiêu chí: TR, CC, LR, GRA | AI prompt + schema validator |
| BR-002 | Band 0–9, bước 0.5 | Schema validator reject ngoài range |
| BR-003 | Band tổng = trung bình 4 tiêu chí, làm tròn đến 0.5 gần nhất | Server-side (không để AI tính) |
| BR-004 | Band AI luôn nhãn "ước lượng" — KHÔNG BAO GIỜ như điểm chính thức | UI enforced (D3) |
| BR-005 | Điểm GV chốt (finalized) là điểm cuối, ghi đè AI trong mọi báo cáo | Backend logic |
| BR-006 | Task 2: tối thiểu 250 từ; Task 1: 150 từ; dưới ngưỡng → cảnh báo (không chặn) | Client warning |
| BR-007 | Essay dưới 50 từ không gửi chấm AI | Server reject |

## 2. Writing State Machine

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-010 | State chuyển theo bảng spec M1 Mục 4 — không đường tắt | Service + unit tests |
| BR-011 | `finalized` là trạng thái hút — không thoát ra | Backend guard |
| BR-012 | Bài tự học (lesson_id=null) không bao giờ vào pending_review/finalized | Invariant + test |
| BR-013 | Đổi writing_mode không hồi tố — chỉ áp dụng submission mới | Timestamp-based |
| BR-014 | Mỗi GV điều chỉnh → lưu cặp (scores AI, instructor_scores) tự động | Auto-save on finalize |

## 3. Reading

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-020 | Điểm = số câu đúng / tổng, hiển thị % | Server-side |
| BR-021 | KHÔNG quy đổi % sang band (chưa có bảng 40 câu chuẩn) | UI + backend |
| BR-022 | Short answer: case-insensitive, trim whitespace | Backend comparison |

## 4. Classroom & Assignment

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-030 | Mã mời: 6 ký tự, unique, alphanumeric uppercase | Generator + unique constraint |
| BR-031 | Mặc định writing_mode = instant (chế độ A) | DB default |
| BR-032 | Nộp sau deadline: chấp nhận + nhãn "trễ", KHÔNG khóa | Tầng đọc so sánh timestamps |
| BR-033 | HS có thể thuộc nhiều lớp | Many-to-many |
| BR-034 | GV chỉ xem submission của HS trong lớp mình | Auth check per-request |
| BR-035 | Chỉ instructor/admin tạo classroom | RolesGuard |
| BR-036 | Chỉ owner sửa/xóa classroom | Ownership check |
| BR-037 | Không join lớp đầy (≥ max_members) | Backend count check |

## 5. Import

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-040 | Đề import thuộc sở hữu GV import, private mặc định | created_by |
| BR-041 | Checkbox bản quyền bắt buộc trước publish | UI + backend |
| BR-042 | Import Reading: bắt buộc preview → sửa → publish | UX flow |
| BR-043 | Đề Cambridge KHÔNG seed vào production | Quy trình review |

## 6. Privacy & Consent

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-050 | HS < 16 tuổi: bắt buộc xác nhận phụ huynh | Age-gate |
| BR-051 | Prompt chấm AI KHÔNG chứa PII (tên, email, ID) | Prompt construction |
| BR-052 | Xóa TK: soft delete 7d → hard delete | Cron job |
| BR-053 | Chỉ paid tier LLM API cho dữ liệu HS thật | Startup check |

## 7. Cost Control

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-060 | Tối đa 10 bài Writing/ngày/HS | Redis rate limit |
| BR-061 | Context caching cho rubric prompt | LLM client config |
| BR-062 | Log token usage mỗi lượt chấm | DB fields |
| BR-063 | Cảnh báo khi chi tiêu API ngày vượt ngưỡng | Log alert |

## 8. Auth

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-070 | Password: min 8 chars, 1 upper, 1 lower, 1 digit | Backend + frontend |
| BR-071 | JWT access 15 min, refresh 7 ngày | Auth service |
| BR-072 | Refresh token rotated on each use | Auth service |
| BR-073 | Login rate limit: 5/15min per IP | Middleware |
| BR-074 | Register luôn tạo role learner | Backend |
