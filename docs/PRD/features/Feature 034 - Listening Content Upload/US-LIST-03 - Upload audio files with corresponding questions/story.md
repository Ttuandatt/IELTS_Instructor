# US-LIST-03 — Upload audio files with corresponding questions

| Field | Value |
|-------|-------|
| **Feature** | Listening Content Upload |
| **Domain** | Listening |

> As an instructor, I want to upload audio files with corresponding questions, so that I can create listening exercises.

## Acceptance Criteria

- AC1: Upload page at `/instructor/listening/create`. Requires `role=instructor` or `role=admin`
- AC2: Audio upload:
- AC3: Content structure:
- AC4: Multi-section test creation: tabbed interface "Section 1" / "Section 2" / "Section 3" / "Section 4". Each tab: audio upload + question editor. Can create 1-section practice exercises (not full 4-section test)
- AC5: Transcript upload: optional per section. Textarea for manual entry OR upload as TXT/DOCX file. Transcript used for: answer-reveal feature (F-LIST-01), instructor reference
- AC6: Audio preview: instructor can play uploaded audio in the editor page before publishing. Same player as learner view
- AC7: Validation on publish: each section must have: audio file uploaded, at least 1 question with correct answer. Missing → "Section {n}: thiếu {audio/câu hỏi}"
- AC8: Listening test record: `{ id, instructor_id, title, description, total_sections, status, created_at, updated_at }`. Section record: `{ id, test_id, section_number, audio_file_path, transcript, section_type, duration_seconds }`. Questions: reuse `questions` table with `entity_type=listening_section`, `entity_id=section.id`
- AC9: Content management: same status (draft/published) workflow as passages. Admin can manage all listening content (F-ADMIN-02)
- AC10: Depends on: F-IMPORT-03 (question editor reused), F-ADMIN-02 (admin content management)
