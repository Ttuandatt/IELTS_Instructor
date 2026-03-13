# Writing Scoring Pipeline — Design Spec

> **Date:** 2026-03-13
> **Status:** Approved
> **PRD Refs:** US-301, US-302, US-303, US-308
> **API Ref:** PRD-09 Section 6 & 9

---

## 1. Context

The codebase already has a working scoring pipeline using `@nestjs/bull` (Bull v4) + Redis. This spec covers three improvements:

1. **Bull to BullMQ migration** — better API, built-in rate limiting, flow support
2. **Job priority** — premium tier gets processed before cheap tier
3. **SSE endpoint** — replace client polling with server-sent events

### Out of Scope

- Separate worker process (deferred to future scaling needs)
- WebSocket gateway (SSE is sufficient for one-way notifications)
- Dead letter queue UI (logs suffice for MVP)
- Changes to LLM client or rubric prompts
- LessonSubmission AI scoring — the `lesson_submissions` table currently has a teacher-graded schema (`score Float?`, `feedback String?`, `status: submitted|graded`) with no AI scoring fields. Extending it for AI scoring requires a separate Prisma migration and is out of scope for this spec. The queue architecture supports future extension via the `source` discriminator.

---

## 2. Architecture

```
Client
  │
  ├── POST /writing/prompts/:id/submit ──► WritingService
  │                                            │
  │                                     Create WritingSubmission (pending)
  │                                            │
  │                                     ScoringProducer.enqueue()
  │                                            │
  │   ◄── 202 { submission_id } ───────────────┘
  │
  ├── GET /writing/submissions/:id/events (SSE)
  │         │
  │         ▼
  │   1. Check DB — if already done/failed, emit immediately
  │   2. Otherwise subscribe Redis pub/sub
  │         channel: scoring:status:{submissionId}
  │
  │                              BullMQ Queue (writing-scoring)
  │                               ┌──────────┴──────────┐
  │                           priority:1            priority:5
  │                           (premium)             (cheap)
  │                               └──────────┬──────────┘
  │                                    ScoringConsumer
  │                                          │
  │                                    LlmClientService.scoreEssay()
  │                                          │
  │                                    Update DB (done/failed)
  │                                          │
  │                                    Redis PUBLISH scoring:status:{id}
  │                                          │
  │   ◄── SSE event: {status, submission_id} ┘
```

---

## 3. Dependency Changes

### Remove

- `@nestjs/bull` (currently at `^11.0.4` in `package.json`)

### Add

- `@nestjs/bullmq`

### Already present (no change)

- `bullmq` (`^5.70.0`)
- `ioredis` (`^5.9.3`)

No new infrastructure required — same Redis instance.

---

## 4. File Changes

### 4.0 `app.module.ts` — Global BullMQ Registration

The global `BullModule.forRootAsync` in `app.module.ts` must be migrated from `@nestjs/bull` to `@nestjs/bullmq`. This sets the default Redis connection for all queues — per-queue modules then use `registerQueue({ name })` without repeating the connection config.

```typescript
// Before (@nestjs/bull)
import { BullModule } from '@nestjs/bull';
BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    redis: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
  }),
  inject: [ConfigService],
}),

// After (@nestjs/bullmq)
import { BullModule } from '@nestjs/bullmq';
BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    connection: {
      host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
      port: parseInt(new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).port || '6379'),
    },
  }),
  inject: [ConfigService],
}),
```

### 4.1 `scoring.module.ts`

Simplify to use `registerQueue` (inherits global connection from `app.module.ts`):

```typescript
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: SCORING_QUEUE }),
  ],
  providers: [LlmClientService, ScoringProducerService, ScoringConsumer],
  exports: [ScoringProducerService, LlmClientService],
})
```

### 4.2 `scoring.producer.ts`

```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const SCORING_QUEUE = 'writing-scoring';

export interface ScoringJobData {
  submissionId: string;
  userId: string;
  promptId: string;
  essayContent: string;
  promptText: string;
  modelTier: 'cheap' | 'premium';
}

@Injectable()
export class ScoringProducerService {
  private readonly logger = new Logger(ScoringProducerService.name);

  constructor(@InjectQueue(SCORING_QUEUE) private readonly queue: Queue) {}

  async enqueue(data: ScoringJobData): Promise<void> {
    await this.queue.add('score-essay', data, {
      priority: data.modelTier === 'premium' ? 1 : 5,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
    this.logger.log(`Enqueued scoring job for submission ${data.submissionId} (priority: ${data.modelTier})`);
  }
}
```

### 4.3 `scoring.consumer.ts`

Key pattern change: Bull's `@Process()` decorator is replaced by extending `WorkerHost` and overriding the `process()` method. This is the standard BullMQ pattern in `@nestjs/bullmq`.

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import Redis from 'ioredis';

@Processor(SCORING_QUEUE, { concurrency: 3 })
export class ScoringConsumer extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(ScoringConsumer.name);
  private readonly redisPub: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmClient: LlmClientService,
    private readonly config: ConfigService,
  ) {
    super();
    this.redisPub = new Redis(config.get<string>('REDIS_URL', 'redis://localhost:6379'));
  }

  onModuleDestroy() {
    this.redisPub.disconnect();
  }

  async process(job: Job<ScoringJobData>): Promise<void> {
    const { submissionId, essayContent, promptText, modelTier } = job.data;
    const startTime = Date.now();

    this.logger.log(`Processing scoring job for submission ${submissionId} (attempt ${job.attemptsMade + 1})`);

    try {
      const { feedback, modelName } = await this.llmClient.scoreEssay({
        promptText, essayContent, modelTier,
      });
      const turnaroundMs = Date.now() - startTime;

      await this.prisma.writingSubmission.update({
        where: { id: submissionId },
        data: {
          scores: { TR: feedback.TR, CC: feedback.CC, LR: feedback.LR, GRA: feedback.GRA, overall: feedback.overall },
          feedback: { summary: feedback.summary, strengths: feedback.strengths, improvements: feedback.improvements, suggestions: feedback.suggestions },
          processing_status: 'done',
          model_name: modelName,
          turnaround_ms: turnaroundMs,
          scored_at: new Date(),
        },
      });

      this.logger.log(`Scored submission ${submissionId} — overall: ${feedback.overall}, model: ${modelName}, time: ${turnaroundMs}ms`);

      // Notify SSE subscribers
      await this.redisPub.publish(
        `scoring:status:${submissionId}`,
        JSON.stringify({ processing_status: 'done', submission_id: submissionId }),
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Scoring failed for ${submissionId}: ${error.message}`);

      if (job.attemptsMade >= (job.opts.attempts ?? 1) - 1) {
        await this.prisma.writingSubmission.update({
          where: { id: submissionId },
          data: { processing_status: 'failed', error_message: error.message },
        });
        this.logger.error(`Marked submission ${submissionId} as failed after all retries`);

        await this.redisPub.publish(
          `scoring:status:${submissionId}`,
          JSON.stringify({ processing_status: 'failed', submission_id: submissionId }),
        );
      }

      throw err; // Re-throw so BullMQ handles retry
    }
  }
}
```

### 4.4 `writing.controller.ts` — New SSE Endpoint

**Auth consideration:** Browser `EventSource` API cannot send custom `Authorization` headers. The frontend must use `fetch()` with the `ReadableStream` API instead, which can include headers. The SSE endpoint keeps `@UseGuards(JwtAuthGuard)` from the class-level decorator — this works because `fetch()` sends the Bearer token normally.

**Race condition fix:** Before subscribing to Redis pub/sub, the endpoint checks the current DB status. If the submission is already `done` or `failed`, it emits the event immediately without waiting for a publish.

**Connection management:** Each SSE connection creates a dedicated Redis subscriber (one connection per pending submission). This is acceptable for MVP traffic (< 100 concurrent SSE connections). For higher scale, a shared subscriber with channel multiplexing should be used.

**Controller dependency:** `ConfigService` must be added to the controller constructor (currently only `WritingService` is injected).

```typescript
constructor(
  private readonly writingService: WritingService,
  private readonly config: ConfigService,
) {}

@Sse('submissions/:id/events')
subscribeToScoring(
  @Request() req: any,
  @Param('id') submissionId: string,
): Observable<MessageEvent> {
  return new Observable((subscriber) => {
    // 1. Check current status first (race condition fix)
    this.writingService.getSubmission(req.user.sub, submissionId).then((sub) => {
      if (sub.processing_status === 'done' || sub.processing_status === 'failed') {
        subscriber.next({
          data: JSON.stringify({ processing_status: sub.processing_status, submission_id: submissionId }),
          type: 'status',
        });
        subscriber.complete();
        return;
      }

      // 2. Subscribe to Redis pub/sub for future updates
      const redisSub = new Redis(this.config.get('REDIS_URL'));
      const channel = `scoring:status:${submissionId}`;

      redisSub.subscribe(channel);
      redisSub.on('message', (_ch, message) => {
        subscriber.next({ data: message, type: 'status' });
        redisSub.unsubscribe(channel);
        redisSub.disconnect();
        subscriber.complete();
      });

      // 3. Timeout after 5 minutes
      const timeout = setTimeout(() => {
        subscriber.next({
          data: JSON.stringify({ processing_status: 'timeout' }),
          type: 'status',
        });
        redisSub.unsubscribe(channel);
        redisSub.disconnect();
        subscriber.complete();
      }, 5 * 60 * 1000);

      // 4. Cleanup on unsubscribe
      subscriber.add(() => {
        clearTimeout(timeout);
        redisSub.unsubscribe(channel);
        redisSub.disconnect();
      });
    }).catch((err) => {
      subscriber.error(err);
    });
  });
}
```

**Frontend usage (fetch + ReadableStream):**
```typescript
const response = await fetch(`/api/writing/submissions/${id}/events`, {
  headers: { Authorization: `Bearer ${token}` },
});
const reader = response.body!.getReader();
const decoder = new TextDecoder();
// Read SSE frames from the stream...
```

Fallback: client can still poll `GET /writing/submissions/:id` if SSE fails.

### 4.5 `writing.service.ts`

No change needed — the existing `submitEssay()` method already calls `scoringProducer.enqueue()` with the correct data shape. The `ScoringJobData` interface removes the `source`/`lessonId` fields (LessonSubmission scoring is out of scope).

### 4.6 Upload module alignment

The upload module (`upload.module.ts`) also uses `@nestjs/bull` for DOCX conversion (`FILE_CONVERSION_QUEUE`). This migration must update it as well to avoid having two Bull versions:

- `upload.module.ts`: Replace `BullModule.registerQueue` import from `@nestjs/bullmq` (inherits global connection).
- `conversion.processor.ts`: Replace `@Processor` + `@Process({ concurrency: 2 })` with `@Processor(FILE_CONVERSION_QUEUE, { concurrency: 2 })` extending `WorkerHost`. The `handle()` method becomes `process()` and returns `FileConversionResult` via the `process()` return value (BullMQ `WorkerHost.process()` supports return values, stored as job result).
- `conversion.producer.ts`: Replace `@InjectQueue` and `Queue` imports from `@nestjs/bullmq` and `bullmq`.

---

## 5. Error Handling

| Scenario | Handling |
|----------|----------|
| LLM returns invalid JSON | Schema validator throws, BullMQ retries (max 3) |
| LLM timeout | BullMQ `stalledInterval` detects hung job, retries |
| All retries exhausted | Mark `failed` + `error_message`, publish SSE failure event |
| Redis down | BullMQ auto-reconnects; API returns 503 if enqueue fails |
| SSE connection drops | Client falls back to polling `GET /submissions/:id` |
| SSE timeout (5 min) | Push timeout event, close connection |
| Job completes before SSE subscribes | SSE checks DB first, emits immediately if done/failed |

---

## 6. Queue Configuration

| Setting | Value | Where configured |
|---------|-------|-----------------|
| Queue name | `writing-scoring` | `scoring.producer.ts` constant |
| Concurrency | 3 (configurable via env `SCORING_CONCURRENCY`) | `@Processor(QUEUE, { concurrency })` |
| Max attempts | 3 | `queue.add()` options |
| Backoff | Exponential, 5000ms base | `queue.add()` options |
| Priority — premium | 1 | `queue.add()` options |
| Priority — cheap | 5 | `queue.add()` options |
| Remove on complete | Keep last 100 | `queue.add()` options |
| Remove on fail | Keep last 50 | `queue.add()` options |

| Lock duration | 120,000 ms | `@Processor(QUEUE, { lockDuration: 120000 })` |

Note: BullMQ does not have a per-job timeout like Bull's `timeout` option. Instead, `lockDuration` (default 30s) determines how long a job can run before being considered stalled. Set to 120s for long LLM calls. Alternatively, the consumer can call `job.updateProgress()` periodically to extend the lock.

---

## 7. Migration Strategy

Since the project is in development (no production traffic):

1. Drain any existing Bull queue jobs (run pending jobs to completion)
2. Remove `@nestjs/bull` dependency
3. Add `@nestjs/bullmq`
4. Update all imports and decorators in both `scoring` and `upload` modules
5. Test full flow end-to-end
6. Flush Bull queue data from Redis (`DEL bull:*` keys) to avoid stale data from the old format

---

## 8. Testing Strategy

| Test | Type | Description |
|------|------|-------------|
| `ScoringProducer.enqueue()` | Unit | Mock queue, verify job data + priority |
| `ScoringConsumer.process()` | Unit | Mock LlmClient + Prisma, verify DB update + Redis publish |
| Consumer retry exhaustion | Unit | Verify `failed` status after max attempts |
| `POST /writing/prompts/:id/submit` | Integration | Verify 202 response + job enqueued |
| SSE — normal flow | Integration | Submit → subscribe SSE → verify event on completion |
| SSE — race condition | Integration | Complete job first → subscribe SSE → verify immediate emit |
| SSE — timeout | Integration | Subscribe SSE with no job completion → verify timeout event |
| SSE — unauthorized | Integration | Verify 401 for wrong user's submission |
| Full flow | E2E/Smoke | Submit essay → queue → mock LLM → verify done status via SSE |
