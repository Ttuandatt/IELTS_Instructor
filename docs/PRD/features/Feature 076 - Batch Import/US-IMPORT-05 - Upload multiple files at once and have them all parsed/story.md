# US-IMPORT-05 — Upload multiple files at once and have them all parsed

| Field | Value |
|-------|-------|
| **Feature** | Batch Import |
| **Domain** | Content Import & Parsing |

> As an instructor, I want to upload multiple files at once and have them all parsed, so that I can quickly seed content from a folder of Cambridge tests.

## Acceptance Criteria

- AC1: Upload UI: drag-and-drop zone that accepts multiple files. Also "Chọn file" button for file picker (multi-select). Accepted formats: DOCX and PDF mixed. Max files per batch: 10. Max total size: 100MB
- AC2: Validation before upload: each file individually validated (format, size). Invalid files shown with ❌ and reason: "file.txt — Định dạng không hỗ trợ" or "large.pdf — Vượt quá 20MB". Invalid files can be removed from queue; valid files proceed
- AC3: Upload behavior: all files uploaded to server immediately. Each file creates a separate `import_job` record. Jobs queued in BullMQ `import` queue with sequential processing (to avoid Gemini API rate limits)
- AC4: Progress UI: table showing each file with: filename, file type, status (queued → parsing → done/failed), progress bar. Real-time status updates via WebSocket (F-NOTIF-04) or polling (5-second interval)
- AC5: Status per file:
- AC6: Each completed file requires individual review (preview → import) before it's saved as a passage. Batch auto-import NOT supported (quality control — instructor must review each parsed result)
- AC7: "Hủy hàng đợi" button: cancels all queued (not yet started) jobs. Currently-processing job continues
- AC8: Notification: when batch processing complete, notification "Đã phân tích xong {n}/{total} file. {failed} thất bại."
- AC9: Rate limit: combined with single-upload limit — max 10 import jobs per instructor per hour total
- AC10: Depends on: F-IMPORT-01 (DOCX pipeline), F-IMPORT-02 (PDF pipeline), F-NOTIF-04 (real-time status updates)
