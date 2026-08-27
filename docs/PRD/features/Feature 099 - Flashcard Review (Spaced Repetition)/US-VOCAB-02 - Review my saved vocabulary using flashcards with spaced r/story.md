# US-VOCAB-02 — Review my saved vocabulary using flashcards with spaced r...

| Field | Value |
|-------|-------|
| **Feature** | Flashcard Review (Spaced Repetition) |
| **Domain** | Vocabulary & Language Tools |

> As a learner, I want to review my saved vocabulary using flashcards with spaced repetition, so that I retain words long-term.

## Acceptance Criteria

- Flashcard page at `/vocabulary/review`. Entry point: "Ôn từ vựng" button on vocabulary list + dashboard quick action (F-DASH-01)
- Dashboard widget: "📖 {n} từ cần ôn hôm nay" card with "Ôn tập" button. Count based on words where `next_review_date <= today`. If 0: "Không có từ cần ôn hôm nay ✅"
- Flashcard UI: single card centered on screen. Front: word in large text + part of speech badge + phonetic IPA. Back (revealed on tap/click/Space): definition + example sentence + notes (if any)
- "Lật thẻ" button or tap card / press Space to flip. Animation: 3D card flip (CSS transform, respects prefers-reduced-motion → instant swap if reduced motion)
- After revealing answer, self-rating buttons:
- Spaced repetition algorithm (SM-2 simplified):
- Session flow: cards shown in order of overdue-ness (most overdue first). Session ends when all due cards reviewed OR user clicks "Kết thúc" (no forced completion). Session summary: "Đã ôn {n} từ — {correct} biết, {hard} khó, {forgot} quên"
- Session limit: max 50 cards per session (prevent fatigue). If > 50 due: show 50, remainder carries to tomorrow. Message: "Còn {remaining} từ — sẽ ôn tiếp ngày mai"
- Audio pronunciation: if IPA data available, optional "🔊" button plays TTS pronunciation (browser SpeechSynthesis API, language: en-US). No external API call
- Statistics: vocabulary page shows: total words, words by mastery level (donut chart), review streak (consecutive days with review), average retention rate (% "Biết rồi" over last 30 reviews)
- Review counts as activity for study streak (F-ENG-01) if ≥ 5 cards reviewed
- Depends on: F-VOCAB-01 (vocabulary list as data source), F-DASH-01 (dashboard widget)
