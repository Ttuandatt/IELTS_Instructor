# US-WRIT-05 — Log token usage per scoring request

| Field | Value |
|-------|-------|
| **Feature** | AI Scoring (Gemini) |
| **Domain** | Writing |

> As the system, I want to log token usage per scoring request, so that LLM costs are trackable and budgetable.

## Acceptance Criteria

- After each Gemini API call, extract from response metadata: `prompt_token_count` (input), `candidates_token_count` (output), `total_token_count`
- Stored in `scoring_logs` table: `{ submission_id, model_name, prompt_version, tokens_input, tokens_output, latency_ms, status (success/failed), created_at }`
- Cost calculation: `tokens_input * input_price_per_token + tokens_output * output_price_per_token`. Prices configurable in system settings (updated when Gemini pricing changes)
- Admin analytics endpoint: `GET /api/admin/analytics/llm-usage?from=&to=` returns `{ total_requests, total_tokens_input, total_tokens_output, total_estimated_cost_vnd, daily_breakdown[] }`
- Daily cost alert: if estimated daily cost exceeds threshold (configurable, default 500,000 VND), admin notified via in-app notification
- Token logs retained for 1 year (audit compliance)
- Failed scoring attempts also logged (with `status=failed`) — captures wasted tokens
