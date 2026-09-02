# US-ENGAGE-05 — See anonymized peer essays for the same prompt (opt-in)

| Field | Value |
|-------|-------|
| **Feature** | Peer Answer Comparison |
| **Domain** | Engagement & Gamification |

> As a learner, I want to see anonymized peer essays for the same prompt (opt-in), so that I can learn from other approaches.

## Acceptance Criteria

- AC1: Opt-in mechanism: after learner's writing submission is scored (state: `released_ai` or `finalized`), on score results page: "Chia sẻ bài viết để xem bài của bạn học khác?" toggle (default: OFF). Toggling ON shares this specific submission for peer viewing. Can be toggled OFF later (removes from peer pool)
- AC2: Opt-in is per-submission, not global. Each essay individually shared or not. Stored: `writing_submissions.peer_shared = boolean`
- AC3: Viewing peers: "Xem bài của bạn học khác" button (visible only after own submission is scored AND at least 2 peer submissions exist for same prompt). Button disabled with tooltip "Chưa có đủ bài viết từ bạn học khác" if < 2 peers available
- AC4: Click → peer comparison page showing 2-3 anonymized peer essays:
- AC5: Privacy boundary:
- AC6: AI comparison note (optional, Gemini-powered): brief paragraph comparing user's essay to peer's approach: "Bạn học A sử dụng nhiều collocations hơn ở phần Body 2. Cấu trúc câu phức tạp hơn ở…" Only shown if Gemini comparison is enabled (feature flag). Token cost: logged per comparison request
- AC7: Opt-out at any time: toggle OFF on any previously shared submission → immediately removed from peer pool. Other learners who already viewed it: fine (no retroactive erasure needed, similar to social media privacy)
- AC8: Rate: learners can view peers max 5 times per day (prevent obsessive comparison). Limit in Redis
- AC9: Data export (F-COMP-04): user's own opt-in history exported. Peer essays they viewed are NOT exported (not their data)
- AC10: Depends on: F-WRIT-06 (scored submission), F-CLASS-01 (classroom boundary for privacy)
