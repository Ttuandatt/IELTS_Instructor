# 🗂️ Data Fields — IELTS Helper (MVP)

> **Mã tài liệu:** STEP2-DATA  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Framework:** Vibe Coding v2.0 — Step 2: Low-Code Prototype  
> **Full schema:** [08_data_requirements](../step3_prd/08_data_requirements.md)

---

## 1. Entity Overview

| Entity | Purpose | Key Fields | Relationships |
|--------|---------|-----------|---------------|
| users | User accounts & auth | email, password_hash, role | → submissions, content (created_by) |
| passages | Reading passages | title, body, level, status | → questions (1:N), → submissions_reading |
| questions | Questions per passage | type, prompt, options, answer_key | ← passages (N:1) |
| prompts | Writing prompts | task_type, title, prompt_text, level | → submissions_writing |
| submissions_reading | Reading attempt data | user_id, answers, score_pct | ← users, ← passages |
| submissions_writing | Writing attempt + scoring | content, scores, feedback, processing_status | ← users, ← prompts |
| source_documents | Uploaded docs | file_name, file_url, uploaded_by | → passages |
| import_jobs | Parsing job statuses | document_id, status | ← source_documents, ← users |
| collections | Content groupings | name, description | → passages, → prompts |
| topic_tags | Many-to-Many Tags | name | ↔ passages, ↔ prompts |

---

## 2. Field Details per Entity

### users

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | PK |
| email | string | Yes | — | Unique |
| password_hash | string | Yes | — | bcrypt, never exposed |
| role | enum | Yes | 'learner' | learner \| instructor \| admin |
| display_name | string | No | null | Max 50 chars |
| language | enum | Yes | 'vi' | vi \| en |
| theme | enum | Yes | 'light' | dark \| light |
| created_at | timestamp | Auto | now() | — |
| updated_at | timestamp | Auto | now() | — |

### passages

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | PK |
| title | string | Yes | — | Max 200 chars |
| body | text | Yes | — | Full passage text |
| level | enum | Yes | — | A2 \| B1 \| B2 \| C1 |
| collection_id | UUID | No | null | FK → collections |
| source_document_id | UUID | No | null | FK → source_documents |
| status | enum | Yes | 'draft' | draft \| published |
| created_by | UUID | Yes | — | FK → users |
| created_at | timestamp | Auto | now() | — |
| updated_at | timestamp | Auto | now() | — |

### questions

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | PK |
| passage_id | UUID | Yes | — | FK → passages (CASCADE) |
| type | enum | Yes | — | mcq \| short |
| prompt | string | Yes | — | Question text |
| options | JSON | MCQ only | null | ["A. ...", "B. ...", ...] |
| answer_key | JSON | Yes | — | "B" or ["keyword1", "keyword2"] |
| explanation | string | No | null | Shown after submit |
| order_index | int | Yes | 0 | Display order |

### prompts

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | UUID | Auto | gen_random_uuid() | PK |
| task_type | enum | Yes | — | '1' \| '2' |
| title | string | Yes | — | Max 200 |
| prompt_text | text | Yes | — | Full prompt instructions |
| level | enum | Yes | — | A2 \| B1 \| B2 \| C1 |
| collection_id | UUID | No | null | FK → collections |
| status | enum | Yes | 'draft' | draft \| published |
| min_words | int | Yes | 250 | Recommended minimum |
| created_by | UUID | Yes | — | FK → users |
| created_at | timestamp | Auto | now() | — |
| updated_at | timestamp | Auto | now() | — |

### submissions_reading

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | UUID | Auto | — | PK |
| user_id | UUID | Yes | — | FK → users |
| passage_id | UUID | Yes | — | FK → passages |
| answers | JSON | Yes | — | [{question_id, value}] |
| score_pct | decimal | Yes | — | 0–100 |
| correct_count | int | Yes | — | # correct |
| total_questions | int | Yes | — | # total |
| duration_sec | int | No | null | Time spent |
| timed_out | boolean | Yes | false | Timer expired |
| test_mode | enum | Yes | 'practice' | practice \| simulation |
| completed_at | timestamp | Auto | now() | — |

### submissions_writing

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | UUID | Auto | — | PK |
| user_id | UUID | Yes | — | FK → users |
| prompt_id | UUID | Yes | — | FK → prompts |
| content | text | Yes | — | Essay text |
| word_count | int | Yes | — | Server-calculated |
| scores | JSON | No | null | {TR, CC, LR, GRA, overall}; null when pending |
| feedback | JSON | No | null | {summary, strengths[], improvements[]} |
| model_tier | enum | Yes | 'cheap' | cheap \| premium |
| model_name | string | No | null | e.g., "gpt-4o-mini" |
| turnaround_ms | int | No | null | Processing duration |
| processing_status | enum | Yes | 'pending' | pending \| done \| failed |
| error_message | string | No | null | Error detail if failed |
| created_at | timestamp | Auto | now() | — |
| scored_at | timestamp | No | null | When scoring completed |
| instructor_comment | text | No | null | Instructor review comment |
| instructor_override_score | decimal | No | null | Instructor override (0–9) |
| reviewed_by | UUID | No | null | FK → users (instructor) |
| reviewed_at | timestamp | No | null | When instructor reviewed |

---

## 3. Enums Reference

| Name | Values | Used In |
|------|--------|---------|
| role | learner, instructor, admin | users |
| question_type | mcq, short, matching_headings, true_false_notgiven, yes_no_notgiven, matching_information, matching_features, matching_sentence_endings, sentence_completion, summary_completion, table_completion, flowchart_completion, diagram_label_completion | questions |
| task_type | 1, 2 | prompts |
| cefr_level | A2, B1, B2, C1 | passages, prompts |
| content_status | draft, published | passages, prompts |
| model_tier | cheap, premium | submissions_writing |
| processing_status | pending, done, failed | submissions_writing, import_jobs, source_documents |
| test_mode | practice, simulation | submissions_reading |
| language | vi, en | users |
| theme | dark, light | users |

---

> **Tham chiếu:** [08_data_requirements](../step3_prd/08_data_requirements.md) (full schema + migrations)
