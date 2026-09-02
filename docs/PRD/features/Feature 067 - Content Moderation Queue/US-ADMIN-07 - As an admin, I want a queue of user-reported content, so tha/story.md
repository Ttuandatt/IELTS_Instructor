# US-ADMIN-07 — As an admin, I want a queue of user-reported content, so tha

| Field | Value |
|-------|-------|
| **Feature** | Content Moderation Queue |
| **Domain** | Admin |

> As an admin, I want a queue of user-reported content, so that I can review and take action on inappropriate or incorrect material.

## Acceptance Criteria

- AC1: Report flow (user-facing): on any passage or prompt detail page, "Báo cáo" (🚩) button → modal with reason selector:
- AC2: Report record: `{ id, content_id, content_type (passage/prompt), reporter_id, reason_category, reason_text, status (pending/reviewed/dismissed), created_at, reviewed_by, reviewed_at }`
- AC3: Duplicate reports: same user can't report same content twice → "Bạn đã báo cáo nội dung này rồi". Multiple users reporting same content → grouped in admin queue with count
- AC4: Admin moderation queue at `/admin/moderation`. Shows all `status=pending` reports sorted by newest first
- AC5: Queue table: Content Title, Content Type (badge), Reporter, Reason, Report Date, Report Count (if multiple reporters). Click → report detail
- AC6: Report detail: shows the reported content (passage/prompt) alongside report details. Admin actions:
- AC7: Moderation stats: total reports pending, avg resolution time, reports by category (pie chart)
- AC8: Rate limit on reporting: max 10 reports per user per day (prevent abuse). Exceeded → "Bạn đã gửi quá nhiều báo cáo hôm nay"
- AC9: Reporter anonymity: content creator never sees who reported them (only admin sees reporter identity)
