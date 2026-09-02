# US-WRIT-09 — Batch-review multiple submissions efficiently with keyboa...

| Field | Value |
|-------|-------|
| **Feature** | Instructor Review & Override |
| **Domain** | Writing |

> As an instructor, I want to batch-review multiple submissions efficiently with keyboard shortcuts, so that reviewing 20+ essays doesn't take hours.

## Acceptance Criteria

- AC1: Review queue page: `/instructor/classrooms/{id}/review-queue`. Shows all submissions in `pending_review` state for this classroom
- AC2: Queue list: table with columns: Student Name, Prompt Title, Submitted At (relative: "2 giờ trước"), Word Count, AI Band. Sorted by `submitted_at ASC` (oldest first — FIFO)
- AC3: Queue count: prominent badge at top: "{n} bài chờ duyệt". Also shown on instructor dashboard (see F-DASH-02) and in sidebar navigation badge
- AC4: Keyboard shortcuts (active when review page focused):
- AC5: Keyboard shortcut cheat sheet: "?" key toggles overlay showing all shortcuts. Also accessible via "⌨ Phím tắt" button
- AC6: Bulk action: "Phát hành tất cả với điểm AI" button at top of queue. Confirmation: "Phát hành {n} bài với điểm AI mà không có nhận xét giáo viên? Hành động không thể hoàn tác." Progress bar during processing (sequential API calls)
- AC7: Filter queue by: prompt title, date range, student name. Search bar for student name substring match
- AC8: Empty queue: "🎉 Không còn bài chờ duyệt!" with confetti animation (one-time, not annoying)
- AC9: Performance: queue list loads in < 500ms. Maximum practical queue size: ~500 submissions per classroom (paginated, 50 per page)
