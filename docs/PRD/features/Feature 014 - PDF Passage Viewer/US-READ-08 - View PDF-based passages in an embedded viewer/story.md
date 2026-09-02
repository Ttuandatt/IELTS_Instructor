# US-READ-08 — View PDF-based passages in an embedded viewer

| Field | Value |
|-------|-------|
| **Feature** | PDF Passage Viewer |
| **Domain** | Reading |

> As a learner, I want to view PDF-based passages in an embedded viewer, so that I can read scanned Cambridge tests with original formatting preserved.

## Acceptance Criteria

- AC1: PDF passages identified by `passage.pdf_file_path` field (non-null). When set, left panel renders PDF viewer instead of HTML content
- AC2: Viewer: `<iframe>` element with `src="{BACKEND_ORIGIN}/uploads/{filename}#toolbar=0&navpanes=0&scrollbar=0&view=FitH"`. No `/api/` prefix on uploads path
- AC3: Iframe styling: `width: 100%`, `height: 100%` of passage panel; no border; scrollable within iframe for multi-page PDFs
- AC4: Zoom controls (optional): "+" and "−" buttons above iframe that adjust `view=FitH` parameter or use iframe scale transform
- AC5: Fallback for missing PDF (file deleted from disk, 404): show message "Không tìm thấy file PDF. Vui lòng liên hệ giáo viên." with gray placeholder area instead of broken iframe
- AC6: Fallback for browsers that don't support PDF in iframe (rare, mainly older mobile): show "Trình duyệt không hỗ trợ xem PDF. Vui lòng tải về." with download link
- AC7: PDF does NOT support text selection for dictionary lookup (F-READ-10 only works with HTML passages). Info note shown for PDF passages: "Tính năng tra từ không khả dụng cho bài đọc dạng PDF"
- AC8: Mobile: PDF iframe takes full width; may require pinch-to-zoom for readability. Consider adding "Tải PDF" download button for mobile users
- AC9: Security: PDF served with `Content-Disposition: inline` and `X-Content-Type-Options: nosniff`. No execution of embedded scripts in PDF
