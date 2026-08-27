# US-WRIT-01 — Write and submit an essay for a given prompt

| Field | Value |
|-------|-------|
| **Feature** | Writing Submission |
| **Domain** | Writing |

> As a learner, I want to write and submit an essay for a given prompt, so that I can practice my IELTS writing skills and receive feedback.

## Acceptance Criteria

- Writing page route: `/writing/{promptId}` or `/writing/new?promptId={id}`. Requires authentication; redirect to login if unauthenticated
- Layout: prompt displayed at top (fixed/collapsible on scroll) — includes task type badge ("Task 1" / "Task 2"), prompt text (HTML-rendered), optional image/chart (if Task 1 graph description)
- Editor: full-width textarea or rich-text editor below prompt. Monospace or serif font for readability. Min height: 300px desktop, 200px mobile. No formatting toolbar in v1 (plain text only — IELTS is handwritten, formatting irrelevant)
- Word count: live counter displayed bottom-right of editor, format: "{count} từ". Updates on every keystroke (debounced 100ms). Counts words by splitting on whitespace (Unicode-aware, handles Vietnamese). Count displayed in orange when < 150 (Task 1) or < 250 (Task 2); green when within recommended range; red when > 500
- Recommended word count guidance shown as subtle text: Task 1 → "Bạn nên viết ít nhất 150 từ", Task 2 → "Bạn nên viết ít nhất 250 từ". This is guidance only — does not block submission
- Auto-save: draft saved to server every 30 seconds if content changed since last save. Indicator: small "Đã lưu" text with timestamp near word count; during save: "Đang lưu…". Auto-save uses `PATCH /api/writing/submissions/{id}` with `{ content, word_count }`. If save fails (network), show yellow warning "Chưa lưu được — kiểm tra kết nối"
- Submit button: label "Nộp bài"; disabled with tooltip "Viết ít nhất 50 từ" when word_count < 50. Enabled when ≥ 50 words
- Submit confirmation: modal "Bạn có chắc muốn nộp? Bạn sẽ không thể chỉnh sửa sau khi nộp." with "Nộp bài" (primary) and "Quay lại chỉnh sửa" (secondary)
- On submit: `POST /api/writing/submissions/{id}/submit`. State changes from `draft` → `submitted`. Editor becomes read-only. AI scoring job queued automatically (see F-WRIT-02)
- Essay text stored as plain text (not HTML). Max length: 10,000 chars (~2000 words). Exceeds limit → "Bài viết không được vượt quá 10.000 ký tự"
- Server sanitizes essay text: strip any HTML tags, trim whitespace. Store original character count alongside word count
- Submission record: `{ id, user_id, prompt_id, lesson_id (nullable), content, word_count, state: 'draft', created_at, updated_at, submitted_at: null }`
- If learner already has a `draft` submission for this prompt: resume existing draft (do not create duplicate). If already submitted/scored: show previous submission with option "Viết lại" (see F-WRIT-12)
