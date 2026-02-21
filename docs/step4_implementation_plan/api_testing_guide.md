# 🧪 API Testing Guide — IELTS Helper (MVP)

> **Mã tài liệu:** STEP4-TESTING  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [09_api_specifications](../step3_prd/09_api_specifications.md) | [api_collection.json](api_collection.json)

---

## 1. Testing Tools

| Tool | Purpose |
|------|---------|
| Thunder Client (VS Code ext) | Manual API testing in VS Code |
| Postman | GUI API testing (import collection) |
| curl | CLI testing |
| Supertest | Automated E2E tests (Jest) |
| `api_collection.json` | Pre-built collection for Thunder/Postman |

---

## 2. Test Environment Setup

```bash
# 1. Ensure infrastructure is running
docker compose up -d

# 2. Ensure backend is running
cd apps/backend && npm run start:dev

# 3. Base URL
BASE_URL=http://localhost:3001/api
```

---

## 3. Smoke Test Suite

### 3.1 Auth Tests

| # | Test | Method | Endpoint | Expected | Priority |
|---|------|--------|----------|----------|----------|
| A01 | Register new user | POST | /auth/register | 201 + tokens + user | Critical |
| A02 | Register duplicate email | POST | /auth/register | 409 Conflict | High |
| A03 | Login valid credentials | POST | /auth/login | 200 + tokens + user | Critical |
| A04 | Login invalid password | POST | /auth/login | 401 Unauthorized | High |
| A05 | Refresh valid token | POST | /auth/refresh | 200 + new tokens | Critical |
| A06 | Refresh expired token | POST | /auth/refresh | 401 | High |
| A07 | Get profile | GET | /me | 200 + user object | Medium |
| A08 | Update profile | PATCH | /me | 200 + updated user | Medium |
| A09 | Access protected without JWT | GET | /reading/passages | 401 | Critical |
| A10 | Access admin as learner | GET | /admin/passages | 403 Forbidden | Critical |

### 3.2 Reading Tests

| # | Test | Method | Endpoint | Expected | Priority |
|---|------|--------|----------|----------|----------|
| R01 | List passages (published only) | GET | /reading/passages | 200 + paginated list (no drafts) | Critical |
| R02 | Filter by level | GET | /reading/passages?level=B2 | 200 + filtered results | High |
| R03 | Get passage detail | GET | /reading/passages/:id | 200 + passage + questions (no answer_key) | Critical |
| R04 | Get unpublished passage | GET | /reading/passages/:draft_id | 404 | High |
| R05 | Submit with ≥80% answers | POST | /reading/passages/:id/submit | 200 + score + details | Critical |
| R06 | Submit with <80% answers | POST | /reading/passages/:id/submit | 400 + threshold error | Critical |
| R07 | Submit with timed_out=true (<80%) | POST | /reading/passages/:id/submit | 200 (bypasses threshold) | High |
| R08 | Verify MCQ grading correct | POST | submit + check correct_count | answer "B" vs key "B" → correct | Critical |
| R09 | Verify short answer grading | POST | submit + check | "carbon dioxide" vs ["CO2", "carbon dioxide"] → correct | Critical |
| R10 | Reading history | GET | /reading/history | 200 + paginated submissions | Medium |

### 3.3 Writing Tests

| # | Test | Method | Endpoint | Expected | Priority |
|---|------|--------|----------|----------|----------|
| W01 | List prompts (published only) | GET | /writing/prompts | 200 + paginated list | Critical |
| W02 | Submit essay | POST | /writing/prompts/:id/submit | 202 + submission_id + pending | Critical |
| W03 | Poll pending submission | GET | /writing/submissions/:id | 200 + status=pending | Critical |
| W04 | Poll done submission | GET | /writing/submissions/:id | 200 + status=done + scores + feedback | Critical |
| W05 | Verify score shape | GET | after done | scores has TR, CC, LR, GRA, overall (numbers) | Critical |
| W06 | Verify feedback shape | GET | after done | feedback has summary (string), strengths[], improvements[] | Critical |
| W07 | Submit empty essay | POST | /writing/prompts/:id/submit | 400 Bad Request | High |
| W08 | Rate limit exceeded | POST | submit N+1 times | 429 + reset header | High |
| W09 | Submit with premium tier | POST | /writing/submit {model_tier: "premium"} | 202 + model_tier saved | Medium |
| W10 | Failed scoring (mock error) | GET | /writing/submissions/:id | status=failed + error_message | High |

### 3.4 Dashboard Tests

| # | Test | Method | Endpoint | Expected | Priority |
|---|------|--------|----------|----------|----------|
| D01 | Get progress (with data) | GET | /me/progress | 200 + reading/writing stats | High |
| D02 | Get progress (new user) | GET | /me/progress | 200 + zeroed stats | Medium |
| D03 | Get trends (4 weeks) | GET | /me/progress/trends?period=4w | 200 + weekly data points | Medium |

### 3.5 Admin Tests

| # | Test | Method | Endpoint | Expected | Priority |
|---|------|--------|----------|----------|----------|
| AD01 | List all passages (incl. drafts) | GET | /admin/passages | 200 (shows drafts + published) | Critical |
| AD02 | Create passage | POST | /admin/passages | 201 + passage (status=draft) | Critical |
| AD03 | Update passage | PATCH | /admin/passages/:id | 200 + updated passage | High |
| AD04 | Delete passage | DELETE | /admin/passages/:id | 200 (cascade questions) | High |
| AD05 | Publish passage | POST | /admin/content/passages/:id/publish | 200 + status=published | Critical |
| AD06 | Unpublish passage | POST | /admin/content/passages/:id/unpublish | 200 + status=draft | High |
| AD07 | Add question to passage | POST | /admin/passages/:id/questions | 201 + question | High |
| AD08 | Import source | POST | /admin/sources/import | 201 + source + snippets | High |
| AD09 | List users | GET | /admin/users | 200 + paginated users | Medium |
| AD10 | Change user role | PATCH | /admin/users/:id/role | 200 + updated role | Medium |

---

## 4. Performance Validation

| Test | Expectation | How to Measure |
|------|-------------|---------------|
| Catalog list p95 | < 200ms | Time curl or use Thunder Client timing |
| Reading submit p95 | < 500ms | Grading is synchronous |
| Writing submit (enqueue only) | < 200ms | Returns 202 immediately |
| Writing scoring end-to-end | < 5 min for 90% | Time from submit to done status |
| Health check | < 50ms | curl timing |

---

## 5. Error Handling Validation

| Scenario | Expected Response |
|----------|------------------|
| Invalid JSON body | 400 + "Validation failed" |
| Missing required field | 400 + field-specific error |
| Invalid UUID parameter | 400 + "Invalid ID format" |
| Resource not found | 404 + "Not found" |
| Expired JWT | 401 + "Token expired" |
| No JWT header | 401 + "Unauthorized" |
| Learner accesses admin | 403 + "Forbidden" |
| Rate limit hit | 429 + retry-after header |
| Internal server error | 500 + generic message (no stack trace) |

---

## 6. Async Scoring End-to-End Test

```bash
# 1. Login as learner
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}' | jq -r '.data.access_token')

# 2. Submit essay
SUB_ID=$(curl -s -X POST $BASE_URL/writing/prompts/<prompt_id>/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"In recent years, the debate over renewable energy has intensified. Many argue that governments should invest more in clean energy sources...","model_tier":"cheap"}' | jq -r '.data.submission_id')

echo "Submission ID: $SUB_ID"

# 3. Poll until done (max 5 minutes)
for i in $(seq 1 100); do
  STATUS=$(curl -s $BASE_URL/writing/submissions/$SUB_ID \
    -H "Authorization: Bearer $TOKEN" | jq -r '.data.processing_status')
  echo "Attempt $i: $STATUS"
  if [ "$STATUS" = "done" ] || [ "$STATUS" = "failed" ]; then
    echo "Final status: $STATUS"
    curl -s $BASE_URL/writing/submissions/$SUB_ID \
      -H "Authorization: Bearer $TOKEN" | jq '.data'
    break
  fi
  sleep 3
done
```

---

> **Tham chiếu:** [09_api_specifications](../step3_prd/09_api_specifications.md) | [api_collection.json](api_collection.json)
