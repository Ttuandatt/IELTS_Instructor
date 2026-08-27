# US-LIST-03 — Upload audio files with corresponding questions

| Field | Value |
|-------|-------|
| **Feature** | Listening Content Upload |
| **Domain** | Listening |

> As an instructor, I want to upload audio files with corresponding questions, so that I can create listening exercises.

## Acceptance Criteria

- Upload page at `/instructor/listening/create`. Requires `role=instructor` or `role=admin`
- Audio upload:
- Content structure:
- Multi-section test creation: tabbed interface "Section 1" / "Section 2" / "Section 3" / "Section 4". Each tab: audio upload + question editor. Can create 1-section practice exercises (not full 4-section test)
- Transcript upload: optional per section. Textarea for manual entry OR upload as TXT/DOCX file. Transcript used for: answer-reveal feature (F-LIST-01), instructor reference
- Audio preview: instructor can play uploaded audio in the editor page before publishing. Same player as learner view
- Validation on publish: each section must have: audio file uploaded, at least 1 question with correct answer. Missing → "Section {n}: thiếu {audio/câu hỏi}"
- Listening test record: `{ id, instructor_id, title, description, total_sections, status, created_at, updated_at }`. Section record: `{ id, test_id, section_number, audio_file_path, transcript, section_type, duration_seconds }`. Questions: reuse `questions` table with `entity_type=listening_section`, `entity_id=section.id`
- Content management: same status (draft/published) workflow as passages. Admin can manage all listening content (F-ADMIN-02)
- Depends on: F-IMPORT-03 (question editor reused), F-ADMIN-02 (admin content management)
