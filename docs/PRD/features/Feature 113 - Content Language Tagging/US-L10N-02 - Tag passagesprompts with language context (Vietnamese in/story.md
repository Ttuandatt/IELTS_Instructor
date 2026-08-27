# US-L10N-02 — Tag passages/prompts with language context (Vietnamese in...

| Field | Value |
|-------|-------|
| **Feature** | Content Language Tagging |
| **Domain** | Localization |

> As an instructor, I want to tag passages/prompts with language context (Vietnamese instructions, English content), so that learners see appropriate UI language context.

## Acceptance Criteria

- Content metadata field: `instruction_language` on passages and prompts. Enum: `'vi'` (Vietnamese), `'en'` (English), `'bilingual'` (both). Default: `'en'` for new content
- Purpose: IELTS content is in English, but instructors (especially Vietnamese ones) often write instructions, group instructions, and hints in Vietnamese. This tag tells the frontend how to render instruction text
- Usage in reading test (F-READ-01):
- Writing prompts: same tagging. Prompt instructions may be in Vietnamese ("Viết bài luận 250 từ về…") with the actual topic in English. Tag helps rendering: Vietnamese instructions styled differently from English content (e.g., lighter font weight for instructions vs bold for topic)
- Editor UI (instructor): when creating/editing content:
- Search/filter integration (F-SEARCH-02): add `instruction_language` as a filter option. Instructors can filter: "Chỉ nội dung có hướng dẫn tiếng Việt" — useful for beginner learners who need Vietnamese instructions
- Migration: existing content defaults to `instruction_language = 'vi'` (current content has Vietnamese instructions hardcoded). Admin can bulk-update via content management
- Display logic: instruction_language affects only UI rendering (font, `lang` attribute, bilingual content selection). It does NOT change the passage/question content itself (always English for IELTS)
- Depends on: F-L10N-01 (user language preference determines which bilingual version to show), F-SEARCH-02 (filter integration)
