# US-BILL-05 — Create promo codes for discounts

| Field | Value |
|-------|-------|
| **Feature** | Promo Codes |
| **Domain** | Billing & Subscription |

> As an admin, I want to create promo codes for discounts, so that I can run promotions for early adopters or teacher referrals.

## Acceptance Criteria

- AC1: Admin promo management at `/admin/promos`. Requires `role=admin`
- AC2: Create promo code form:
- AC3: Promo code record: `{ id, code (unique), discount_type, discount_value, max_usage, current_usage, per_user_limit, expires_at, is_active, description, created_by, created_at }`
- AC4: Learner applies promo at checkout: text input "Mã giảm giá" on payment page → "Áp dụng" button → validation:
- AC5: Usage tracking: admin sees per-code: total uses, remaining uses, revenue impact (total discount given), list of users who redeemed (date + user email)
- AC6: Admin can: deactivate code (toggle `is_active`), edit max_usage and expiry (not code itself), delete unused codes (0 redemptions only — codes with redemptions are soft-deleted for audit)
- AC7: Promo applied to first billing cycle only (not recurring) unless admin explicitly marks "Recurring discount" (v1: first cycle only)
- AC8: Depends on: F-BILL-03 (checkout flow), F-BILL-02 (subscription activation)
