# US-INT-02 — Export Langy scores to my LMS (Moodle/Canvas)

| Field | Value |
|-------|-------|
| **Feature** | LMS Grade Export |
| **Domain** | Integration |

> As an instructor, I want to export Langy scores to my LMS (Moodle/Canvas), so that grades are centralized.

## Acceptance Criteria

- Export page at `/instructor/export/grades` or accessible from classroom analytics (F-DASH-06)
- Export configuration:
- Export content per student per assignment:
- Download: "Xuất CSV" button → generates CSV file (UTF-8 with BOM for Vietnamese character support in Excel). Browser download. Filename: `langy_grades_{classroom}_{from}_{to}.csv`
- Preview before export: "Xem trước" button shows first 10 rows of the CSV in a table. Instructor can verify data before downloading
- Edge cases:
- No direct LMS API integration in v1 (too many LMS variants). CSV export covers 90% of use cases. Future: LTI 1.3 integration for seamless grade passback
- Rate limit: max 5 exports per hour per instructor
- Depends on: F-DASH-06 (classroom analytics data source), F-READ-03 (reading scores), F-WRIT-06 (writing scores)
