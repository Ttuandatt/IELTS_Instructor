# US-SPEAK-01 — Practice speaking with timed prompts for all 3 parts

| Field | Value |
|-------|-------|
| **Feature** | Speaking Practice (Part 1/2/3) |
| **Domain** | Speaking |

> As a learner, I want to practice speaking with timed prompts for all 3 parts, so that I can prepare for the speaking test.

## Acceptance Criteria

- AC1: Speaking practice page at `/speaking/{prompt_id}`. Layout: prompt card (top), recording controls (center), timer (prominent)
- AC2: **Part 1 flow** (Interview questions):
- AC3: **Part 2 flow** (Long turn / Cue card):
- AC4: **Part 3 flow** (Discussion):
- AC5: Audio recording: browser `MediaRecorder` API (requires microphone permission). Format: WebM/Opus (default browser codec) or MP3 (if MediaRecorder supports). Fallback error: "Trình duyệt không hỗ trợ ghi âm. Vui lòng sử dụng Chrome/Firefox"
- AC6: Microphone permission: first-time prompt handled by browser. If denied: "Vui lòng cho phép sử dụng microphone trong cài đặt trình duyệt" with instructions link
- AC7: Recording indicators: red dot animation during recording. Waveform visualization (simple amplitude bar, Canvas-based). "Đang ghi âm…" text
- AC8: After each recording: "Nghe lại" button to review own recording (audio player). "Ghi lại" button to re-record (replaces previous recording). "Nộp" to finalize
- AC9: Recording stored: upload to `uploads/speaking/{user_id}/` as audio file. Max duration: 3 minutes per recording. Max file size: ~5MB per recording (audio is small)
- AC10: Speaking submission record: `{ id, user_id, prompt_id, part_type (1/2/3), recordings (JSONB: [{ question_index, audio_file_path, duration_seconds }]), status (draft/submitted/scored/reviewed), created_at }`
- AC11: Depends on: F-SPEAK-03 (speaking prompts must exist)
