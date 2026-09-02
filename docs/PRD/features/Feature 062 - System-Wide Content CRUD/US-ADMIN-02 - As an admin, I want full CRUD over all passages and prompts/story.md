# US-ADMIN-02 — As an admin, I want full CRUD over all passages and prompts 

| Field | Value |
|-------|-------|
| **Feature** | System-Wide Content CRUD |
| **Domain** | Admin |

> As an admin, I want full CRUD over all passages and prompts regardless of who created them, so that I can manage content quality across the entire platform.

## Acceptance Criteria

- AC1: Admin content pages: `/admin/passages` and `/admin/prompts`. Show ALL content from all instructors (not scoped to creator)
- AC2: Table columns: Title, Creator (instructor name), Status, Created Date, Updated Date, Tags, Submissions Count. Sortable by all columns
- AC3: Search by title (substring). Filter by: status (draft/published), creator (instructor dropdown), tags
- AC4: Admin can: edit any content (opens same editor as instructor but for any item), publish/unpublish, delete (soft-delete)
- AC5: All admin edits tracked in `content_versions` table (see F-ADMIN-03): `{ content_id, content_type, editor_id, action, changes_diff, timestamp }`
- AC6: Publish/unpublish: toggle button with confirmation. Unpublishing active content with linked lessons → warning "Bài đọc/đề viết này đang được dùng trong {n} bài học. Ẩn nội dung sẽ ảnh hưởng đến học sinh"
- AC7: Delete: soft-delete with confirmation. "Xóa '{title}'? Nội dung sẽ bị ẩn nhưng bài nộp liên quan giữ lại." Hard-delete option only for content with 0 submissions
- AC8: Bulk actions: select multiple items → "Xuất bản tất cả" / "Ẩn tất cả" / "Xóa tất cả". Confirmation shows count
- AC9: Admin edits notify the original creator: "Admin đã chỉnh sửa bài đọc '{title}' của bạn" in-app notification
