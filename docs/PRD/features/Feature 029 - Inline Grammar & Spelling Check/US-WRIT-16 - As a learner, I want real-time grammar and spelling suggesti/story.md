# US-WRIT-16 — As a learner, I want real-time grammar and spelling suggesti

| Field | Value |
|-------|-------|
| **Feature** | Inline Grammar & Spelling Check |
| **Domain** | Writing |

> As a learner, I want real-time grammar and spelling suggestions while typing my essay, so that I can catch basic errors before submitting.

## Acceptance Criteria

- Check engine: client-side rule-based checker (e.g., LanguageTool API self-hosted or lightweight JS grammar library). NOT Gemini — latency too high for real-time (needs < 500ms response). Fallback: if no checker available, feature silently disabled
- Trigger: check runs on pause (debounce 1000ms after last keystroke) or on paragraph completion (Enter key). Does NOT run on every keystroke (performance)
- Error display: inline wavy underlines — red for spelling errors, blue for grammar errors, green for style suggestions
- Click/tap on underlined word: popover tooltip shows:
- Error count: small badge near word count: "⚠ {n} lỗi" (clickable → scrolls to first error)
- Toggle: setting in user preferences "Kiểm tra chính tả và ngữ pháp" (default: ON). When OFF, no underlines shown, no API calls made. Toggle also available as button in editor toolbar: "Aa✓"
- Performance: checker processes max 500 words at a time (chunk long essays). Total processing time < 500ms per check cycle
- Privacy: if using external API, only the text chunk is sent (no user identity). If self-hosted, no data leaves the server
- Learner can submit regardless of errors — errors are suggestions only, not blockers
- Errors not included in AI scoring — the AI scores the submitted text as-is, not the corrected version
