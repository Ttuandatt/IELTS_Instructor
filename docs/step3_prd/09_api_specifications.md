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
  "duration_sec": 1080
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

## 10. Error Codes Reference

| HTTP Status | Code | Description | Example |
|-------------|------|-------------|---------|
| 400 | BAD_REQUEST | Validation error | Missing required field, bad format |
| 401 | UNAUTHORIZED | Authentication failed | Missing/invalid/expired JWT |
| 403 | FORBIDDEN | Authorization failed | Learner accessing admin route |
| 404 | NOT_FOUND | Resource not found | Passage ID doesn't exist |
| 409 | CONFLICT | Resource conflict | Duplicate email |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded | Daily writing limit |
| 500 | INTERNAL_ERROR | Server error | Unhandled exception |
| 503 | SERVICE_UNAVAILABLE | Service degraded | Queue full, DB down |

---

> **Tham chiếu:** [openapi.yaml](openapi.yaml) | [05_functional_requirements](05_functional_requirements.md) | [08_data_requirements](08_data_requirements.md)
