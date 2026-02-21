# 🗃️ Data Requirements — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-08  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [05_functional_requirements](05_functional_requirements.md) | [09_api_specifications](09_api_specifications.md)

---

## 1. ERD Overview (ASCII)

```
┌──────────┐       ┌────────────┐       ┌────────────────────┐
│  users   │       │  passages  │       │ submissions_reading │
│──────────│       │────────────│       │────────────────────│
│ id (PK)  │◄──┐   │ id (PK)    │◄──┐   │ id (PK)            │
│ email    │   │   │ title      │   │   │ user_id (FK)───────┤►users.id
│ password │   │   │ body       │   │   │ passage_id (FK)────┤►passages.id
│ role     │   │   │ level      │   │   │ answers (JSONB)    │
│ ...      │   │   │ topic_tags │   │   │ score_pct          │
└──────────┘   │   │ source_ids │   │   │ duration_sec       │
               │   │ status     │   │   │ timed_out          │
               │   └────────────┘   │   │ completed_at       │
               │         │          │   └────────────────────┘
               │         │ 1:N      │
               │         ▼          │
               │   ┌────────────┐   │
               │   │ questions  │   │
               │   │────────────│   │
               │   │ id (PK)    │   │
               │   │ passage_id │───┘
               │   │ type       │
               │   │ prompt     │
               │   │ options    │
               │   │ answer_key │
               │   │ explanation│
               │   └────────────┘
               │
               │   ┌────────────┐       ┌────────────────────┐
               │   │  prompts   │       │ submissions_writing │
               │   │────────────│       │────────────────────│
               │   │ id (PK)    │◄──┐   │ id (PK)            │
               │   │ task_type  │   │   │ user_id (FK)───────┤►users.id
               │   │ title      │   │   │ prompt_id (FK)─────┤►prompts.id
               │   │ prompt_text│   │   │ content            │
               │   │ level      │   │   │ word_count         │
               │   │ topic_tags │   │   │ scores (JSONB)     │
               │   │ source_ids │   │   │ feedback (JSONB)   │
               │   │ status     │   │   │ model_tier         │
               │   └────────────┘   │   │ model_name         │
               │                    │   │ turnaround_ms      │
               │                    │   │ processing_status  │
               │                    │   │ error_message      │
               │                    │   │ created_at         │
               │                    │   └────────────────────┘
               │
               │   ┌────────────┐       ┌────────────┐
               │   │  sources   │       │  snippets  │
               │   │────────────│       │────────────│
               │   │ id (PK)    │◄──────│ source_id  │
               │   │ title      │       │ id (PK)    │
               │   │ url        │       │ text       │
               │   │ origin     │       │ tags       │
               │   │ metadata   │       │ level      │
               │   │ imported_by│───────┤►users.id   │
               │   │ imported_at│       │ linked_entity│
               │   └────────────┘       │ linked_type │
               │                        └────────────┘
               │
               │   ┌──────────────────┐  ┌────────────┐
               │   │ content_versions │  │ rate_limits │
               │   │──────────────────│  │────────────│
               │   │ id (PK)          │  │ id (PK)    │
               │   │ entity_id        │  │ user_id    │
               │   │ entity_type      │  │ action     │
               │   │ version          │  │ count      │
               │   │ editor_id (FK)───┤  │ window_start│
               │   │ updated_at       │  └────────────┘
               │   │ diff_summary     │
               │   └──────────────────┘
```

---

## 2. Entity Definitions

### 2.1 users

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Primary key |
| `email` | TEXT | UNIQUE, NOT NULL | Login identifier |
| `password_hash` | TEXT | NOT NULL | bcrypt hashed password |
| `role` | TEXT | NOT NULL, CHECK (role IN ('learner','instructor','admin')) | User role |
| `display_name` | TEXT | NULL, max 50 chars | Display name |
| `language` | TEXT | NOT NULL, DEFAULT 'vi', CHECK (language IN ('vi','en')) | UI language |
| `theme` | TEXT | NOT NULL, DEFAULT 'light', CHECK (theme IN ('dark','light')) | UI theme |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Account creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last profile update |

**Indexes:**
- `UNIQUE INDEX idx_users_email ON users(email)`
- `INDEX idx_users_role ON users(role)`

**Business Rules:**
- Default role = 'learner' on self-registration (BR-101)
- Email must be unique system-wide (BR-103)

**Notes:**
- No soft-delete in MVP; consider `deleted_at` for Phase 2.
- `password_hash` NEVER included in API responses.

---

### 2.2 passages

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `title` | TEXT | NOT NULL, max 200 chars | Passage title |
| `body` | TEXT | NOT NULL | Full passage text |
| `level` | TEXT | NOT NULL, CHECK (level IN ('A2','B1','B2','C1')) | CEFR level |
| `topic_tags` | TEXT[] | DEFAULT '{}' | Array of topic tags |
| `source_ids` | UUID[] | DEFAULT '{}' | References to sources table |
| `status` | TEXT | NOT NULL, DEFAULT 'draft', CHECK (status IN ('draft','published')) | Publication status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | — |
| `created_by` | UUID | FK → users.id, NOT NULL | Admin who created |

**Indexes:**
- `INDEX idx_passages_level ON passages(level)`
- `INDEX idx_passages_status ON passages(status)`
- `GIN INDEX idx_passages_tags ON passages USING GIN(topic_tags)`
- `INDEX idx_passages_created ON passages(created_at DESC)`

**Business Rules:**
- Only status='published' visible to learners (ADM-001)
- Must have ≥1 source when imported from NotebookLM (ADM-002)

---

### 2.3 questions

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `passage_id` | UUID | FK → passages.id, NOT NULL, ON DELETE CASCADE | Parent passage |
| `type` | TEXT | NOT NULL, CHECK (type IN ('mcq','short')) | Question type |
| `prompt` | TEXT | NOT NULL | Question text |
| `options` | JSONB | NULL | MCQ options: `["A. ...", "B. ...", "C. ...", "D. ..."]` |
| `answer_key` | JSONB | NOT NULL | MCQ: `"B"` / Short: `["keyword1", "keyword2"]` |
| `explanation` | TEXT | NULL | Explanation shown after submit |
| `order_index` | INT | NOT NULL, DEFAULT 0 | Display order |

**Indexes:**
- `INDEX idx_questions_passage ON questions(passage_id)`
- `INDEX idx_questions_order ON questions(passage_id, order_index)`

**Notes:**
- `options` is NULL for short answer questions.
- `answer_key` is JSONB to support both string (MCQ) and array (short answer) formats.
- CASCADE delete ensures questions are removed when passage is deleted.

---

### 2.4 submissions_reading

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `user_id` | UUID | FK → users.id, NOT NULL | Learner who submitted |
| `passage_id` | UUID | FK → passages.id, NOT NULL | Passage attempted |
| `answers` | JSONB | NOT NULL | `[{question_id, value}]` |
| `score_pct` | NUMERIC(5,2) | NOT NULL | Score percentage 0–100 |
| `correct_count` | INT | NOT NULL | Number of correct answers |
| `total_questions` | INT | NOT NULL | Total questions in passage |
| `duration_sec` | INT | NULL | Time spent in seconds |
| `timed_out` | BOOLEAN | NOT NULL, DEFAULT false | Timer expired flag |
| `completed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Submission time |

**Indexes:**
- `INDEX idx_sub_reading_user ON submissions_reading(user_id, completed_at DESC)`
- `INDEX idx_sub_reading_passage ON submissions_reading(passage_id)`

**JSONB Shape — answers:**
```json
[
  {"question_id": "uuid-1", "value": "B"},
  {"question_id": "uuid-2", "value": "carbon dioxide"}
]
```

---

### 2.5 prompts

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `task_type` | TEXT | NOT NULL, CHECK (task_type IN ('1','2')) | IELTS Task 1 or 2 |
| `title` | TEXT | NOT NULL, max 200 chars | Prompt title |
| `prompt_text` | TEXT | NOT NULL | Full prompt instructions |
| `level` | TEXT | NOT NULL, CHECK (level IN ('A2','B1','B2','C1')) | — |
| `topic_tags` | TEXT[] | DEFAULT '{}' | — |
| `source_ids` | UUID[] | DEFAULT '{}' | — |
| `status` | TEXT | NOT NULL, DEFAULT 'draft' | draft \| published |
| `min_words` | INT | NOT NULL, DEFAULT 250 | Recommended minimum word count |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | — |
| `created_by` | UUID | FK → users.id, NOT NULL | — |

**Indexes:**
- `INDEX idx_prompts_task_type ON prompts(task_type)`
- `INDEX idx_prompts_level ON prompts(level)`
- `INDEX idx_prompts_status ON prompts(status)`

---

### 2.6 submissions_writing

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `user_id` | UUID | FK → users.id, NOT NULL | — |
| `prompt_id` | UUID | FK → prompts.id, NOT NULL | — |
| `content` | TEXT | NOT NULL | Essay text |
| `word_count` | INT | NOT NULL | Auto-calculated |
| `scores` | JSONB | NULL | `{TR, CC, LR, GRA, overall}` — NULL when pending |
| `feedback` | JSONB | NULL | `{summary, strengths[], improvements[]}` |
| `model_tier` | TEXT | NOT NULL, DEFAULT 'cheap' | cheap \| premium |
| `model_name` | TEXT | NULL | e.g., "gpt-4o-mini", "gemini-flash" |
| `turnaround_ms` | INT | NULL | Processing duration in ms |
| `processing_status` | TEXT | NOT NULL, DEFAULT 'pending' | pending \| done \| failed |
| `error_message` | TEXT | NULL | Error details if failed |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | — |
| `scored_at` | TIMESTAMPTZ | NULL | When scoring completed |

**Indexes:**
- `INDEX idx_sub_writing_user ON submissions_writing(user_id, created_at DESC)`
- `INDEX idx_sub_writing_prompt ON submissions_writing(prompt_id)`
- `INDEX idx_sub_writing_status ON submissions_writing(processing_status)`

**JSONB Shape — scores:**
```json
{
  "TR": 6.0,
  "CC": 5.5,
  "LR": 6.0,
  "GRA": 5.5,
  "overall": 5.75
}
```

**JSONB Shape — feedback:**
```json
{
  "summary": "Your essay addresses the topic clearly...",
  "strengths": [
    "Clear thesis statement in introduction",
    "Good use of linking words (however, moreover)"
  ],
  "improvements": [
    "Add more specific examples to support body paragraph 2",
    "Vary sentence structure — too many simple sentences",
    "Check subject-verb agreement in paragraph 3"
  ]
}
```

---

### 2.7 sources

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `title` | TEXT | NOT NULL | Source title |
| `url` | TEXT | NOT NULL | Original URL (NotebookLM) |
| `origin` | TEXT | NOT NULL, DEFAULT 'notebooklm' | Source origin type |
| `metadata` | JSONB | DEFAULT '{}' | Additional metadata |
| `imported_by` | UUID | FK → users.id, NOT NULL | Admin who imported |
| `imported_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | — |

**Indexes:**
- `INDEX idx_sources_origin ON sources(origin)`
- `INDEX idx_sources_imported ON sources(imported_at DESC)`

---

### 2.8 snippets

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `source_id` | UUID | FK → sources.id, NOT NULL, ON DELETE CASCADE | Parent source |
| `text` | TEXT | NOT NULL | Snippet plain text |
| `tags` | TEXT[] | DEFAULT '{}' | — |
| `level` | TEXT | NULL | A2/B1/B2/C1 if applicable |
| `linked_entity` | UUID | NULL | FK to passage or prompt |
| `linked_type` | TEXT | NULL, CHECK (linked_type IN ('passage','prompt')) | Entity type |

**Indexes:**
- `INDEX idx_snippets_source ON snippets(source_id)`
- `INDEX idx_snippets_linked ON snippets(linked_entity, linked_type)`

---

### 2.9 content_versions

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `entity_id` | UUID | NOT NULL | ID of passage or prompt |
| `entity_type` | TEXT | NOT NULL, CHECK (entity_type IN ('passage','prompt','question')) | — |
| `version` | INT | NOT NULL | Incrementing version number |
| `editor_id` | UUID | FK → users.id, NOT NULL | Admin who edited |
| `action` | TEXT | NOT NULL | 'create' \| 'update' \| 'publish' \| 'unpublish' \| 'delete' |
| `diff_summary` | TEXT | NULL | Human-readable change summary |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | — |

**Indexes:**
- `INDEX idx_cv_entity ON content_versions(entity_id, entity_type, version DESC)`

---

### 2.10 rate_limits

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | — |
| `user_id` | UUID | FK → users.id, NOT NULL | — |
| `action` | TEXT | NOT NULL | e.g., 'writing_submit' |
| `count` | INT | NOT NULL, DEFAULT 0 | Current count in window |
| `window_start` | TIMESTAMPTZ | NOT NULL | Start of rate-limit window |

**Indexes:**
- `UNIQUE INDEX idx_rl_user_action ON rate_limits(user_id, action, window_start)`

**Notes:**
- Alternatively, use Redis for rate limiting (sliding window approach). This table serves as fallback/audit.
- Primary rate-limiting implementation should be Redis-based for performance.

---

## 3. Enums & Types

| Enum Name | Values | Used In |
|-----------|--------|---------|
| `role` | `learner`, `instructor`, `admin` | users.role |
| `question_type` | `mcq`, `short` | questions.type |
| `task_type` | `1`, `2` | prompts.task_type |
| `cefr_level` | `A2`, `B1`, `B2`, `C1` | passages.level, prompts.level |
| `content_status` | `draft`, `published` | passages.status, prompts.status |
| `model_tier` | `cheap`, `premium` | submissions_writing.model_tier |
| `processing_status` | `pending`, `done`, `failed` | submissions_writing.processing_status |
| `language` | `vi`, `en` | users.language |
| `theme` | `dark`, `light` | users.theme |
| `source_origin` | `notebooklm`, `manual` | sources.origin |
| `linked_type` | `passage`, `prompt` | snippets.linked_type |
| `version_action` | `create`, `update`, `publish`, `unpublish`, `delete` | content_versions.action |

---

## 4. Migration Plan

### Migration 1: Core tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner','instructor','admin')),
  display_name TEXT,
  language TEXT NOT NULL DEFAULT 'vi' CHECK (language IN ('vi','en')),
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('dark','light')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role);
```

### Migration 2: Content tables

```sql
-- Passages
CREATE TABLE passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A2','B1','B2','C1')),
  topic_tags TEXT[] DEFAULT '{}',
  source_ids UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_passages_level ON passages(level);
CREATE INDEX idx_passages_status ON passages(status);
CREATE INDEX idx_passages_tags ON passages USING GIN(topic_tags);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id UUID NOT NULL REFERENCES passages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mcq','short')),
  prompt TEXT NOT NULL,
  options JSONB,
  answer_key JSONB NOT NULL,
  explanation TEXT,
  order_index INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_questions_passage ON questions(passage_id);

-- Prompts
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL CHECK (task_type IN ('1','2')),
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A2','B1','B2','C1')),
  topic_tags TEXT[] DEFAULT '{}',
  source_ids UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  min_words INT NOT NULL DEFAULT 250,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prompts_task_type ON prompts(task_type);
CREATE INDEX idx_prompts_status ON prompts(status);
```

### Migration 3: Sources & Snippets

```sql
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT 'notebooklm',
  metadata JSONB DEFAULT '{}',
  imported_by UUID NOT NULL REFERENCES users(id),
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  level TEXT,
  linked_entity UUID,
  linked_type TEXT CHECK (linked_type IN ('passage','prompt'))
);
CREATE INDEX idx_snippets_source ON snippets(source_id);
CREATE INDEX idx_snippets_linked ON snippets(linked_entity, linked_type);
```

### Migration 4: Submissions

```sql
CREATE TABLE submissions_reading (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  passage_id UUID NOT NULL REFERENCES passages(id),
  answers JSONB NOT NULL,
  score_pct NUMERIC(5,2) NOT NULL,
  correct_count INT NOT NULL,
  total_questions INT NOT NULL,
  duration_sec INT,
  timed_out BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sub_reading_user ON submissions_reading(user_id, completed_at DESC);

CREATE TABLE submissions_writing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  prompt_id UUID NOT NULL REFERENCES prompts(id),
  content TEXT NOT NULL,
  word_count INT NOT NULL,
  scores JSONB,
  feedback JSONB,
  model_tier TEXT NOT NULL DEFAULT 'cheap' CHECK (model_tier IN ('cheap','premium')),
  model_name TEXT,
  turnaround_ms INT,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending','done','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scored_at TIMESTAMPTZ
);
CREATE INDEX idx_sub_writing_user ON submissions_writing(user_id, created_at DESC);
CREATE INDEX idx_sub_writing_status ON submissions_writing(processing_status);
```

### Migration 5: Audit & Rate Limits

```sql
CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('passage','prompt','question')),
  version INT NOT NULL,
  editor_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  diff_summary TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cv_entity ON content_versions(entity_id, entity_type, version DESC);

CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, action, window_start)
);
```

### Seed Data

```sql
-- Admin user (password from env: ADMIN_PASSWORD)
INSERT INTO users (email, password_hash, role, display_name)
VALUES ('admin@ieltshelper.local', '$2b$10$...', 'admin', 'System Admin');

-- Sample passage
INSERT INTO passages (title, body, level, topic_tags, status, created_by)
VALUES (
  'The Rise of Renewable Energy',
  'Renewable energy sources have been growing...',
  'B2',
  ARRAY['energy', 'environment', 'science'],
  'published',
  (SELECT id FROM users WHERE email = 'admin@ieltshelper.local')
);

-- Sample questions for the passage
-- ... (see seed script)

-- Sample writing prompt
INSERT INTO prompts (task_type, title, prompt_text, level, topic_tags, status, min_words, created_by)
VALUES (
  '2',
  'Advantages of Renewable Energy',
  'Some people believe that governments should invest more in renewable energy sources. To what extent do you agree or disagree?',
  'B2',
  ARRAY['energy', 'opinion'],
  'published',
  250,
  (SELECT id FROM users WHERE email = 'admin@ieltshelper.local')
);
```

---

## 5. Data Retention & Cleanup

| Entity | Retention | Cleanup Strategy |
|--------|-----------|-----------------|
| Users | Indefinite | Manual admin delete |
| Submissions (reading) | 12 months | Archive to cold storage (Phase 2) |
| Submissions (writing) | 12 months | Archive to cold storage (Phase 2) |
| Content versions | Indefinite | Keep for audit trail |
| Rate limits | 30 days | Cron job cleanup old windows |
| Redis cache | TTL-based | Auto-expire (15–60 min) |
| BullMQ jobs | 7 days (completed) | Auto-cleanup via BullMQ config |

---

> **Tham chiếu:** [05_functional_requirements](05_functional_requirements.md) | [09_api_specifications](09_api_specifications.md) | [openapi.yaml](openapi.yaml)
