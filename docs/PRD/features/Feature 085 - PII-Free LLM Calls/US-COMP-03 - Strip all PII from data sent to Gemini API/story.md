# US-COMP-03 — Strip all PII from data sent to Gemini API

| Field | Value |
|-------|-------|
| **Feature** | PII-Free LLM Calls |
| **Domain** | Compliance & Security |

> As the system, I want to strip all PII from data sent to Gemini API, so that student personal information never leaves our servers.

## Acceptance Criteria

- PII stripping layer in scoring pipeline (before Gemini API call in `scoring.service.ts`):
- Prompt templates (`SYSTEM_PROMPT` in `parsing.service.ts` and scoring prompts) contain zero PII placeholders. Audit: grep all prompt templates for `user_id`, `email`, `name` — must return zero matches
- API request logging: all Gemini API requests logged in `scoring_logs` table with: `prompt_version`, `model`, `input_tokens`, `output_tokens`, `latency_ms`, `submission_id` (our internal ID, not user-facing). Logs do NOT include: raw prompt text (too large, stored separately if needed), user identifiers in the log record
- If PII is accidentally included in an API call (defense-in-depth): Gemini API data processing agreement (DPA) must cover this. Document this in privacy policy: "Bài viết có thể được gửi đến dịch vụ AI bên thứ ba để chấm điểm"
- `prompt_version` field on each scoring record: tracks which prompt template version was used. Format: `scoring-v{n}` (e.g., `scoring-v3`). Allows auditing: which template was active when a specific submission was scored
- Gemini API configuration: use `safety_settings` to block personal information categories. Set `generationConfig.temperature` consistently per prompt version
- Data flow audit (annual, documented): trace what data leaves the server → Gemini. Documented in compliance folder
- Reading parsing (F-IMPORT-01/02): passage content is not PII (it's published IELTS material), so no stripping needed. But user metadata (uploader identity) is never sent to Gemini
- Depends on: F-WRIT-05 (scoring pipeline where stripping happens)
