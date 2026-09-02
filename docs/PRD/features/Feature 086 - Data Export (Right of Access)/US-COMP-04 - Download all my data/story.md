# US-COMP-04 — Download all my data

| Field | Value |
|-------|-------|
| **Feature** | Data Export (Right of Access) |
| **Domain** | Compliance & Security |

> As a user, I want to download all my data, so that I can exercise my right of access under PDPL.

## Acceptance Criteria

- AC1: Settings page has "Tải dữ liệu của tôi" button at `/settings/privacy`. Visible to all authenticated users (learner, instructor, admin)
- AC2: Click → confirmation modal: "Chúng tôi sẽ chuẩn bị file chứa tất cả dữ liệu của bạn. Bạn sẽ nhận thông báo khi sẵn sàng (thường trong 1 giờ, tối đa 24 giờ)."
- AC3: Export job queued in BullMQ `data-export` queue (avoid blocking API). Job priority: normal (not urgent, but SLA: complete within 24 hours)
- AC4: Export contents (ZIP file, UTF-8):
- AC5: Export does NOT include: other users' data, admin-internal records, raw LLM responses (only processed scores), system logs about the user (audit logs are admin-only)
- AC6: ZIP file stored in `uploads/exports/` (temporary, auto-deleted after 7 days). Download link sent via:
- AC7: Download requires authentication (token in link + session check). Cannot be accessed by other users
- AC8: Rate limit: 1 export request per user per 24 hours. Pending export → "Đang chuẩn bị dữ liệu — vui lòng đợi" with timestamp of request
- AC9: File size: estimated < 50MB for most users (text-heavy, no media). Large exporters (1000+ submissions) may take longer; progress not tracked (just completion notification)
- AC10: PDPL compliance: export must be in a "commonly used, machine-readable format" — JSON satisfies this. Include schema documentation in README.txt
- AC11: Depends on: F-NOTIF-01 (completion notification), F-NOTIF-02 (email notification)
