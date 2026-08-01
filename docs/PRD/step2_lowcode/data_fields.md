# 📋 Data Fields — Langy (Pre-pilot MVP)

> **Mã tài liệu:** STEP2-FIELDS
> **Phiên bản:** 2.0 — Viết lại theo BA/PRD 07/2026 + M1 Schema Migration
> **Trạng thái:** Updated
> **Full detail:** [08_data_requirements](../step3_prd/08_data_requirements.md) (ERD Mermaid + migration spec)

---

## 1. Enums

| Enum | Values | Ghi chú |
|------|--------|---------|
| UserRole | learner, instructor, admin | — |
| CefrLevel | A2, B1, B2, C1 | — |
| ContentStatus | draft, published | Passage, Prompt, Topic |
| QuestionType | mcq, short, tfng, matching_headings, +9 loại khác | 13 loại tổng |
| TaskType | task1, task2 | Writing prompts |
| ModelTier | cheap, premium | LLM tier |
| ProcessingStatus | pending, done, failed | Legacy — worker AI |
| ClassroomStatus | active, archived | — |
| ClassroomRole | teacher, student | ClassroomMember |
| LessonContentType | text, video, passage, prompt | — |
| **SubmissionState** | draft, submitted, ai_scored, released_ai, pending_review, ai_failed, finalized | **M1 MỚI** |
| **WritingMode** | instant, review_first | **M1 MỚI** |

---

## 2. Models & Fields

### User

| Field | Type | Nullable | Default | M1? | Ghi chú |
|-------|------|----------|---------|-----|---------|
| id | UUID | — | auto | — | PK |
| email | String | — | — | — | Unique |
| password_hash | String | — | — | — | bcrypt |
| display_name | String | — | — | — | |
| role | UserRole | — | learner | — | |
| language | String | — | "vi" | — | |
| theme | String | — | "light" | — | |
| created_at | DateTime | — | now() | — | UTC |
| updated_at | DateTime | — | @updatedAt | — | |

### Classroom

| Field | Type | Nullable | Default | M1? | Ghi chú |
|-------|------|----------|---------|-----|---------|
| id | UUID | — | auto | — | PK |
| name | String | — | — | — | |
| description | String | ✅ | — | — | |
| invite_code | String | — | — | — | Unique, 6 chars |
| owner_id | UUID | — | — | — | FK → User |
| status | ClassroomStatus | — | active | — | |
| **writing_mode** | **WritingMode** | — | **instant** | **✅ MỚI** | Chế độ A/B (D5) |
| max_members | Int | — | 50 | — | |
| created_at | DateTime | — | now() | — | |
| updated_at | DateTime | — | @updatedAt | — | |

### ClassroomMember

| Field | Type | Nullable | Default | M1? |
|-------|------|----------|---------|-----|
| id | UUID | — | auto | — |
| classroom_id | UUID | — | — | — |
| user_id | UUID | — | — | — |
| role | ClassroomRole | — | — | — |
| joined_at | DateTime | — | now() | — |

### Topic

| Field | Type | Nullable | Default | M1? |
|-------|------|----------|---------|-----|
| id | UUID | — | auto | — |
| classroom_id | UUID | — | — | — |
| title | String | — | — | — |
| description | String | ✅ | — | — |
| order_index | Int | — | — | — |
| status | ContentStatus | — | draft | — |
| created_at | DateTime | — | now() | — |

### Lesson

| Field | Type | Nullable | Default | M1? | Ghi chú |
|-------|------|----------|---------|-----|---------|
| id | UUID | — | auto | — | |
| topic_id | UUID | — | — | — | |
| title | String | — | — | — | |
| content | String | ✅ | — | — | |
| content_type | LessonContentType | — | — | — | text/video/passage/prompt |
| linked_entity_id | UUID | ✅ | — | — | FK → Passage or Prompt |
| attachment_url | String | ✅ | — | — | |
| order_index | Int | — | — | — | |
| allow_submit | Boolean | — | true | — | |
| allow_checkscore | Boolean | — | true | — | |
| **due_at** | **DateTime** | **✅** | **null** | **✅ MỚI** | Deadline giao bài |
| created_at | DateTime | — | now() | — | |

### Passage

| Field | Type | Nullable | Default | M1? |
|-------|------|----------|---------|-----|
| id | UUID | — | auto | — |
| title | String | — | — | — |
| body | Text | — | — | — |
| level | CefrLevel | — | — | — |
| collection_id | UUID | ✅ | — | — |
| source_document_id | UUID | ✅ | — | — |
| status | ContentStatus | — | draft | — |
| created_by | UUID | — | — | — |
| created_at | DateTime | — | now() | — |
| updated_at | DateTime | — | @updatedAt | — |

### Question

| Field | Type | Nullable | Default | M1? |
|-------|------|----------|---------|-----|
| id | UUID | — | auto | — |
| passage_id | UUID | — | — | — |
| type | QuestionType | — | — | — |
| prompt | Text | — | — | — |
| options | Json | ✅ | — | — |
| answer_key | Json | — | — | — |
| explanation | Text | ✅ | — | — |
| order_index | Int | — | — | — |

### Prompt

| Field | Type | Nullable | Default | M1? |
|-------|------|----------|---------|-----|
| id | UUID | — | auto | — |
| task_type | TaskType | — | — | — |
| title | String | — | — | — |
| prompt_text | Text | — | — | — |
| level | CefrLevel | — | — | — |
| collection_id | UUID | ✅ | — | — |
| status | ContentStatus | — | draft | — |
| min_words | Int | — | 250 | — |
| created_by | UUID | — | — | — |
| created_at | DateTime | — | now() | — |
| updated_at | DateTime | — | @updatedAt | — |

### ReadingSubmission

| Field | Type | Nullable | Default | M1? |
|-------|------|----------|---------|-----|
| id | UUID | — | auto | — |
| user_id | UUID | — | — | — |
| passage_id | UUID | — | — | — |
| answers | Json | — | — | — |
| score_pct | Float | — | — | — |
| correct_count | Int | — | — | — |
| total_questions | Int | — | — | — |
| duration_sec | Int | ✅ | — | — |
| timed_out | Boolean | — | false | — |
| test_mode | String | — | "practice" | — |
| completed_at | DateTime | — | now() | — |

### WritingSubmission ⭐ (nhiều thay đổi M1)

| Field | Type | Nullable | Default | M1? | Ghi chú |
|-------|------|----------|---------|-----|---------|
| id | UUID | — | auto | — | |
| user_id | UUID | — | — | — | |
| prompt_id | UUID | — | — | — | |
| **lesson_id** | **UUID** | **✅** | **null** | **✅ MỚI** | null = tự học |
| content | Text | — | — | — | Essay |
| word_count | Int | — | — | — | |
| scores | Json | ✅ | — | — | {TR, CC, LR, GRA, overall} |
| feedback | Json | ✅ | — | — | {summary, strengths, improvements} |
| model_tier | ModelTier | — | cheap | — | |
| model_name | String | ✅ | — | — | |
| **prompt_version** | **String** | — | **"v1"** | **✅ MỚI** | Calibration versioning |
| **tokens_input** | **Int** | **✅** | **null** | **✅ MỚI** | Cost tracking |
| **tokens_output** | **Int** | **✅** | **null** | **✅ MỚI** | Cost tracking |
| turnaround_ms | Int | ✅ | — | — | |
| processing_status | ProcessingStatus | — | pending | — | Legacy |
| **state** | **SubmissionState** | — | **submitted** | **✅ MỚI** | State machine chính |
| error_message | String | ✅ | — | — | |
| created_at | DateTime | — | now() | — | |
| **updated_at** | **DateTime** | — | **@updatedAt** | **✅ MỚI** | Auto-save draft |
| scored_at | DateTime | ✅ | — | — | |
| instructor_override_score | Float | ✅ | — | — | **DEPRECATED** → dùng instructor_scores |
| **instructor_scores** | **Json** | **✅** | **null** | **✅ MỚI** | {TR, CC, LR, GRA, overall} |
| instructor_comment | Text | ✅ | — | — | |
| reviewed_by | UUID | ✅ | — | — | FK → User |
| reviewed_at | DateTime | ✅ | — | — | |

**Indexes M1 mới:**
- `[lesson_id, state]` — review queue GV
- `[user_id, state]` — danh sách bài HS

### SourceDocument, ImportJob, Collection, Notification, TopicTag, ContentVersion, LessonSubmission, Announcement
→ Không thay đổi trong M1. Xem [08_data_requirements](../step3_prd/08_data_requirements.md) cho chi tiết đầy đủ.

---

## 3. Tóm tắt thay đổi M1

| Thay đổi | Model | Cột/Enum |
|----------|-------|----------|
| 2 enum mới | — | SubmissionState (7 values), WritingMode (2 values) |
| 1 cột mới | Classroom | writing_mode |
| 1 cột mới | Lesson | due_at |
| 6 cột mới | WritingSubmission | state, lesson_id, instructor_scores, prompt_version, tokens_input, tokens_output, updated_at |
| 2 index mới | WritingSubmission | [lesson_id, state], [user_id, state] |
| 1 deprecation | WritingSubmission | instructor_override_score → instructor_scores.overall |
