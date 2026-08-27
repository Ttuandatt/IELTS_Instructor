# US-COMP-02 — Approve my child's account

| Field | Value |
|-------|-------|
| **Feature** | Parental Consent (Under 16) |
| **Domain** | Compliance & Security |

> As a parent/guardian, I want to approve my child's account, so that PDPL child data requirements are met.

## Acceptance Criteria

- Registration asks date of birth (DD/MM/YYYY date picker). Field required. Validated: not future, not > 100 years ago. Age calculated at registration time
- If age < 16 at registration: parental consent flow triggered immediately after registration form submit (before account activation)
- Parental consent flow:
- Account in restricted mode until parent approves: learner can log in and see a waiting screen "Đang chờ phụ huynh xác nhận. Kiểm tra email {masked_parent_email}" but cannot access any features. No data collected during restricted period except the account record itself
- Parental consent record: `{ user_id, parent_email (hashed after consent), consent_token_hash, consented_at, consent_method ("email_link"), policy_version }`. Linked to user's main consent record
- If user turns 16 (based on DOB): parental consent requirement automatically drops. No action needed from parent or user. System treats them as a regular adult user going forward
- Re-consent for minors: policy update triggers re-consent to BOTH the user AND their parent (parent receives new email)
- Edge case: user enters DOB making them 16+ but is actually younger → platform relies on declared DOB (no ID verification in v1). Terms of Service state user is responsible for accurate DOB
- Admin view: filter users by `is_minor=true` and `parental_consent_status` (pending/approved/expired)
- Depends on: F-AUTH-01 (registration flow), F-NOTIF-02 (email sending)
