# US-IMPORT-06 — As an instructor, I want AI to generate additional questions

| Field | Value |
|-------|-------|
| **Feature** | AI-Generated Question Variations |
| **Domain** | Content Import & Parsing |

> As an instructor, I want AI to generate additional questions from an existing passage, so that I can create more practice material without manual effort.

## Acceptance Criteria

- Entry point: "Tạo thêm câu hỏi" button on passage detail/edit page (instructor view). Only available for passages with existing content (not empty)
- Configuration modal:
- Generation: sends passage text + existing questions + configuration to Gemini API. Prompt instructs: generate new questions that don't overlap with existing ones, match the specified difficulty, follow IELTS conventions
- Response validation: same structured output schema as import parsing. Validated before showing preview
- Preview: generated questions shown in editable preview (same as import preview). Each question marked with "AI ✨" badge. Instructor can:
- Questions are NOT auto-added — instructor must review and approve each one. No "add all without review" option
- Cost: generation uses Gemini tokens, logged in scoring_logs (same as scoring). Counts toward instructor's awareness but NOT rate-limited (instructors are exempt from daily limits)
- Edge case: passage text too short (< 100 words) for meaningful question generation → "Bài đọc quá ngắn để tạo câu hỏi tự động. Cần ít nhất 100 từ"
- Max generation: 20 questions per request. If instructor requests > 20 total → "Tối đa 20 câu hỏi mỗi lần tạo"
- Depends on: F-READ-05 (passage must exist), F-READ-04 (question type system)
