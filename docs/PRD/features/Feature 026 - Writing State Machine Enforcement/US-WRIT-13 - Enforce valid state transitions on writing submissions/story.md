# US-WRIT-13 — Enforce valid state transitions on writing submissions

| Field | Value |
|-------|-------|
| **Feature** | Writing State Machine Enforcement |
| **Domain** | Writing |

> As the system, I want to enforce valid state transitions on writing submissions, so that data integrity is guaranteed and no invalid state is ever persisted.

## Acceptance Criteria

- AC1: State enum: `draft`, `submitted`, `ai_scored`, `ai_failed`, `released_ai`, `pending_review`, `finalized`
- AC2: Allowed transitions (whitelist — ALL other transitions are invalid):
- AC3: **Invariant #1:** Submissions with `lesson_id = null` (self-study) can NEVER transition to `pending_review` or `finalized`. Attempted → 400 "Bài tự học không thể chuyển sang trạng thái duyệt"
- AC4: **Invariant #2:** Changing classroom `writing_mode` does NOT trigger transitions on existing submissions. Only NEW submissions after the mode change follow the new flow
- AC5: **Invariant #3:** `finalized` is a sink state — no outbound transitions. Any attempt → 400 "Bài đã hoàn tất, không thể thay đổi trạng thái"
- AC6: Invalid transition attempt: API returns 400 with `{ error: 'INVALID_TRANSITION', from: currentState, to: attemptedState, message: 'Không thể chuyển từ {from} sang {to}' }`. Logged as warning with `user_id`, `submission_id`, `from`, `to`, `timestamp`
- AC7: State transition service: centralized `SubmissionStateService.transition(submissionId, targetState, actor)`. All state changes MUST go through this service — no direct DB updates to `state` field from controllers/other services
- AC8: Transition audit log: each transition recorded in `submission_state_log` table: `{ submission_id, from_state, to_state, actor_id, actor_role, triggered_by (manual/system), timestamp, metadata (JSON — e.g., retry_count, error_info) }`
- AC9: Concurrency: state transition uses optimistic locking (`version` field or `WHERE state = expectedState` in UPDATE query) to prevent race conditions (e.g., instructor releases while system is transitioning)
- AC10: Database constraint: `CHECK (state IN ('draft','submitted','ai_scored','ai_failed','released_ai','pending_review','finalized'))` — no invalid state values at DB level
