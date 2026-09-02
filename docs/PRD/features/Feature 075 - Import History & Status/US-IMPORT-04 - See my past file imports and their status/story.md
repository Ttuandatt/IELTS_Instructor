# US-IMPORT-04 — See my past file imports and their status

| Field | Value |
|-------|-------|
| **Feature** | Import History & Status |
| **Domain** | Content Import & Parsing |

> As an instructor, I want to see my past file imports and their status, so that I can track what's been processed and retry failed imports.

## Acceptance Criteria

- AC1: Import history page: `/instructor/imports` or tab within passage management
- AC2: Table columns: Filename (original name), Upload Date (DD/MM/YYYY HH:mm), File Type (DOCX/PDF badge), Status (badge), Linked Passage (if imported), Parse Method (Mammoth/Gemini badge), Actions
- AC3: Status badges:
- AC4: Failed imports: show error message summary on hover/expand. "Thử lại" button → re-queues parsing job with same file
- AC5: Done imports: "Xem bài đọc" link → navigates to the created passage
- AC6: Pending imports: "Tiếp tục" link → returns to preview page to review and import
- AC7: Delete import record: trash icon → confirmation. Deletes import record and uploaded file (if passage not yet created). If passage already created, only import record is deleted (passage remains)
- AC8: Pagination: 20 per page. Filter by status
- AC9: Sort: newest first (default)
- AC10: Import record: `{ id, instructor_id, filename, file_type, file_path, status, parse_method, error_message, passage_id (nullable), created_at, completed_at }`
