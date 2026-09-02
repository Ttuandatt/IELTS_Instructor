# US-SPEAK-04 — Listen to student recordings and provide feedback

| Field | Value |
|-------|-------|
| **Feature** | Instructor Speaking Review |
| **Domain** | Speaking |

> As an instructor, I want to listen to student recordings and provide feedback, so that students get expert guidance on pronunciation and fluency.

## Acceptance Criteria

- AC1: Review queue: speaking submissions with `status=submitted` or `status=scored` (AI-scored but awaiting instructor review) appear in instructor's review queue (same queue as writing, F-WRIT-08, with type filter "Speaking" / "Writing" / "Tất cả")
- AC2: Review page layout: two panels
- AC3: Transcript annotation (instructor):
- AC4: Instructor scoring: 4 criteria scoring form (same as AI assessment criteria):
- AC5: AI scores comparison: if AI already scored (F-SPEAK-02), AI scores shown beside instructor's input fields for reference: "AI: {band}" in gray text. Instructor can agree or override. Difference > 1.0 band → subtle warning "Chênh lệch lớn với AI — vui lòng xác nhận"
- AC6: Submit review: "Hoàn thành đánh giá" button → submission status changes to `reviewed` (if writing_mode=ai_plus_review) or `finalized` (if review_only). Notification sent to learner (F-NOTIF-01): "Giáo viên đã đánh giá bài nói '{prompt_title}'"
- AC7: Learner view after review: score card showing instructor scores (prioritized over AI). AI scores shown as secondary "Tham khảo AI" section. Annotations visible on transcript (colored highlights with comments)
- AC8: Review keyboard shortcuts: consistent with writing review (F-WRIT-08). Enter = next question/submit, Ctrl+S = save draft
- AC9: Depends on: F-SPEAK-01 (recording exists), F-SPEAK-02 (optional AI pre-scoring), F-WRIT-08 (review queue pattern), F-NOTIF-01 (review notification)
