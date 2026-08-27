# US-CLASS-07 — Submit assignments for a lesson

| Field | Value |
|-------|-------|
| **Feature** | Lessons |
| **Domain** | Classroom |

> As a learner, I want to submit assignments for a lesson, so that my work is tracked under that lesson and my instructor can review it.

## Acceptance Criteria

- Lesson detail page: "Nộp bài" button visible for `reading_passage` and `writing_prompt` type lessons. Not shown for `text` and `video` types (view-only content)
- Reading lesson submission: click "Nộp bài" → navigates to reading test page (`/reading/{passageId}?lessonId={lessonId}&classroomId={classroomId}`). After grading, attempt linked to both lesson (via `lesson_id` FK) and reading history (via `reading_attempts` table)
- Writing lesson submission: click "Nộp bài" → navigates to writing editor (`/writing/{promptId}?lessonId={lessonId}&classroomId={classroomId}`). Submission follows classroom's `writing_mode` (instant or review_first). `lesson_id` and `classroom_id` set on the submission record
- Submission status shown on lesson card (learner view):
- Multiple submissions per lesson: allowed for reading (can retake), restricted for writing (one active submission per prompt per lesson; "Viết lại" creates revision linked to same lesson)
- Instructor views per-lesson submission list: table with Student Name, Submitted At, Score/Band, State. Clickable to review. Accessible from lesson edit page "Bài nộp ({count})" tab
- Lesson completion tracking: learner marked "completed" for a lesson when they have at least one submission (regardless of score). Completion % shown in progress overview (F-CLASS-07)
