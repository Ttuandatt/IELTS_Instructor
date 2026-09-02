# US-WRIT-04 — Use Gemini structured output parsing for AI scoring

| Field | Value |
|-------|-------|
| **Feature** | AI Scoring (Gemini) |
| **Domain** | Writing |

> As the system, I want to use Gemini structured output parsing for AI scoring, so that malformed responses are caught before corrupting the database.

## Acceptance Criteria

- AC1: Gemini API called with `response_mime_type: "application/json"` and `response_schema` matching the expected scoring JSON structure
- AC2: Response validated by `schema-validator.service` against TypeScript interface before persisting. Validation checks:
- AC3: Validation failure: state → `ai_failed`, error type = `SCHEMA_VALIDATION`, full Gemini response logged for debugging (PII-free — essay text not in error log)
- AC4: `prompt_version` field stored on submission: string like "scoring_v3.2". When scoring prompt template changes, version incremented. Allows comparing score distributions across prompt versions
- AC5: Gemini `safety_ratings` checked: if response is blocked by safety filters, state → `ai_failed` with error type = `SAFETY_FILTER`. Log the category that triggered (but not the essay text)
