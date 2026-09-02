# US-SPEAK-02 — As a learner, I want AI to assess my speaking recording, so 

| Field | Value |
|-------|-------|
| **Feature** | AI Speaking Assessment |
| **Domain** | Speaking |

> As a learner, I want AI to assess my speaking recording, so that I can get feedback without an instructor.

## Acceptance Criteria

- AC1: Assessment triggered on submission: learner submits speaking recording(s) → BullMQ job `speaking-scoring` queued (same pattern as writing scoring, F-WRIT-05)
- AC2: Pipeline:
- AC3: Assessment output (Gemini structured JSON):
- AC4: Band estimate label: "Ước lượng" (estimate) — clearly labeled, same as writing (decision D3). Disclaimer: "Điểm AI là ước lượng và có thể khác với điểm thi thật, đặc biệt với kỹ năng Phát âm"
- AC5: Pronunciation caveat: AI pronunciation assessment has lower accuracy than human examiners. Additional disclaimer on pronunciation band: "Đánh giá phát âm bằng AI có độ chính xác giới hạn"
- AC6: Feedback display: score card with 4 criteria (same layout as writing feedback). Each criterion: band score + progress bar + Vietnamese feedback paragraph
- AC7: Timestamp feedback (if supported by transcription model): specific timestamps in transcript highlighted with comments: "Lúc 0:45 — sử dụng filler 'um' nhiều lần" or "Lúc 1:20 — dùng từ vựng hay: 'meticulously'"
- AC8: Transcript display: below score card. Transcript text shown with AI-annotated segments highlighted (color-coded by criterion type). Learner can read along with audio playback
- AC9: Token/cost: speaking assessment typically more expensive than writing (audio input tokens). Logged in scoring_logs. Same rate limit as writing scoring (10/day free tier, unlimited premium)
- AC10: Scoring time target: < 60 seconds p95 (audio transcription + text assessment combined)
- AC11: Error handling: audio too short (< 10 seconds) → "Bản ghi quá ngắn để đánh giá. Vui lòng nói ít nhất 10 giây". Audio quality too poor (transcription confidence < 0.3) → "Chất lượng âm thanh kém. Vui lòng ghi âm lại trong môi trường yên tĩnh"
- AC12: Depends on: F-SPEAK-01 (recording submission), F-WRIT-05 (scoring pipeline pattern reused), F-BILL-02 (rate limits)
