# US-READ-10 — Practice specific question types (e.g., only T/F/NG, only...

| Field | Value |
|-------|-------|
| **Feature** | Question-Type Targeted Practice |
| **Domain** | Reading |

> As a learner, I want to practice specific question types (e.g., only T/F/NG, only matching headings), so that I can drill my weakest areas based on my analytics data.

## Acceptance Criteria

- UI: multi-select question type filter on `/reading` browse page (part of F-READ-08 filter system). Options show all 13 types with Vietnamese labels and question count in parentheses: "Đúng/Sai/Không có (42 câu)"
- When type filter active: browse page shows only passages containing at least one question of the selected type(s)
- On entering a filtered passage: only questions matching the selected type(s) are displayed; other questions hidden. Question numbering renumbered sequentially (1, 2, 3…) for the visible subset
- Score calculated only for the visible (filtered) questions. Score banner: "{correct}/{visible_total} câu đúng ({percentage}%) — {type_name}"
- Attempt saved with `target_question_types` field (array of type IDs) to differentiate from full-passage attempts
- Per-type accuracy tracked: `question_type_stats` table aggregates `{ user_id, question_type, total_attempted, total_correct, last_attempted_at }`. Updated after each submission
- Dashboard widget (see F-DASH-05): links to targeted practice for each question type. Clicking a low-accuracy type pre-selects that filter on the browse page
- Edge case: passage has only 1 question of selected type → still shown but with note "Bài đọc này chỉ có 1 câu hỏi {type_name}"
- Edge case: passage has 0 questions after filter → passage not shown in results (filtered server-side)
- Depends on: F-READ-08 (filter infrastructure), F-DASH-05 (accuracy display)
