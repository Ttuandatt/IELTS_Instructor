# US-BILL-04 — View, cancel, or change my subscription

| Field | Value |
|-------|-------|
| **Feature** | Subscription Management |
| **Domain** | Billing & Subscription |

> As a learner, I want to view, cancel, or change my subscription, so that I have control over my spending.

## Acceptance Criteria

- AC1: Subscription management at `/settings/subscription`. Requires authentication
- AC2: Active subscription view:
- AC3: Cancel subscription: "Hủy gói Premium" link → confirmation modal:
- AC4: Reactivation: if cancelled but still within billing period, "Kích hoạt lại" button → immediately restores to active. No re-payment needed (period already paid)
- AC5: Expired subscription: after `current_period_end` + no renewal → `status=expired`. Learner reverts to free tier. Dashboard shows "Gói Premium đã hết hạn" banner with "Gia hạn" button
- AC6: Auto-renewal: enabled by default. Before renewal (3 days before `current_period_end`): email notification "Gói Premium sẽ tự động gia hạn vào {date} — {amount}đ". Payment charged automatically via saved payment method
- AC7: Failed renewal: if auto-payment fails → `status=past_due`. 3 retry attempts over 7 days (day 1, day 3, day 7). Email each failure: "Thanh toán thất bại — vui lòng cập nhật phương thức thanh toán". After 3 failures → `status=expired`
- AC8: Payment history: "Lịch sử thanh toán" section — table of past payments with: date, amount, method, status, receipt link (PDF download)
- AC9: No plan upgrade/downgrade in v1 — only Premium and Free exist. Future: annual plan at discount
- AC10: Depends on: F-BILL-03 (payment method on file), F-NOTIF-02 (renewal emails)
