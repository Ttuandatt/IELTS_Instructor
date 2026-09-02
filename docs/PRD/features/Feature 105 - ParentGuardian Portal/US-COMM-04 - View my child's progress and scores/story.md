# US-COMM-04 — View my child's progress and scores

| Field | Value |
|-------|-------|
| **Feature** | Parent/Guardian Portal |
| **Domain** | Communication |

> As a parent, I want to view my child's progress and scores, so that I can support their IELTS preparation.

## Acceptance Criteria

- AC1: Parent account type: separate role `parent` (not learner or instructor). Created via invitation flow, not regular registration
- AC2: Linking flow:
- AC3: Parent dashboard at `/parent/dashboard`:
- AC4: Parent can see:
- AC5: Parent cannot see:
- AC6: Instructor → parent communication: instructor can share a formatted progress report with parent directly via "Gửi cho phụ huynh" button on student progress page (F-CLASS-07). Sends email with PDF report attached (same as F-DASH-07 but with parent-friendly summary header)
- AC7: Unlink: learner can remove parent access at any time (Settings → linked parents → "Hủy liên kết"). Parent account remains but loses access to that learner's data. If parent has no linked learners → account becomes inactive (can re-link later)
- AC8: PDPL: parent access requires learner's consent if learner is 16+ (adults control their own data). If learner is < 16: parent access is implicit (parental consent already established, F-COMP-02)
- AC9: Parent notification preferences (limited): can receive weekly summary email (opt-in): "Báo cáo tuần: {child_name} đã luyện {n} bài, điểm trung bình: {band}"
- AC10: Depends on: F-AUTH-01 (parent registration), F-DASH-01 (dashboard data), F-COMP-02 (minor consent), F-NOTIF-02 (email delivery)
