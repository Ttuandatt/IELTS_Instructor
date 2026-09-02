# US-WRIT-18 — Save multiple essay drafts and resume any of them later

| Field | Value |
|-------|-------|
| **Feature** | Draft Management |
| **Domain** | Writing |

> As a learner, I want to save multiple essay drafts and resume any of them later, so that I can work on essays across multiple sessions without losing progress.

## Acceptance Criteria

- AC1: Drafts page route: `/writing/drafts`. Shows all submissions in `draft` state for the current user
- AC2: Draft list: card grid or table showing: prompt title, task type badge, word count, last edited (relative time: "5 phút trước"), progress indicator (word count vs recommended: progress bar)
- AC3: Click draft card → opens writing editor with draft content loaded, exactly where learner left off. Auto-save resumes immediately
- AC4: Auto-save creates draft on first keystroke if no draft exists for this prompt. Subsequent auto-saves update the existing draft (PATCH, not POST). No duplicate drafts per prompt per user
- AC5: Delete draft: swipe-left (mobile) or trash icon (desktop). Confirmation: "Xóa bản nháp cho '{prompt_title}'? Bạn sẽ mất nội dung đã viết." Deletion is hard-delete (not soft — drafts are not recoverable)
- AC6: Max 10 active drafts per user. Attempting to create 11th: "Bạn đã đạt giới hạn 10 bản nháp. Hãy nộp hoặc xóa bớt bản nháp cũ." with links to existing drafts
- AC7: Drafts sorted by: "Chỉnh sửa gần nhất" (default, `updated_at DESC`) or "Cũ nhất"
- AC8: Empty state: "Chưa có bản nháp. Chọn đề bài và bắt đầu viết!" with CTA → prompt browser
- AC9: Draft age warning: drafts older than 30 days show subtle warning "Bản nháp này đã hơn 30 ngày. Cân nhắc nộp hoặc xóa."
- AC10: Drafts are private to the learner — instructors cannot see learner drafts (only submitted/scored submissions visible to instructor)
- AC11: Draft content included in data export (F-COMP-04)
