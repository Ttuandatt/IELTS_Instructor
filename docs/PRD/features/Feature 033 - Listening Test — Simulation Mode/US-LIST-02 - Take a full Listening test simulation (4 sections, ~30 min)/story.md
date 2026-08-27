# US-LIST-02 — Take a full Listening test simulation (4 sections, ~30 min)

| Field | Value |
|-------|-------|
| **Feature** | Listening Test — Simulation Mode |
| **Domain** | Listening |

> As a learner, I want to take a full Listening test simulation (4 sections, ~30 min), so that I can practice under exam conditions.

## Acceptance Criteria

- Simulation entry: "Thi thử Listening" button on listening browse page. Confirmation: "Bắt đầu thi thử? Audio chỉ phát MỘT LẦN (giống thi thật). Thời gian: ~30 phút + 10 phút chuyển đáp án."
- 4 sections played sequentially:
- Exam condition: audio plays once only. Seek bar disabled. Speed control disabled (fixed 1×). Rewind/forward buttons disabled. Play button becomes inactive after audio finishes for each section. Clear label: "⚠️ Audio chỉ phát một lần"
- Between sections: 30-second pause with "Section {n+1} sẽ bắt đầu trong {countdown}s". Auto-plays next section. Learner cannot go back to previous section's questions during later sections
- Transfer time: after Section 4 audio ends → 10-minute countdown timer appears: "Thời gian kiểm tra đáp án: {MM:SS}". Timer color: default (> 2 min), orange (1-2 min), red pulsing (< 1 min). During transfer time: all 40 questions visible and editable. Audio NOT replayable
- Auto-submit: when transfer time expires → automatic submission. Warning at 1 minute: "Còn 1 phút!". Warning at 10 seconds: "Tự động nộp bài trong 10 giây"
- Score display:
- Question navigation: sidebar with question grid (1-40). Colors: answered (green), unanswered (gray), current (blue highlight). Click to jump to question
- Accessibility: timer announced to screen readers. Skip navigation to jump between sections
- Cannot pause simulation: once started, audio continues. Leaving page → warning "Rời trang sẽ hủy bài thi thử. Tiếp tục?" If user leaves → attempt recorded as abandoned (no score)
- Depends on: F-LIST-03 (full 4-section content must exist), F-LIST-04 (score recording)
