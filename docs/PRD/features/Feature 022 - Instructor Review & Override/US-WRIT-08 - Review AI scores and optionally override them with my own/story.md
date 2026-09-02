# US-WRIT-08 — Review AI scores and optionally override them with my own...

| Field | Value |
|-------|-------|
| **Feature** | Instructor Review & Override |
| **Domain** | Writing |

> As an instructor, I want to review AI scores and optionally override them with my own scores and comments, so that I can ensure scoring quality and provide personalized feedback.

## Acceptance Criteria

- AC1: Review page route: `/instructor/submissions/{submissionId}/review`. Requires `role=instructor` or `role=admin`. Instructor must be the classroom owner/co-teacher — cannot review submissions from other instructors' classrooms
- AC2: Layout: 3-column on desktop (essay | AI scores | instructor input). 2-column on tablet. Stacked on mobile
- AC3: Instructor score inputs: number spinners with 0.5 step. Pre-filled with AI scores (instructor can accept by not changing). Empty = accept AI score for that criterion
- AC4: Instructor comments: rich text area, max 5000 chars. Placeholder: "Nhận xét của giáo viên (tùy chọn)". Supports basic formatting (bold, italic, bullet points)
- AC5: "Phát hành" (Release) button: moves submission to `finalized` state. Confirmation modal: "Phát hành điểm cho học sinh? Hành động này không thể hoàn tác." Learner receives notification (see US-WRIT-07)
- AC6: **finalized = sink state (invariant #3):** once released, scores cannot be changed. Edit buttons disabled. Info text: "Bài đã được phát hành. Điểm không thể thay đổi"
- AC7: "Lưu nháp" (Save Draft) button: saves instructor scores/comments without releasing. Instructor can return and edit before releasing
- AC8: Student identity visible to instructor: display_name shown at top of review page. Instructor can click → view student's full writing history within this classroom
- AC9: Side navigation: "← Bài trước" / "Bài tiếp →" arrows to navigate between submissions in the review queue without returning to list
