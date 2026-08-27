# US-WRIT-12 — Pick any published prompt and get AI scoring

| Field | Value |
|-------|-------|
| **Feature** | Self-Study Writing |
| **Domain** | Writing |

> As a self-study learner (not enrolled in any classroom), I want to pick any published prompt and get AI scoring, so that I can practice writing independently.

## Acceptance Criteria

- Self-study prompt browser: `/writing/browse`. Shows all prompts with `status=published` and `visibility=public` (instructor can mark prompts as public when creating)
- Browse page: card grid showing prompt title, task type badge, tags, difficulty, submission count. "Viết bài" button on each card → navigates to writing editor
- Self-study submissions: `lesson_id = null`, `classroom_id = null`. These fields distinguish self-study from classroom submissions
- **Invariant #1 enforcement:** self-study submissions follow ONLY these state transitions: `draft → submitted → ai_scored → released_ai` OR `draft → submitted → ai_failed → submitted (retry)`. NEVER enters `pending_review` or `finalized` states — these require instructor action which doesn't exist in self-study context
- AI scoring result shown immediately to learner regardless of any setting (there is no classroom `writing_mode` for self-study). State: `ai_scored` → auto-transition to `released_ai`
- Self-study scoring uses cheap Gemini tier (`gemini-2.5-flash`) by default. Premium tier available to subscribed users (see F-BILL-02)
- Self-study submissions appear in learner's writing history alongside classroom submissions. Filter available: "Tự học" / "Lớp học" / "Tất cả"
- Learner can switch between self-study and classroom mode without restrictions. Joining a classroom doesn't affect existing self-study submissions
- Rate limit applies equally to self-study submissions (10/day, see F-WRIT-09)
- Prompt visibility: instructors control `visibility` flag — `private` (only their classroom learners see it) or `public` (all learners see it in self-study browse). Default: `private`
