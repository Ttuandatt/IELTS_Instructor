# M1 Spec — Schema Migration: Writing State Machine + Chế độ A/B per-lớp
**Langy · Milestone M1 (tuần 1–3) · PRD Mục 4, Epic 1–2 · v1.1 — 05/07/2026**
Trạng thái: thiết kế đã chốt, sẵn sàng implement. Effort ước tính: 20–30h (schema + backfill + worker + API touchpoints + LLM integration hardening Mục 8, chưa gồm frontend).

---

## 1. Bối cảnh & vấn đề của schema hiện tại

Schema hiện có (`apps/backend/prisma/schema.prisma`) đã đi được khá xa: `Classroom` có sẵn `invite_code`; `WritingSubmission` có sẵn pipeline AI (`processing_status`, `scores`, `feedback`) và các trường instructor review. Nhưng có **ba khoảng trống** chặn PRD:

**(a) Hai đường nộp bài song song không giao nhau.** `WritingSubmission` (AI chấm, không biết classroom) và `LessonSubmission` (thuộc lesson/classroom, GV chấm tay, không qua AI). Hệ quả: HS trong lớp nộp Writing qua `LessonSubmission` sẽ **không được AI chấm** — killer feature hỏng ở tầng data model.

**(b) Không có state machine hiển thị.** `processing_status` (pending/done/failed) chỉ mô tả trạng thái *pipeline AI*, không mô tả *ai được thấy gì khi nào* — không thể hiện chế độ A/B.

**(c) Instructor override chỉ có một điểm tổng** (`instructor_override_score Float`), trong khi US-2.4 yêu cầu GV sửa **từng tiêu chí** (TR/CC/LR/GRA).

## 2. Quyết định thiết kế

**QĐ-1 — Hợp nhất về `WritingSubmission`.** Mọi bài Writing (tự học lẫn trong lớp) đều là `WritingSubmission` để đi qua một pipeline AI duy nhất. Gắn ngữ cảnh lớp bằng cột optional `lesson_id` (null = tự học). `LessonSubmission` giữ nguyên cho content_type khác (text), **ngừng dùng cho Writing** — không xóa trong M1 (tránh rủi ro), đánh dấu deprecated cho Writing ở tầng service.

**QĐ-2 — Tái dùng `Lesson` làm "bài được giao"** (không tạo model Assignment mới). `Lesson` đã có `content_type: prompt/passage` + `linked_entity_id` trỏ tới Prompt/Passage — đúng ngữ nghĩa giao bài. Chỉ thêm `due_at` (deadline, US-1.2).

**QĐ-3 — Hai trường trạng thái, hai mối quan tâm.** `processing_status` giữ nguyên cho worker AI (pending/done/failed — không đụng code queue đang chạy). Thêm `state` mới cho vòng đời hiển thị/review. Worker chỉ cần *thêm* một dòng cập nhật `state` khi chấm xong. Tách như vậy để migration additive, không phá worker hiện có.

**QĐ-4 — Override theo tiêu chí bằng Json**, cùng cấu trúc với `scores`: `instructor_scores Json? // {TR, CC, LR, GRA, overall}`. Giữ `instructor_override_score` cũ (deprecated, backfill ngược vào `instructor_scores.overall` nếu có). Cặp calibration = (`scores`, `instructor_scores`) nằm cùng một hàng — không cần bảng riêng.

**QĐ-5 — Chế độ A/B là thuộc tính của Classroom**, ánh xạ xuống submission tại thời điểm AI chấm xong (không hồi tố khi GV đổi chế độ — đúng US-1.3).

## 3. Diff schema (Prisma)

```prisma
// ── Enums mới ──
enum SubmissionState {
  draft            // HS đang viết, auto-save (US-2.1)
  submitted        // đã nộp, chờ AI
  ai_scored        // AI xong — trạng thái trung gian, chuyển tiếp ngay theo chế độ lớp
  ai_failed        // AI lỗi sau retry; GV thấy nút chấm lại (PRD Mục 4)
  released_ai      // HS thấy feedback AI (chế độ A, hoặc tự học). Nhãn "ước lượng"
  pending_review   // chỉ GV thấy feedback AI (chế độ B)
  finalized        // GV đã chốt — trạng thái cuối của bài trong lớp
}

enum WritingMode {
  instant       // chế độ A — HS thấy AI ngay (mặc định, D5)
  review_first  // chế độ B — GV duyệt rồi HS mới thấy
}

// ── Classroom: thêm 1 cột ──
model Classroom {
  // ...các cột hiện có giữ nguyên...
  writing_mode WritingMode @default(instant)
}

// ── Lesson: thêm 1 cột ──
model Lesson {
  // ...giữ nguyên...
  due_at DateTime? @db.Timestamptz()   // US-1.2; nộp sau due_at → gắn nhãn "trễ" ở tầng đọc, không khóa
}

// ── WritingSubmission: thêm 4 cột + 1 quan hệ + 2 index ──
model WritingSubmission {
  // ...giữ nguyên toàn bộ cột hiện có, kể cả processing_status...
  state             SubmissionState @default(submitted)
  lesson_id         String?          // null = tự học (persona HS tự ôn, Epic 5b)
  instructor_scores Json?            // {TR, CC, LR, GRA, overall} — GV sửa từng tiêu chí (US-2.4)
  updated_at        DateTime @updatedAt @db.Timestamptz()  // phục vụ auto-save draft

  lesson Lesson? @relation(fields: [lesson_id], references: [id])

  @@index([lesson_id, state])          // review queue của GV theo bài giao
  @@index([user_id, state])            // danh sách bài của HS theo trạng thái
}
// Lesson thêm quan hệ ngược: writing_submissions WritingSubmission[]
```

## 4. Chuyển trạng thái (nguồn sự thật duy nhất — implement trong 1 service)

| Từ | Sự kiện | Đến | Ghi chú |
|---|---|---|---|
| — | HS tạo draft | `draft` | auto-save cập nhật content + updated_at |
| `draft` | HS nộp | `submitted` | enqueue AI; khóa content |
| `submitted` | Worker chấm xong | `ai_scored` → **ngay lập tức** rẽ nhánh | cùng 1 transaction |
| `ai_scored` | lesson→classroom.writing_mode = instant, HOẶC lesson_id null (tự học) | `released_ai` | nhãn "Band ước lượng" |
| `ai_scored` | writing_mode = review_first | `pending_review` | HS thấy "đang chờ giáo viên" |
| `submitted` | Worker lỗi sau 2 retry | `ai_failed` | GV: nút "chấm lại" (→`submitted`) + vẫn chấm tay được (→`finalized`) |
| `released_ai` / `pending_review` / `ai_failed` | GV chốt (giữ/sửa điểm) | `finalized` | ghi `instructor_scores`, `reviewed_by/at`; lưu cặp calibration tự nhiên |
| bất kỳ (tự học, lesson_id null) | — | dừng ở `released_ai` | không có `finalized` vì không có GV (US-5b.2) |

Ràng buộc bất biến (viết test): bài tự học không bao giờ vào `pending_review`/`finalized`; đổi `writing_mode` của lớp không đổi `state` của submission cũ; `finalized` là trạng thái hút — không thoát ra.

## 5. Kế hoạch migration (3 bước, zero-downtime)

**Bước 1 — Migration additive** (`prisma migrate dev --name m1_writing_state_machine`): thêm enum, cột, index như Mục 3. Mọi cột mới nullable hoặc có default → không khóa bảng lâu, không phá code cũ.

**Bước 2 — Backfill dữ liệu cũ** (script `scripts/backfill-m1.ts`, chạy 1 lần, idempotent):

| Điều kiện hàng cũ | `state` gán |
|---|---|
| `processing_status = pending` | `submitted` |
| `processing_status = failed` | `ai_failed` |
| `processing_status = done` AND `reviewed_at IS NOT NULL` | `finalized` + copy `instructor_override_score` → `instructor_scores.overall` |
| `processing_status = done` AND chưa review | `released_ai` (dữ liệu cũ toàn tự học — hành vi cũ ≡ chế độ A) |

`lesson_id` để null toàn bộ (dữ liệu cũ đều là tự học — đúng thực tế).

**Bước 3 — Cập nhật code ghi** (worker + API): worker set `state` song song với `processing_status` trong cùng transaction; endpoint submit tạo bản ghi với `state=submitted` (hoặc `draft` cho auto-save). `processing_status` thành read-only legacy — dọn ở milestone sau, không phải bây giờ.

**Rollback:** cột/enum mới đều additive — rollback = code cũ chạy tiếp, bỏ qua cột mới. Không có migration phá hủy trong M1.

## 6. Điểm chạm code (ngoài schema)

1. `scoring/*.processor` (worker): sau khi ghi scores → tính nhánh A/B: đọc `lesson.topic.classroom.writing_mode` (join 3 cấp — viết helper `resolveWritingMode(submissionId)`) → set `state` tương ứng, cùng transaction.
2. `writing/*.controller|service`: endpoint submit nhận `lesson_id?` optional; endpoint mới `PATCH /writing/submissions/:id/draft` (auto-save); `GET` của HS lọc theo `state` để quyết định hiển thị (che `scores/feedback` khi `pending_review`) — **che ở server, không che ở client**.
3. Endpoint GV mới: `GET /instructor/review-queue` (lọc `lesson_id IN lessons của lớp mình`, `state IN [released_ai, pending_review, ai_failed]`), `POST /writing/submissions/:id/finalize` (body: instructor_scores?, instructor_comment?).
4. `classroom` service: expose `writing_mode` trong create/update (US-1.3) — mặc định `instant`.
5. Sửa luôn trong M1 (đã cam kết PRD US-6.4): bug hai tier cùng `gemini-2.5-flash` trong `llm-client.service.ts` dòng 45.

## 7. Checklist test tối thiểu
Unit: bảng chuyển trạng thái Mục 4 (mỗi hàng 1 test) + 3 bất biến. Integration: nộp trong lớp instant → HS thấy ngay; nộp trong lớp review_first → HS bị che, GV thấy; GV finalize với điểm sửa → cặp (scores, instructor_scores) tồn tại; tự học → dừng ở released_ai; AI fail → ai_failed → chấm lại thành công. Backfill: chạy 2 lần cho kết quả như 1 lần (idempotent).

## 8. LLM Integration Hardening (D10 — gộp vào M1)

Thứ tự thực hiện, mỗi mục là một commit độc lập:

**8.1 Migrate SDK Google.** `@google/generative-ai` đã EOL ngày 30/11/2025 — thay bằng `@google/genai` (GenAI SDK mới, GA). Điểm chạm duy nhất: `llm-client.service.ts` (constructor + `callGoogle`). API mới: `new GoogleGenAI({apiKey})` → `client.models.generateContent({model, contents, config})`.

**8.2 Structured output thay regex.** Gemini: `config.responseMimeType: 'application/json'` + `responseSchema` (định nghĩa từ schema trong `schema-validator.ts`). OpenAI: `response_format: {type: 'json_schema', json_schema: {...}}`. Xóa đoạn strip ```` ```json ```` bằng regex; giữ `validateFeedbackSchema` làm lớp phòng thủ thứ hai.

**8.3 Ghim tham số sinh.** `temperature: 0` cho mọi call chấm điểm; `seed` nếu provider hỗ trợ. Thêm cột schema:
```prisma
model WritingSubmission {
  // ...bổ sung vào diff Mục 3...
  prompt_version String @default("v1") @db.VarChar(10)  // KHÔNG trộn calibration data giữa các version prompt
  tokens_input   Int?
  tokens_output  Int?
}
```
Worker ghi `prompt_version` (hằng số export từ `rubric.prompt.ts`) + token usage từ `usageMetadata` của response — hiện thực hóa log chi phí US-6.3.

**8.4 Timeout + retry + idempotency.** Timeout 60s mỗi call LLM (AbortController). Retry ở tầng BullMQ: `attempts: 3`, `backoff: {type: 'exponential', delay: 5000}` — bỏ retry thủ công nếu đang có. Job id = submission id (idempotent — nộp trùng không chấm hai lần). Hết retry → `state = ai_failed`.

**8.5 Sửa bug tier (nợ PRD US-6.4).** Dòng 45: premium → đọc từ env `LLM_MODEL_PREMIUM_GOOGLE` (mặc định `gemini-2.5-pro`), cheap → `LLM_MODEL_CHEAP_GOOGLE` (mặc định `gemini-2.5-flash`). Chuyển API key sang paid tier trước khi có bài HS thật (dữ liệu essay không được vào free tier — BA Mục 13).

**8.6 Môi trường dev với model local.** `LLM_PROVIDER=local` trỏ tới endpoint OpenAI-compatible của Ollama (Qwen local) — chỉ cho dev/integration test, **cấm dùng production** (chất lượng chấm không đạt). Thêm guard: nếu `NODE_ENV=production` và provider=local → throw khi khởi động.

**Nợ ghi nhận, không làm trong M1:** context caching cho rubric prompt (làm cùng phương án A calibrated few-shot ở M2 — khi prompt có anchor essays mới đáng cache); ensemble 3 lần + cờ bất định (Pha 2, M6); golden-set eval harness khi đổi prompt (trước pilot).
