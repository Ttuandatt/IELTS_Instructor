# US-DASH-07 — Export class progress as a formatted PDF or data CSV

| Field | Value |
|-------|-------|
| **Feature** | Export Report (PDF/CSV) |
| **Domain** | Dashboard & Analytics |

> As an instructor, I want to export class progress as a formatted PDF or data CSV, so that I can share reports with parents, institutions, or keep records.

## Acceptance Criteria

- Export button on classroom progress page (F-CLASS-07): dropdown "Xuất PDF" / "Xuất CSV"
- CSV export:
- PDF export:
- Download delivered as browser download (Content-Disposition: attachment). No file stored on server — generated on-demand
- Rate limit: max 5 exports per instructor per hour (prevent CPU abuse from PDF generation)
- Empty classroom (no students): export contains header only with "Không có dữ liệu" message
- Depends on: F-CLASS-07 (progress data source)
