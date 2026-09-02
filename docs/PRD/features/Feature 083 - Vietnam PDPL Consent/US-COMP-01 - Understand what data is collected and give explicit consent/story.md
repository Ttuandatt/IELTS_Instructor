# US-COMP-01 — Understand what data is collected and give explicit consent

| Field | Value |
|-------|-------|
| **Feature** | Vietnam PDPL Consent |
| **Domain** | Compliance & Security |

> As a learner, I want to understand what data is collected and give explicit consent, so that my rights under PDPL are respected.

## Acceptance Criteria

- AC1: Registration form includes mandatory consent checkbox: "Tôi đồng ý với [Chính sách bảo mật](link) và [Điều khoản sử dụng](link) của Langy". Checkbox unchecked by default (PDPL requires affirmative action). Registration button disabled until checked
- AC2: Consent record stored: `{ user_id, policy_version (semver, e.g., "1.0.0"), consented_at (ISO timestamp), ip_address (hashed for audit, not raw), consent_method ("registration" | "re-consent") }`. Immutable — never updated, new row created for each consent event
- AC3: Privacy policy page at `/privacy` — publicly accessible (no login required). Content in Vietnamese (primary) with English toggle. Covers: what data is collected (profile, submissions, scores, usage analytics), why (service delivery, improvement), how long retained, who it's shared with (Gemini API — essay text only, no PII), user rights (access, deletion, correction), contact info for data controller
- AC4: Policy versioning: `policy_version` field in consent record. When admin updates privacy policy (new version number), all existing users prompted to re-consent on next login
- AC5: Re-consent flow: modal on login: "Chính sách bảo mật đã được cập nhật (phiên bản {new_version}). Vui lòng đọc và đồng ý để tiếp tục." with link to updated policy + consent checkbox. User cannot proceed past the modal without consenting. "Không đồng ý" option → logs out, account restricted (read-only) until consent given
- AC6: Terms of Service page at `/terms` — separate from privacy policy. Same consent checkbox covers both documents
- AC7: Admin can view consent audit log: per-user consent history showing all versions consented to, timestamps, and IP hashes
- AC8: API: all endpoints that create user data (submissions, vocabulary saves, etc.) check that user has consented to current policy version. Missing consent → 403 "Vui lòng đồng ý với chính sách bảo mật mới"
