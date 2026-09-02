# US-BILL-03 — Pay via VNPay or Momo (local payment methods)

| Field | Value |
|-------|-------|
| **Feature** | Payment Integration (VNPay/Momo) |
| **Domain** | Billing & Subscription |

> As a learner, I want to pay via VNPay or Momo (local payment methods), so that I can subscribe using my preferred payment method.

## Acceptance Criteria

- AC1: Payment methods page at `/settings/payment`: shows available methods with logos: VNPay (QR), Momo (e-wallet), and future international methods placeholder
- AC2: **VNPay flow:**
- AC3: **Momo flow:**
- AC4: Payment record: `{ id, user_id, provider (vnpay/momo), order_id, amount_vnd, status (pending/completed/failed/refunded), provider_transaction_id, raw_response (JSON), created_at, completed_at }`
- AC5: Duplicate payment prevention: if user already has active subscription, payment page shows "Bạn đã có gói Premium (hết hạn {date})" instead of payment form
- AC6: Currency: VND only. All amounts in đồng, no cents/decimals. Display format: "50.000đ" (Vietnamese number formatting with dots)
- AC7: Payment receipt: email sent on successful payment with: order ID, amount, payment method, subscription period, support contact. Also viewable in `/settings/payment/history`
- AC8: Webhook security: verify all incoming webhooks using provider's signature scheme. Reject unsigned or invalid-signature requests (log as security event). Idempotent processing — same IPN received twice doesn't create duplicate subscription
- AC9: Error handling: payment provider down → "Hệ thống thanh toán tạm thời không khả dụng. Vui lòng thử lại sau" (no retry loop — user retries manually)
- AC10: Sandbox/test mode: configurable via environment variable `PAYMENT_MODE=sandbox|production`. Sandbox uses provider test credentials, creates real DB records marked `is_test=true`
- AC11: Depends on: F-BILL-02 (subscription tiers), F-NOTIF-02 (email receipt)
