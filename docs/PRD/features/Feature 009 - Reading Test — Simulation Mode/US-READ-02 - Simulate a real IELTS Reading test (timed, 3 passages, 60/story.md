# US-READ-02 — Simulate a real IELTS Reading test (timed, 3 passages, 60...

| Field | Value |
|-------|-------|
| **Feature** | Reading Test — Simulation Mode |
| **Domain** | Reading |

> As a learner, I want to simulate a real IELTS Reading test (timed, 3 passages, 60 minutes), so that I can practice under authentic exam conditions.

## Acceptance Criteria

- Entry point: `/reading/simulation` or "Thi thử" button on reading list page. Requires at least 3 published passages in DB; fewer → show "Chưa đủ bài đọc để thi thử (cần ít nhất 3 bài)"
- System selects 3 passages: can be randomly assigned or instructor-curated (if assigned via lesson). Order: Passage 1 (easiest) → Passage 3 (hardest), matching IELTS difficulty curve
- Timer: 60-minute countdown displayed top-right, format "MM:SS". Color coding: > 10 min → default, 5-10 min → orange, < 5 min → red pulsing. Timer persists across passage navigation
- When timer hits 00:00: auto-submit all answered questions immediately; show confirmation "Hết giờ! Bài thi đã được nộp tự động"; unanswered questions scored as 0
- Passage navigation: tabs or numbered buttons "Passage 1 / 2 / 3" at top of question panel. Current passage tab highlighted. Each passage shows its own question set. Switching passages preserves already-entered answers
- Question numbering: continuous across all 3 passages (e.g., Passage 1: Q1-13, Passage 2: Q14-26, Passage 3: Q27-40), matching IELTS convention of 40 questions total
- Answer sheet overview: small panel or modal showing Q1-40 grid with filled/empty indicators. Click a number → scroll to that question. Accessible via "Tổng quan" button
- Submit before timer ends: "Nộp bài sớm" button; confirmation "Bạn còn {MM:SS}. Bạn có chắc muốn nộp?" with "Nộp" and "Tiếp tục làm bài"
- After submit (manual or auto): score displayed as "{correct}/40 ({percentage}%)" with per-passage breakdown: "Passage 1: {x}/{y}, Passage 2: {x}/{y}, Passage 3: {x}/{y}". Per-question correct/incorrect review same as practice mode
- Attempt saved: `mode=simulation`, `passages` (array of 3 passage IDs), `time_used_seconds`, `submitted_at`. Linked to all 3 passage scores
- Browser tab/window close during simulation: `beforeunload` event shows browser-native "Are you sure?" confirmation. Answers NOT auto-saved (no resume on return — fresh start required)
- No pause functionality (matches real IELTS exam behavior)
