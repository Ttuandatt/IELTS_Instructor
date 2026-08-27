# US-ADMIN-03 — See the edit history of any passage or prompt

| Field | Value |
|-------|-------|
| **Feature** | Content Version History |
| **Domain** | Admin |

> As an admin, I want to see the edit history of any passage or prompt, so that I can audit changes, investigate issues, and revert if needed.

## Acceptance Criteria

- Version history accessible from: content edit page → "Lịch sử chỉnh sửa" tab/button. Also from admin content list → "Lịch sử" icon per row
- Version list: chronological (newest first), each entry shows: editor name + role badge (instructor/admin), action type ("Tạo mới" / "Chỉnh sửa" / "Xuất bản" / "Ẩn" / "Xóa"), timestamp (DD/MM/YYYY HH:mm), changes summary
- Changes diff stored as JSON delta: `{ field_name: { old: value, new: value } }` per changed field. Only changed fields stored (not full snapshot — saves storage)
- Click version → expand to show full diff view: side-by-side or inline diff for text fields (red = removed, green = added). For non-text fields (status, tags): simple old → new display
- Revert (admin only): "Khôi phục phiên bản này" button on any version → creates new version with content from selected version. Confirmation: "Khôi phục nội dung về phiên bản {date}? Sẽ tạo một phiên bản mới." Original creator notified
- Version retention: all versions retained indefinitely (audit compliance). No automatic cleanup
- Storage optimization: store diff only, not full snapshots. Reconstruct any version by applying diffs from creation forward
- Performance: version list paginated (20 per page). Loading a version's diff < 200ms
- Depends on: all content CRUD operations must call version service before persisting changes
