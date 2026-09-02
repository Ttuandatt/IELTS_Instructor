# US-AUTH-09 — Delete account and data

| Field | Value |
|-------|-------|
| **PRD Ref** | FR-AUTH-009 (BỔ SUNG) |
| **Priority** | P2 |
| **Story Points** | 5 |

> As a user, I want to delete my account and all data, so that I can exercise my data rights under PDPL.

## Acceptance Criteria

- AC1: "Xóa tài khoản" button at `/settings/account`; destructive styling (red)
- AC2: Confirmation modal: requires password (or email for Google-only accounts)
- AC3: On confirm: `status: 'soft_deleted'`, `deletedAt: now()`; all refresh tokens revoked; logged out; redirect to login
- AC4: 30-day grace period: login attempt shows restore option; restoring sets `status: 'active'`, clears `deletedAt`
- AC5: Soft-deleted excluded from: classroom member lists, search, instructor listings; display as "Người dùng đã xóa" in historical data
- AC6: After 30 days — hard delete (daily background job): remove PII, anonymize submissions, delete avatar files, delete all tokens
- AC7: Instructor with active classrooms: warning + checkbox confirmation about classroom ownership transfer
- AC8: Audit log: deletion request recorded with timestamp, user ID, IP; retained 90 days post-hard-delete
