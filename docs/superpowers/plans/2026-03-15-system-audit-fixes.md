# System Audit Fixes — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix security vulnerabilities, complete missing core features, and add reliability mechanisms identified by the 3-actor system audit (Admin/Instructor/Learner role-play analysis).

**Architecture:** PRD-first approach — every task begins by updating the relevant PRD documents, then implements backend changes (NestJS + Prisma), then frontend changes (Next.js). Each priority group is independently deployable.

**Tech Stack:** NestJS 10, Next.js 14, Prisma 6, PostgreSQL 15, Redis 7, BullMQ 5, TypeScript

**Audit Date:** 2026-03-15

---

## Priority Map (Revised after deep-dive)

| Priority | Issue ID | Title | Status Before | Effort |
|----------|----------|-------|---------------|--------|
| **P1** | A6 | Fix role self-registration security hole | VULNERABLE | Small |
| **P1** | L1 | Complete Learner Dashboard (trends, progress) | 50% done | Medium |
| **P2** | I2 | Notification for new submissions | NOT STARTED | Medium |
| **P2** | F6 | Stale job cleanup cron | NOT STARTED | Small |
| **P2** | F4 | Queue full graceful degradation | NOT STARTED | Small |
| **P2** | I3 | Unified submission view for Instructor | NOT STARTED | Medium |
| **P3** | F14 | Auto-save answers (localStorage) | NOT STARTED | Small |
| **P3** | A2 | Content versioning | NOT STARTED | Medium |
| **P3** | X1 | Classroom module PRD documentation | NOT STARTED | Medium |

**Already resolved (removed from plan):**
- ~~I1: Instructor Dashboard~~ — ✅ Fully implemented
- ~~F2: LLM Fallback Provider~~ — ✅ Fully implemented (OpenAI ↔ Google Gemini)

---

## Chunk 1: Priority 1 — Security & Core UX

---

### Task 1: [A6] Fix Role Self-Registration Security Hole

**Context:** Currently `POST /auth/register` accepts a `role` field in the body. Anyone can register as `admin` or `instructor`. This is a critical security vulnerability.

**Decision:** Default all registrations to `learner`. Only existing admins can change user roles via `PATCH /admin/users/:id/role`.

**Files:**
- Modify: `docs/step3_prd/03_user_personas_roles.md` (Section 5.1 — Registration Flow)
- Modify: `docs/step2_lowcode/business_rules.md` (Section 5 — Auth Rules, add AU-005)
- Modify: `apps/backend/src/auth/dto/register.dto.ts` (remove `role` field)
- Modify: `apps/backend/src/auth/auth.service.ts` (hardcode `role: UserRole.learner`)
- Test: `apps/backend/src/auth/auth.service.spec.ts` (or auth e2e test)

#### Step 1: Update PRD — User Personas & Roles

- [ ] **1.1: Update registration flow in PRD-03**

Open `docs/step3_prd/03_user_personas_roles.md`, replace Section 5.1:

```markdown
### 5.1 User Registration Flow (mặc định learner)

\```
[User] → Điền email, password, display_name trên form đăng ký
       → POST /auth/register {email, password, display_name}
       → Server tạo account với role = learner (LUÔN LUÔN)
       → Trả JWT access + refresh token
       → Redirect to Dashboard

Lưu ý: Không cho phép chọn role khi đăng ký.
Chỉ Admin có quyền thay đổi role qua PATCH /admin/users/{id}/role
\```
```

- [ ] **1.2: Add AU-005 business rule**

Open `docs/step2_lowcode/business_rules.md`, add to Section 5 (Auth Rules):

```markdown
| AU-005 | Registration always creates learner role; role changes require admin action | Backend validation | Reject any role field in register payload |
```

#### Step 2: Implement Backend Fix

- [ ] **2.1: Remove `role` field from RegisterDto**

File: `apps/backend/src/auth/dto/register.dto.ts`

Remove these lines:
```typescript
@IsOptional()
@IsEnum(UserRole)
role?: UserRole;
```

- [ ] **2.2: Hardcode learner role in auth.service.ts**

File: `apps/backend/src/auth/auth.service.ts`

In the `register()` method, change:
```typescript
role: dto.role || UserRole.learner,
```
to:
```typescript
role: UserRole.learner,
```

- [ ] **2.3: Write test verifying role cannot be set via registration**

```typescript
it('should always create user with learner role regardless of input', async () => {
  const result = await authService.register({
    email: 'test@example.com',
    password: 'P@ssw0rd!',
    display_name: 'Test User',
  });
  expect(result.user.role).toBe('learner');
});
```

- [ ] **2.4: Run tests**

```bash
cd apps/backend && npx jest --testPathPattern=auth --verbose
```

- [ ] **2.5: Commit**

```bash
git add docs/step3_prd/03_user_personas_roles.md docs/step2_lowcode/business_rules.md apps/backend/src/auth/
git commit -m "fix(auth): remove role self-registration, always default to learner (A6 security fix)"
```

---

### Task 2: [L1] Complete Learner Dashboard — Backend Progress Endpoints

**Context:** Dashboard currently shows basic stats via `GET /dashboard/stats`. PRD requires `GET /me/progress` (detailed stats) and `GET /me/progress/trends` (weekly trends chart). These endpoints don't exist yet.

**Files:**
- Modify: `docs/step3_prd/09_api_specifications.md` (verify Section 7 matches implementation)
- Create: `apps/backend/src/dashboard/dto/progress-query.dto.ts`
- Modify: `apps/backend/src/dashboard/dashboard.controller.ts` (add 2 endpoints)
- Modify: `apps/backend/src/dashboard/dashboard.service.ts` (add 2 methods)
- Test: `apps/backend/src/dashboard/dashboard.service.spec.ts`

#### Step 1: Verify PRD API Spec

- [ ] **1.1: Confirm PRD-09 Section 7 already defines the endpoints**

`GET /me/progress` and `GET /me/progress/trends` are already defined in PRD-09 Section 7. No PRD update needed here — just implementation.

#### Step 2: Create Progress Query DTO

- [ ] **2.1: Create DTO for trends query**

File: `apps/backend/src/dashboard/dto/progress-query.dto.ts`

```typescript
import { IsOptional, IsIn } from 'class-validator';

export class TrendsQueryDto {
  @IsOptional()
  @IsIn(['4w', '3m'])
  period?: '4w' | '3m' = '4w';
}
```

#### Step 3: Implement Backend Endpoints

- [ ] **3.1: Add `getProgress()` to DashboardService**

File: `apps/backend/src/dashboard/dashboard.service.ts`

Add method that aggregates:
- Reading: avg_score_pct, completion_rate, total_attempts
- Writing: avg_scores per criterion (TR, CC, LR, GRA, overall), total_submissions
- Recent submissions: last 10 mixed reading+writing, sorted by date DESC

Query approach:
```typescript
async getProgress(userId: string) {
  const [readingSubs, writingSubs] = await Promise.all([
    this.prisma.readingSubmission.findMany({
      where: { user_id: userId },
      include: { passage: { select: { title: true } } },
      orderBy: { created_at: 'desc' },
    }),
    this.prisma.writingSubmission.findMany({
      where: { user_id: userId, processing_status: 'done' },
      include: { prompt: { select: { title: true } } },
      orderBy: { created_at: 'desc' },
    }),
  ]);

  // Calculate aggregates...
  // Build recent_submissions array (mixed, sorted, top 10)...
}
```

- [ ] **3.2: Add `getProgressTrends()` to DashboardService**

```typescript
async getProgressTrends(userId: string, period: '4w' | '3m') {
  const weeksBack = period === '4w' ? 4 : 13;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeksBack * 7);

  // Raw SQL or Prisma groupBy to aggregate weekly:
  // - reading_avg_score per week
  // - writing_avg_overall per week
  // - submission_count per week
}
```

- [ ] **3.3: Add controller endpoints**

File: `apps/backend/src/dashboard/dashboard.controller.ts`

```typescript
@Get('progress')
@UseGuards(JwtAuthGuard)
getProgress(@Request() req: any) {
  return this.dashboardService.getProgress(req.user.sub);
}

@Get('progress/trends')
@UseGuards(JwtAuthGuard)
getProgressTrends(@Request() req: any, @Query() query: TrendsQueryDto) {
  return this.dashboardService.getProgressTrends(req.user.sub, query.period);
}
```

- [ ] **3.4: Write tests**

Test cases:
1. `getProgress()` returns correct structure with empty data
2. `getProgress()` calculates correct avg with sample data
3. `getProgressTrends('4w')` returns 4 week entries
4. `getProgressTrends('3m')` returns up to 13 week entries

- [ ] **3.5: Run tests and commit**

```bash
cd apps/backend && npx jest --testPathPattern=dashboard --verbose
git add apps/backend/src/dashboard/ docs/
git commit -m "feat(dashboard): add GET /dashboard/progress and /progress/trends endpoints (L1)"
```

---

### Task 3: [L1] Complete Learner Dashboard — Frontend

**Context:** Current frontend dashboard shows 4 stat cards. Need to add: detailed progress cards with per-criterion writing scores, trend chart, and better recent submissions list.

**Files:**
- Modify: `apps/frontend/src/app/dashboard/page.tsx` (enhance LearnerDashboard component)
- Create: `apps/frontend/src/components/features/TrendChart.tsx`
- Modify: `apps/frontend/src/lib/api.ts` (add progress API calls if not exists)

#### Step 1: Update UI Spec PRD

- [ ] **1.1: Verify PRD-10 Section 4.2 Dashboard spec**

PRD-10 already defines the dashboard layout. No update needed.

#### Step 2: Implement Frontend

- [ ] **2.1: Create TrendChart component**

File: `apps/frontend/src/components/features/TrendChart.tsx`

Simple line chart using a lightweight library (already in project?) or CSS-based bars. Shows:
- X-axis: week labels
- Y-axis: score values
- Two lines: Reading avg, Writing avg overall
- Period selector: 4w / 3m toggle

- [ ] **2.2: Enhance LearnerDashboard in page.tsx**

Replace current simple stat cards with:
1. **Reading stat card**: avg score %, completion rate, total attempts
2. **Writing stat card**: avg scores per criterion (TR/CC/LR/GRA) as mini bars, overall, total
3. **Recent submissions**: mixed list with type icon, title, score, relative date
4. **Trend chart**: TrendChart component with period toggle

Use two API calls:
```typescript
const { data: progress } = useQuery({
  queryKey: ['dashboard-progress'],
  queryFn: () => apiClient.get('/dashboard/progress').then(r => r.data),
});

const { data: trends } = useQuery({
  queryKey: ['dashboard-trends', period],
  queryFn: () => apiClient.get(`/dashboard/progress/trends?period=${period}`).then(r => r.data),
});
```

- [ ] **2.3: Add empty state for new users**

When `progress.reading.total_attempts === 0 && progress.writing.total_submissions === 0`:
```tsx
<div className="text-center py-12">
  <h2>{t.dashboard.welcome}</h2>
  <p>{t.dashboard.start_first_practice}</p>
  <div className="flex gap-4 justify-center mt-4">
    <Link href="/reading">{t.dashboard.practice_reading}</Link>
    <Link href="/writing">{t.dashboard.practice_writing}</Link>
  </div>
</div>
```

- [ ] **2.4: Add i18n keys for new dashboard strings**

Update `vi.json` and `en.json` with:
- `dashboard.welcome`, `dashboard.start_first_practice`
- `dashboard.practice_reading`, `dashboard.practice_writing`
- `dashboard.reading_avg`, `dashboard.writing_avg`
- `dashboard.trend_title`, `dashboard.period_4w`, `dashboard.period_3m`

- [ ] **2.5: Test manually and commit**

```bash
git add apps/frontend/src/
git commit -m "feat(dashboard): add progress trends chart and enhanced learner dashboard (L1)"
```

---

## Chunk 2: Priority 2 — Reliability & Experience

---

### Task 4: [F6] Stale Job Cleanup Cron

**Context:** Writing scoring jobs can get stuck in `pending` status if the worker crashes mid-processing. No mechanism currently detects or cleans these up.

**Files:**
- Modify: `docs/step3_prd/12_technical_constraints.md` (Section 5 Queue Constraints — add stale cleanup)
- Modify: `docs/step2_lowcode/business_rules.md` (add WR-008 rule)
- Create: `apps/backend/src/scoring/scoring-cleanup.service.ts`
- Modify: `apps/backend/src/scoring/scoring.module.ts` (register cleanup service)
- Test: `apps/backend/src/scoring/scoring-cleanup.service.spec.ts`

- [ ] **1.1: Update PRD-12 Section 5 — add stale job cleanup rule**

Add to Queue Constraints table:
```markdown
| Stale job cleanup | Cron every 5 min: mark submissions with status='pending' AND created_at > 10 min ago as 'failed' | Log alert |
```

- [ ] **1.2: Add WR-008 business rule**

```markdown
| WR-008 | Submissions stuck in 'pending' > 10 min are auto-marked 'failed' with error message | Cron service (every 5 min) | Mark failed; log warning |
```

- [ ] **1.3: Implement ScoringCleanupService**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScoringCleanupService {
  private readonly logger = new Logger(ScoringCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupStaleJobs() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const staleJobs = await this.prisma.writingSubmission.updateMany({
      where: {
        processing_status: 'pending',
        created_at: { lt: tenMinutesAgo },
      },
      data: {
        processing_status: 'failed',
        error_message: 'Scoring timed out after 10 minutes. Please try again.',
      },
    });

    if (staleJobs.count > 0) {
      this.logger.warn(`Cleaned up ${staleJobs.count} stale scoring jobs`);
    }
  }
}
```

- [ ] **1.4: Register in scoring.module.ts and ensure ScheduleModule is imported**

- [ ] **1.5: Write test, run, commit**

```bash
git commit -m "feat(scoring): add stale job cleanup cron every 5 min (F6)"
```

---

### Task 5: [F4] Queue Full Graceful Degradation

**Context:** When BullMQ queue is overwhelmed, writing submit should return 503 instead of silently failing.

**Files:**
- Modify: `docs/step3_prd/07_non_functional_requirements.md` (NFR-R03 — add queue full handling)
- Modify: `apps/backend/src/scoring/scoring.producer.ts` (add queue depth check)
- Modify: `apps/backend/src/writing/writing.service.ts` (handle 503 from producer)

- [ ] **1.1: Update NFR-R03 in PRD-07**

Add to Scoring Pipeline Resilience table:
```markdown
| Queue backpressure | If queue depth > 100 jobs → return 503 with Retry-After: 60 | ScoringProducer check |
```

- [ ] **1.2: Add queue depth check in ScoringProducerService**

```typescript
async checkQueueHealth(): Promise<{ depth: number; healthy: boolean }> {
  const queue = this.scoringQueue;
  const waiting = await queue.getWaitingCount();
  const active = await queue.getActiveCount();
  const depth = waiting + active;
  return { depth, healthy: depth < 100 };
}
```

- [ ] **1.3: Update writing.service.ts submitEssay()**

Before enqueuing, call `checkQueueHealth()`. If not healthy, throw `ServiceUnavailableException` with `Retry-After` header.

- [ ] **1.4: Write test, run, commit**

```bash
git commit -m "feat(writing): add queue depth check, return 503 when queue full (F4)"
```

---

### Task 6: [I2] Notification System for New Submissions

**Context:** Instructors have no way to know when students submit new work. They must manually check each classroom/lesson. Need a lightweight notification mechanism.

**Decision:** Use existing Redis pub/sub pattern (already used for scoring) + SSE endpoint for instructor notifications. Store notifications in DB for persistence.

**Files:**
- Modify: `docs/step3_prd/09_api_specifications.md` (add notification endpoints section)
- Modify: `docs/step2_lowcode/user_flows.md` (add F10 — Instructor Notification flow)
- Create Prisma migration: `notification` table
- Create: `apps/backend/src/notification/notification.module.ts`
- Create: `apps/backend/src/notification/notification.service.ts`
- Create: `apps/backend/src/notification/notification.controller.ts`
- Modify: `apps/backend/src/lesson/lesson.service.ts` (emit notification on submit)
- Modify: `apps/backend/src/writing/writing.service.ts` (emit notification on submit)
- Create: `apps/frontend/src/components/layout/NotificationBell.tsx`

#### Step 1: Update PRDs

- [ ] **1.1: Add Notification API section to PRD-09**

```markdown
## 12. Notification Endpoints

### GET /notifications
| Auth | Bearer JWT |
| Response | Paginated list of notifications for current user |

### PATCH /notifications/:id/read
| Auth | Bearer JWT |
| Response | Mark notification as read |

### GET /notifications/unread-count
| Auth | Bearer JWT |
| Response | `{count: number}` |

### GET /notifications/events (SSE)
| Auth | Bearer JWT |
| Response | Server-Sent Events stream for real-time notifications |
```

- [ ] **1.2: Add F10 user flow to user_flows.md**

#### Step 2: Create Notification Table

- [ ] **2.1: Add Notification model to Prisma schema**

```prisma
model Notification {
  id          String   @id @default(uuid())
  user_id     String
  type        String   // 'lesson_submission' | 'writing_submission'
  title       String
  message     String
  link        String?  // URL to navigate to
  is_read     Boolean  @default(false)
  metadata    Json?
  created_at  DateTime @default(now())

  user        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, is_read])
  @@index([user_id, created_at])
  @@map("notifications")
}
```

- [ ] **2.2: Run migration**

```bash
cd apps/backend && npx prisma migrate dev --name add_notifications
```

#### Step 3: Implement Notification Module

- [ ] **3.1: Create NotificationService** — CRUD + Redis pub/sub publish
- [ ] **3.2: Create NotificationController** — REST endpoints + SSE endpoint
- [ ] **3.3: Modify LessonService** — After lesson submission, create notification for classroom owner
- [ ] **3.4: Modify WritingService** — After writing submission, create notification for relevant instructors

#### Step 4: Frontend NotificationBell

- [ ] **4.1: Create NotificationBell component** in Header
- [ ] **4.2: Connect to SSE endpoint** for real-time updates
- [ ] **4.3: Show unread count badge**
- [ ] **4.4: Dropdown with notification list, click to navigate**

- [ ] **4.5: Commit**

```bash
git commit -m "feat(notification): add notification system for new submissions (I2)"
```

---

### Task 7: [I3] Unified Submission View for Instructor

**Context:** Instructor currently checks submissions in 3 separate places: Writing submissions, Reading submissions, Lesson submissions. Need a unified view.

**Files:**
- Modify: `docs/step3_prd/09_api_specifications.md` (add unified endpoint)
- Modify: `apps/backend/src/instructor/instructor.controller.ts`
- Modify: `apps/backend/src/instructor/instructor.service.ts`
- Modify: `apps/frontend/src/app/instructor/submissions/page.tsx`

- [ ] **1.1: Update PRD-09 — add unified endpoint**

```markdown
### GET /instructor/all-submissions
| Auth | Bearer JWT (instructor) |
| Query | ?type=all|reading|writing|lesson&page=1&limit=20 |
| Response | Unified paginated list with submission_type field |
```

- [ ] **1.2: Implement backend unified query**

Combine 3 queries (reading, writing, lesson submissions), sort by created_at DESC, paginate.

- [ ] **1.3: Update frontend submissions page**

Add filter tabs: All | Reading | Writing | Lesson

- [ ] **1.4: Commit**

```bash
git commit -m "feat(instructor): add unified submission view across all types (I3)"
```

---

## Chunk 3: Priority 3 — Completeness

---

### Task 8: [F14] Auto-save Answers (localStorage)

**Context:** If learner refreshes page during reading practice or writing, all answers/essay text are lost. Need localStorage auto-save.

**Files:**
- Modify: `docs/step2_lowcode/business_rules.md` (add RD-007, WR-009)
- Create: `apps/frontend/src/hooks/useAutoSave.ts`
- Modify: `apps/frontend/src/app/reading/[id]/page.tsx`
- Modify: `apps/frontend/src/app/writing/[id]/page.tsx`

- [ ] **1.1: Add business rules RD-007 and WR-009**

```markdown
| RD-007 | Auto-save reading answers to localStorage every 5s; clear on submit | Frontend hook | — |
| WR-009 | Auto-save essay draft to localStorage every 5s; clear on submit | Frontend hook | — |
```

- [ ] **1.2: Create useAutoSave hook**

```typescript
export function useAutoSave<T>(key: string, data: T, intervalMs = 5000) {
  // Save to localStorage on interval
  // Restore on mount
  // Clear on explicit call
}
```

- [ ] **1.3: Integrate into reading and writing pages**
- [ ] **1.4: Commit**

```bash
git commit -m "feat(frontend): add auto-save for reading answers and writing drafts (F14)"
```

---

### Task 9: [A2] Content Versioning

**Context:** PRD ADM-003 requires tracking all content mutations with version history. Currently not implemented.

**Files:**
- Modify: `docs/step3_prd/09_api_specifications.md` (add content_versions section)
- Add Prisma migration: `content_versions` table
- Create: `apps/backend/src/admin/content-version.service.ts`
- Modify: `apps/backend/src/admin/admin.service.ts` (call version service on mutations)

- [ ] **1.1: Add ContentVersion model to Prisma schema**

```prisma
model ContentVersion {
  id          String   @id @default(uuid())
  entity_id   String
  entity_type String   // 'passage' | 'prompt'
  action      String   // 'create' | 'update' | 'publish' | 'unpublish' | 'delete'
  editor_id   String
  version     Int
  changes     Json?    // diff of what changed
  created_at  DateTime @default(now())

  editor      User     @relation(fields: [editor_id], references: [id])

  @@index([entity_id, entity_type])
  @@map("content_versions")
}
```

- [ ] **1.2: Create ContentVersionService**
- [ ] **1.3: Integrate into admin passage/prompt CRUD methods**
- [ ] **1.4: Add GET /admin/content/:entityType/:id/versions endpoint**
- [ ] **1.5: Commit**

```bash
git commit -m "feat(admin): add content versioning for passages and prompts (A2/ADM-003)"
```

---

### Task 10: [X1] Classroom Module PRD Documentation

**Context:** Classroom is the largest module but was added incrementally without a dedicated PRD document. Need to create comprehensive documentation.

**Files:**
- Create: `docs/step3_prd/18_classroom_module.md`
- Modify: `docs/step2_lowcode/business_rules.md` (consolidate classroom rules)
- Modify: `docs/step3_prd/01_executive_summary.md` (add Classroom to solution overview)

- [ ] **1.1: Create PRD-18 Classroom Module document**

Sections:
1. Overview & motivation
2. Classroom entity (create, edit, archive)
3. Member management (invite, join, remove, max capacity)
4. Topic management (CRUD, reorder, publish/draft)
5. Lesson management (CRUD, content types, link to library, reorder)
6. Lesson submissions (student submit, teacher grade)
7. Announcements
8. Student progress tracking
9. Business rules (CR-001 through CR-010)
10. API reference (consolidate from PRD-09 Section 10.x)
11. Screen specifications (consolidate from PRD-10 Section 9)

- [ ] **1.2: Consolidate classroom business rules in business_rules.md**

Add Section 6: Classroom Rules with all CR-xxx rules.

- [ ] **1.3: Update Executive Summary**

Add Section 4.5: Classroom Management in PRD-01.

- [ ] **1.4: Commit**

```bash
git commit -m "docs: add comprehensive Classroom module PRD-18 and update related documents (X1)"
```

---

## Execution Order & Dependencies

```
Task 1 (A6: Security) ─────────────────── Independent, do FIRST
Task 2 (L1 Backend) ──→ Task 3 (L1 Frontend)
Task 4 (F6: Cleanup) ─────────────────── Independent
Task 5 (F4: Queue) ───────────────────── Independent
Task 6 (I2: Notifications) ───────────── Independent
Task 7 (I3: Unified View) ────────────── Independent
Task 8 (F14: Auto-save) ──────────────── Independent
Task 9 (A2: Versioning) ──────────────── Independent
Task 10 (X1: PRD Docs) ───────────────── Independent, can be done anytime
```

**Parallel execution possible:** Tasks 1, 4, 5, 8, 10 are all independent and can run in parallel subagents.

**Sequential:** Task 2 must complete before Task 3 (backend before frontend).

---

## PRD Documents Affected (Summary)

| PRD Document | Tasks |
|-------------|-------|
| `03_user_personas_roles.md` | Task 1 (A6) |
| `07_non_functional_requirements.md` | Task 5 (F4) |
| `09_api_specifications.md` | Tasks 6, 7, 9 |
| `10_ui_ux_specifications.md` | Task 3 (L1) |
| `12_technical_constraints.md` | Task 4 (F6) |
| `01_executive_summary.md` | Task 10 (X1) |
| `step2_lowcode/business_rules.md` | Tasks 1, 4, 8 |
| `step2_lowcode/user_flows.md` | Task 6 (I2) |
| NEW: `18_classroom_module.md` | Task 10 (X1) |
