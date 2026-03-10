# 🔌 API Specifications — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-09  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [05_functional_requirements](05_functional_requirements.md) | [openapi.yaml](openapi.yaml)

---

## 1. API Design Principles

| Principle | Description |
|-----------|-------------|
| RESTful | Resource-oriented URLs, standard HTTP methods |
| JSON | All request/response bodies in JSON |
| Authentication | Bearer JWT token in Authorization header |
| Versioning | URL prefix `/api/v1/` (optional for MVP; `/api/` acceptable) |
| Error format | Consistent `{statusCode, message, error?, details?}` |
| Pagination | Offset-based: `?page=1&limit=10` → response `{data[], meta: {page, limit, total, totalPages}}` |
| Rate limiting | Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |

---

## 2. Base URL

```
Development: http://localhost:3001/api
Dev Tunnel:  https://<tunnel-id>.devtunnels.ms/api
```

---

## 3. Common Response Formats

### Success Response
```json
{
  "statusCode": 200,
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    { "field": "email", "message": "Must be a valid email address" }
  ]
}
```

---

## 4. Authentication Endpoints

### POST /auth/register

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-101 |
| **Auth** | None (public) |
| **Rate Limit** | 3/15 min per IP |

**Request Body:**
```json
{
  "email": "minh@example.com",
  "password": "P@ssw0rd!",
  "display_name": "Minh Nguyen",
  "language": "vi",
  "theme": "light"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "dGhpcyBpcyBhIHJl...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "minh@example.com",
      "role": "learner",
      "display_name": "Minh Nguyen",
      "language": "vi",
      "theme": "light"
    }
  }
}
```

**Errors:** 400 (validation), 409 (duplicate email)

---

### POST /auth/login

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-102 |
| **Auth** | None (public) |
| **Rate Limit** | 5/15 min per IP |

**Request Body:**
```json
{
  "email": "minh@example.com",
  "password": "P@ssw0rd!"
}
```

**Response (200):** Same structure as register response.

**Errors:** 401 (invalid credentials)

---

### POST /auth/refresh

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-103 |
| **Auth** | Refresh token in body or httpOnly cookie |

**Request Body:**
```json
{
  "refresh_token": "dGhpcyBpcyBhIHJl..."
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "access_token": "eyJhbG...(new)",
    "refresh_token": "bmV3IHJlZnJlc2g...(rotated)"
  }
}
```

**Errors:** 401 (invalid/expired refresh token)

---

### GET /me

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-104 |
| **Auth** | Bearer JWT |

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "550e8400-...",
    "email": "minh@example.com",
    "role": "learner",
    "display_name": "Minh Nguyen",
    "language": "vi",
    "theme": "light",
    "created_at": "2025-02-21T10:00:00Z"
  }
}
```

---

### PATCH /me

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-104 |
| **Auth** | Bearer JWT |

**Request Body (partial):**
```json
{
  "display_name": "Minh N.",
  "language": "en",
  "theme": "dark"
}
```

**Response (200):** Updated user object.

---

## 5. Reading Endpoints

### GET /reading/passages

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-201 |
| **Auth** | Bearer JWT (any role) |

**Query Params:**

| Param | Type | Default | Example |
|-------|------|---------|---------|
| level | string | — | `?level=B2` |
| topic | string | — | `?topic=environment` |
| page | number | 1 | `?page=2` |
| limit | number | 10 | `?limit=20` |

**Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "pass-001",
      "title": "The Rise of Renewable Energy",
      "level": "B2",
      "topic_tags": ["energy", "environment"],
      "question_count": 13,
      "source_refs": [{"source_id": "src-001", "title": "NotebookLM Climate"}],
      "created_at": "2025-02-20T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

---

### GET /reading/passages/:id

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-202 |
| **Auth** | Bearer JWT (any role) |

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "pass-001",
    "title": "The Rise of Renewable Energy",
    "body": "Renewable energy sources have been growing rapidly...",
    "level": "B2",
    "topic_tags": ["energy", "environment"],
    "questions": [
      {
        "id": "q-001",
        "type": "mcq",
        "prompt": "What is the main idea of paragraph 1?",
        "options": ["A. Solar is cheap", "B. Renewables are growing", "C. Oil is declining", "D. Nuclear is safe"],
        "order_index": 0
      },
      {
        "id": "q-002",
        "type": "short",
        "prompt": "What gas is reduced by using solar panels?",
        "options": null,
        "order_index": 1
      }
    ],
    "question_count": 13,
    "source_refs": [{"source_id": "src-001", "title": "NotebookLM Climate"}]
  }
}
```

**Note:** `answer_key` and `explanation` are **NOT included** in this response.

**Errors:** 404 (not found / unpublished)

---

### POST /reading/passages/:id/submit

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-203 |
| **Auth** | Bearer JWT (learner only) |

**Request Body:**
```json
{
  "answers": [
    { "question_id": "q-001", "value": "B" },
    { "question_id": "q-002", "value": "carbon dioxide" }
  ],
  "timed_out": false,
  "duration_sec": 1080,
  "test_mode": "practice"
}
```

**Validation:**
- Check ≥80% questions answered (RD-001). Formula: `answers.length / total_questions >= 0.8`
- If below threshold → 400 error.

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "submission_id": "sub-r-001",
    "score_pct": 76.92,
    "correct_count": 10,
    "total_questions": 13,
    "timed_out": false,
    "duration_sec": 1080,
    "details": [
      {
        "question_id": "q-001",
        "correct": true,
        "your_answer": "B",
        "correct_answer": "B",
        "explanation": "Paragraph 1 discusses the rapid growth of renewable energy sources globally."
      },
      {
        "question_id": "q-002",
        "correct": true,
        "your_answer": "carbon dioxide",
        "correct_answer": ["carbon dioxide", "CO2"],
        "explanation": "Solar panels reduce carbon dioxide emissions by replacing fossil fuel electricity."
      }
    ]
  }
}
```

**Errors:** 400 (insufficient answers, invalid question_ids), 403 (not learner), 404 (passage not found)

---

### GET /reading/history

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-204 |
| **Auth** | Bearer JWT (learner) |

**Query Params:** `?page=1&limit=10&passage_id=<optional>`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "sub-r-001",
      "passage_id": "pass-001",
      "passage_title": "The Rise of Renewable Energy",
      "score_pct": 76.92,
      "duration_sec": 1080,
      "timed_out": false,
      "completed_at": "2025-02-21T14:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
```

---

## 6. Writing Endpoints

### GET /writing/prompts

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-301 |
| **Auth** | Bearer JWT (any role) |

**Query Params:** `?task_type=2&level=B2&topic=environment&page=1&limit=10`

**Response (200):** Same pagination format with prompt objects `{id, title, task_type, level, topic_tags, min_words, source_refs[]}`.

---

### POST /writing/prompts/:id/submit

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-302 |
| **Auth** | Bearer JWT (learner only) |
| **Rate Limit** | 5–10 per user per day |

**Request Body:**
```json
{
  "content": "In recent years, the debate over renewable energy has intensified...",
  "model_tier": "cheap"
}
```

**Response (202 Accepted):**
```json
{
  "statusCode": 202,
  "data": {
    "processing_status": "pending",
    "submission_id": "sub-w-001",
    "message": "Your essay is being scored. Please check back shortly."
  }
}
```

**Errors:** 400 (empty content), 403 (not learner), 404 (prompt not found), 429 (rate limit)

---

### GET /writing/submissions/:id

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-303 |
| **Auth** | Bearer JWT (owner or admin/instructor) |

**Response — When Pending (200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "sub-w-001",
    "processing_status": "pending",
    "created_at": "2025-02-21T15:00:00Z"
  }
}
```

**Response — When Done (200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "sub-w-001",
    "processing_status": "done",
    "prompt_id": "prompt-001",
    "prompt_title": "Advantages of Renewable Energy",
    "content": "In recent years...",
    "word_count": 267,
    "scores": {
      "TR": 6.0,
      "CC": 6.0,
      "LR": 6.5,
      "GRA": 6.0,
      "overall": 6.1
    },
    "feedback": {
      "summary": "Your essay presents a clear position on renewable energy investment with relevant arguments.",
      "strengths": [
        "Clear thesis statement that directly addresses the prompt",
        "Good use of linking words to connect ideas (however, furthermore, in conclusion)",
        "Relevant examples from real-world situations"
      ],
      "improvements": [
        "Develop body paragraph 2 with more specific data or statistics",
        "Vary sentence structures — too many subject-verb-object patterns",
        "Consider addressing the counterargument more thoroughly"
      ]
    },
    "model_tier": "cheap",
    "model_name": "gpt-4o-mini",
    "turnaround_ms": 24000,
    "created_at": "2025-02-21T15:00:00Z",
    "scored_at": "2025-02-21T15:00:24Z"
  }
}
```

**Response — When Failed (200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "sub-w-001",
    "processing_status": "failed",
    "error_message": "Scoring service temporarily unavailable. Please try again later.",
    "created_at": "2025-02-21T15:00:00Z"
  }
}
```

---

### GET /writing/history

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-304 |
| **Auth** | Bearer JWT (learner) |

**Query Params:** `?task_type=2&page=1&limit=10`

**Response (200):** Paginated list of `{id, prompt_id, prompt_title, task_type, overall_score, processing_status, word_count, created_at}`.

---

## 7. Dashboard Endpoints

### GET /me/progress

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-401 |
| **Auth** | Bearer JWT (learner) |

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "reading": {
      "avg_score_pct": 72.5,
      "completion_rate": 0.85,
      "total_attempts": 12
    },
    "writing": {
      "avg_scores": {
        "TR": 5.8,
        "CC": 5.5,
        "LR": 6.0,
        "GRA": 5.5,
        "overall": 5.7
      },
      "total_submissions": 8
    },
    "recent_submissions": [
      {
        "type": "reading",
        "id": "sub-r-012",
        "title": "Climate Change Effects",
        "score": 85.0,
        "date": "2025-02-21T14:30:00Z"
      },
      {
        "type": "writing",
        "id": "sub-w-008",
        "title": "Technology in Education",
        "score": 6.0,
        "date": "2025-02-21T12:00:00Z"
      }
    ]
  }
}
```

---

### GET /me/progress/trends

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-402 |
| **Auth** | Bearer JWT (learner) |

**Query Params:** `?period=4w` (4 weeks) or `?period=3m` (3 months)

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "period": "4w",
    "weeks": [
      {
        "week_start": "2025-01-27",
        "reading_avg_score": 65.0,
        "writing_avg_overall": 5.2,
        "submission_count": 5
      },
      {
        "week_start": "2025-02-03",
        "reading_avg_score": 70.0,
        "writing_avg_overall": 5.5,
        "submission_count": 7
      }
    ]
  }
}
```

---

## 8. Admin Endpoints

### Content CRUD

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /admin/passages | List all passages (incl. drafts) | admin |
| POST | /admin/passages | Create passage | admin |
| GET | /admin/passages/:id | Get passage detail (incl. questions + sources) | admin |
| PATCH | /admin/passages/:id | Update passage | admin |
| DELETE | /admin/passages/:id | Delete passage | admin |
| POST | /admin/passages/:id/questions | Add question to passage | admin |
| PATCH | /admin/questions/:id | Update question | admin |
| DELETE | /admin/questions/:id | Delete question | admin |
| GET | /admin/prompts | List all prompts | admin |
| POST | /admin/prompts | Create prompt | admin |
| GET | /admin/prompts/:id | Get prompt detail | admin |
| PATCH | /admin/prompts/:id | Update prompt | admin |
| DELETE | /admin/prompts/:id | Delete prompt | admin |

### Publish/Unpublish

| Method | Path | Description |
|--------|------|-------------|
| POST | /admin/content/:entityType/:id/publish | Set status=published |
| POST | /admin/content/:entityType/:id/unpublish | Set status=draft |

`entityType` = `passages` | `prompts`

### Import

| Method | Path | Description |
|--------|------|-------------|
| POST | /admin/sources/import | Import source from NotebookLM URL |
| GET | /admin/sources | List imported sources |
| GET | /admin/sources/:id | Source detail with snippets |
| POST | /admin/content/:entityType/:id/sources | Attach sources/snippets to content |
| DELETE | /admin/content/:entityType/:id/sources/:sourceId | Detach source |

### User Management

| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/users | List users (paginated, filterable) |
| PATCH | /admin/users/:id/role | Change user role |

### Instructor Review (Sprint 5)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /instructor/writing-submissions | List learner submissions for review | instructor |
| GET | /instructor/writing-submissions/:id | View submission detail + AI scores | instructor |
| PATCH | /instructor/writing-submissions/:id/review | Add comment + optional score override | instructor |

**PATCH /instructor/writing-submissions/:id/review — Request Body:**
```json
{
  "instructor_comment": "Good structure but needs more examples...",
  "instructor_override_score": 6.5
}
```

**Response (200):** Updated submission with instructor fields populated.

### Content Stats (Sprint 4)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /content/stats | Submission counts per passage/prompt | any |

---

## 9. Async Scoring Flow (Writing)

```
Client                    API Server               BullMQ Queue           Worker
  │                           │                        │                     │
  │ POST /writing/submit      │                        │                     │
  │──────────────────────────►│                        │                     │
  │                           │ Validate + rate check  │                     │
  │                           │ Create submission      │                     │
  │                           │ (status=pending)       │                     │
  │                           │────────────────────────►│                     │
  │                           │ Enqueue job            │                     │
  │ 202 {pending, sub_id}     │                        │                     │
  │◄──────────────────────────│                        │                     │
  │                           │                        │ Dequeue job         │
  │                           │                        │────────────────────►│
  │                           │                        │                     │ Rule checks
  │                           │                        │                     │ LLM call
  │                           │                        │                     │ Parse JSON
  │                           │                        │                     │ Validate
  │ GET /writing/sub/{id}     │                        │                     │
  │──────────────────────────►│ Return pending         │                     │
  │◄──────────────────────────│                        │                     │
  │                           │                        │                     │
  │ (poll every 3s)           │                        │◄────────────────────│
  │                           │                        │  Update submission  │
  │                           │                        │  (status=done)      │
  │ GET /writing/sub/{id}     │                        │                     │
  │──────────────────────────►│ Return done + scores   │                     │
  │◄──────────────────────────│                        │                     │
```

### Queue Configuration

| Setting | Value |
|---------|-------|
| Queue name | `writing-scoring` |
| Concurrency | 2–4 (dev) |
| Job timeout | 90,000 ms |
| Max attempts | 3 (1 initial + 2 retries) |
| Backoff type | Exponential |
| Backoff delay | 1000 ms (doubles each retry) |
| Remove on complete | After 7 days |
| Remove on fail | Never (keep in DLQ for review) |

### Polling Strategy (Client)

| Aspect | Value |
|--------|-------|
| Initial delay | 2s after submit |
| Poll interval | 3s |
| Max poll duration | 5 minutes |
| Timeout behavior | Show "Scoring is taking longer than usual. We'll notify you when ready." |
| Backoff | After 1 min, switch to 10s intervals |

---

## 10.5 Classroom Management Endpoints

### POST /classrooms

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-701 |
| **Auth** | Bearer JWT (instructor/admin) |
| **Body** | `{name, description?, cover_image_url?, max_members?}` |
| **Response (201)** | `{id, name, invite_code, owner_id, status, created_at}` |

---

### GET /classrooms

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-701 |
| **Auth** | Bearer JWT |
| **Description** | Returns classrooms owned + joined by current user |
| **Query Params** | `?page=1&limit=10&status=active` |
| **Response (200)** | Paginated list of `{id, name, description, invite_code, owner_id, status, members_count, role}` |

---

### GET /classrooms/:id

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-701 |
| **Auth** | Bearer JWT (must be member) |
| **Response (200)** | Classroom detail + topics with lessons |

---

### PATCH /classrooms/:id

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-701 |
| **Auth** | Bearer JWT (owner/admin) |
| **Body** | Partial `{name?, description?, cover_image_url?, max_members?, status?}` |

---

### POST /classrooms/:id/members

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-702 |
| **Auth** | Bearer JWT (owner/admin) |
| **Body** | `{email}` |
| **Errors** | 404 (user not found), 409 (already member), 403 (classroom full) |

---

### GET /classrooms/:id/members

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-702 |
| **Auth** | Bearer JWT (owner/admin) |
| **Response (200)** | `[{id, user_id, display_name, email, role, joined_at}]` |

---

### DELETE /classrooms/:id/members/:userId

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-702 |
| **Auth** | Bearer JWT (owner/admin) |

---

### GET /classrooms/:id/invite

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-703 |
| **Auth** | Bearer JWT (owner) |
| **Response (200)** | `{invite_code, invite_url, qr_code_base64}` |

---

### POST /classrooms/:id/invite/regenerate

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-703 |
| **Auth** | Bearer JWT (owner) |
| **Response (200)** | `{invite_code, invite_url}` (new code) |

---

### POST /classrooms/join

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-703 |
| **Auth** | Bearer JWT (any role) |
| **Body** | `{invite_code}` |
| **Response (200)** | `{classroom_id, classroom_name, role: 'student'}` |
| **Errors** | 404 (invalid code), 409 (already member), 403 (full) |

---

### POST /classrooms/:id/topics

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-704 |
| **Auth** | Bearer JWT (owner/admin) |
| **Body** | `{title, description?, status?}` |

---

### GET /classrooms/:id/topics

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-704 |
| **Auth** | Bearer JWT (member) |
| **Note** | Students see only `status='published'` (CR-007) |

---

### PATCH /topics/:id

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-704 |
| **Auth** | Bearer JWT (classroom owner/admin) |

---

### DELETE /topics/:id

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-704 |
| **Auth** | Bearer JWT (classroom owner/admin) |
| **Note** | CASCADE deletes all lessons |

---

### PATCH /classrooms/:id/topics/reorder

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-704 |
| **Auth** | Bearer JWT (owner/admin) |
| **Body** | `{topic_ids: [uuid, uuid, ...]}` |

---

### POST /topics/:id/lessons

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-705 |
| **Auth** | Bearer JWT (classroom owner/admin) |
| **Body** | `{title, content?, content_type?, linked_entity_id?, status?}` |

---

### GET /topics/:id/lessons

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-705 |
| **Auth** | Bearer JWT (member) |
| **Note** | Students see only `status='published'` |

---

### PATCH /lessons/:id

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-705 |
| **Auth** | Bearer JWT (classroom owner/admin) |

---

### DELETE /lessons/:id

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-705 |
| **Auth** | Bearer JWT (classroom owner/admin) |

---

### PATCH /topics/:id/lessons/reorder

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-705 |
| **Auth** | Bearer JWT (owner/admin) |
| **Body** | `{lesson_ids: [uuid, uuid, ...]}` |

---

## 10.1 Content Status Toggle Endpoints

### PATCH /classrooms/topics/:topicId/toggle-status

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-706 |
| **Auth** | Bearer JWT (classroom owner/admin) |
| **Response (200)** | Updated topic object with new `status` |

---

### PATCH /classrooms/lessons/:lessonId/toggle-status

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-706 |
| **Auth** | Bearer JWT (classroom owner/admin) |
| **Response (200)** | Updated lesson object with new `status` |

---

## 10.2 Library Content Endpoints

### GET /classrooms/library/passages

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-708 |
| **Auth** | Bearer JWT (instructor/admin) |
| **Response (200)** | `[{id, title, level, collection}]` — only published passages |

---

### GET /classrooms/library/prompts

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-708 |
| **Auth** | Bearer JWT (instructor/admin) |
| **Response (200)** | `[{id, title, task_type, level}]` — only published prompts |

---

## 10.3 Duplicate Endpoints

### POST /classrooms/topics/:topicId/duplicate

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-710 |
| **Auth** | Bearer JWT (classroom owner/admin) |
| **Response (201)** | Duplicated topic with all lessons (status='draft') |

---

### POST /classrooms/lessons/:lessonId/duplicate

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-710 |
| **Auth** | Bearer JWT (classroom owner/admin) |
| **Response (201)** | Duplicated lesson (status='draft') |

---

## 10.4 Announcement Endpoints

### GET /classrooms/:id/announcements

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-709 |
| **Auth** | Bearer JWT (classroom member) |
| **Response (200)** | `[{id, message, author: {display_name}, created_at}]` (20 items, DESC) |

---

### POST /classrooms/:id/announcements

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-709 |
| **Auth** | Bearer JWT (classroom owner) |
| **Body** | `{message}` |
| **Response (201)** | Created announcement object |

---

### DELETE /classrooms/:id/announcements/:announcementId

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-709 |
| **Auth** | Bearer JWT (classroom owner) |

---

## 10.5 Student Progress & Instructor Stats

### GET /classrooms/:id/progress

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-711 |
| **Auth** | Bearer JWT (classroom owner) |
| **Response (200)** | Array of student progress objects |

**Response Example:**
```json
[
  {
    "user_id": "uuid",
    "display_name": "Minh",
    "email": "minh@example.com",
    "joined_at": "2025-01-15T...",
    "reading_count": 5,
    "reading_avg": 78.5,
    "writing_count": 3,
    "writing_avg": 6.5,
    "recent_reading": [...],
    "recent_writing": [...]
  }
]
```

---

### GET /dashboard/instructor-stats

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-712 |
| **Auth** | Bearer JWT (instructor) |
| **Response (200)** | `{total_classrooms, total_students, pending_writing_reviews}` |

---

## 10.6 File Upload

### POST /uploads

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-714 |
| **Auth** | Bearer JWT (any authenticated role) |
| **Content-Type** | `multipart/form-data` |

**Body:** `file` (multipart field — max 10MB)

**Supported formats:** JPEG, PNG, WEBP, GIF, PDF, DOC, DOCX

**Response (200):**
```json
{
  "url": "http://localhost:3001/uploads/9ea91db6-f22b.png",
  "filename": "original-name.png",
  "htmlContent": "<img src=\"http://localhost:3001/uploads/9ea91db6-f22b.png\" alt=\"...\" />"
}
```

**Notes:**
- DOCX files are converted to HTML via `mammoth`
- Image files return `<img>` tag in `htmlContent`
- Files are stored in `/uploads/` directory with UUID prefix

---

## 10.7 Lesson Submission Endpoints

### POST /lessons/:id/submissions

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-715 |
| **Auth** | Bearer JWT (any role, typically learner) |

**Request Body:**
```json
{
  "content": "In recent years, the debate over renewable energy has intensified..."
}
```

**Validation:**
- Lesson must exist
- Lesson `allow_submit` must be `true`
- Content cannot be empty

**Response (201):**
```json
{
  "id": "sub-ls-001",
  "lesson_id": "lesson-001",
  "user_id": "user-001",
  "content": "In recent years...",
  "word_count": 267,
  "status": "submitted",
  "created_at": "2026-03-03T12:00:00Z"
}
```

**Errors:** 400 (empty content), 403 (submissions disabled), 404 (lesson not found)

---

### GET /lessons/:id/submissions

| Aspect | Detail |
|--------|--------|
| **FR Ref** | FR-715 |
| **Auth** | Bearer JWT (classroom owner/admin) |
| **Response (200)** | Array of submissions with user info |

**Response Example:**
```json
[
  {
    "id": "sub-ls-001",
    "lesson_id": "lesson-001",
    "content": "In recent years...",
    "word_count": 267,
    "status": "submitted",
    "score": null,
    "feedback": null,
    "created_at": "2026-03-03T12:00:00Z",
    "user": {
      "id": "user-001",
      "display_name": "Minh Nguyen",
      "email": "minh@example.com"
    }
  }
]
```

---

## 10.8 Updated Lesson Create/Update Body

Khi tạo hoặc cập nhật lesson, body hỗ trợ thêm 2 fields mới:

```json
{
  "title": "Writing Task 1 — Line Graph",
  "content": "Summarise the information by selecting...",
  "content_type": "prompt",
  "attachment_url": "http://localhost:3001/uploads/xxx.png",
  "status": "published",
  "allow_submit": true,
  "allow_checkscore": false
}
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| allow_submit | boolean | ❌ | `true` |
| allow_checkscore | boolean | ❌ | `false` |

---

## 11. Error Codes Reference

| HTTP Status | Code | Description | Example |
|-------------|------|-------------|---------|
| 400 | BAD_REQUEST | Validation error | Missing required field, bad format |
| 401 | UNAUTHORIZED | Authentication failed | Missing/invalid/expired JWT |
| 403 | FORBIDDEN | Authorization failed | Learner accessing admin route; classroom full; submissions disabled |
| 404 | NOT_FOUND | Resource not found | Passage ID doesn't exist; invalid invite code |
| 409 | CONFLICT | Resource conflict | Duplicate email; already a member |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded | Daily writing limit |
| 500 | INTERNAL_ERROR | Server error | Unhandled exception |
| 503 | SERVICE_UNAVAILABLE | Service degraded | Queue full, DB down |

---

> **Tham chiếu:** [openapi.yaml](openapi.yaml) | [05_functional_requirements](05_functional_requirements.md) | [08_data_requirements](08_data_requirements.md)
