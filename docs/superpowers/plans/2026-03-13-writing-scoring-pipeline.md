# Writing Scoring Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing Bull-based writing scoring pipeline to BullMQ, add job priority (premium/cheap), and add an SSE endpoint for real-time scoring status notifications.

**Architecture:** The existing NestJS backend has a working scoring pipeline using `@nestjs/bull`. We migrate to `@nestjs/bullmq` across both `scoring` and `upload` modules, add priority to scoring jobs, and add an SSE endpoint on the writing controller that checks DB first (race condition fix) then subscribes to Redis pub/sub for real-time updates.

**Tech Stack:** NestJS 11, `@nestjs/bullmq`, `bullmq` 5.x, `ioredis` 5.x, Prisma, Jest

**Spec:** `docs/superpowers/specs/2026-03-13-writing-scoring-pipeline-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `apps/backend/package.json` | Swap `@nestjs/bull` → `@nestjs/bullmq` |
| Modify | `apps/backend/src/app.module.ts` | Global BullMQ connection config |
| Modify | `apps/backend/src/scoring/scoring.module.ts` | Simplify to `registerQueue` |
| Modify | `apps/backend/src/scoring/scoring.producer.ts` | BullMQ imports + job priority |
| Modify | `apps/backend/src/scoring/scoring.consumer.ts` | WorkerHost pattern + Redis pub/sub |
| Modify | `apps/backend/src/writing/writing.controller.ts` | Add SSE endpoint + ConfigService |
| Modify | `apps/backend/src/upload/upload.module.ts` | BullMQ import |
| Modify | `apps/backend/src/upload/conversion.producer.ts` | BullMQ imports |
| Modify | `apps/backend/src/upload/conversion.processor.ts` | WorkerHost pattern |
| Modify | `apps/backend/src/upload/conversion.types.ts` | BullMQ Job type |
| Modify | `apps/backend/src/upload/conversion-status.service.ts` | BullMQ Queue API |
| Create | `apps/backend/src/scoring/scoring.producer.spec.ts` | Unit tests for producer |
| Create | `apps/backend/src/scoring/scoring.consumer.spec.ts` | Unit tests for consumer |
| Create | `apps/backend/src/writing/writing.controller.spec.ts` | SSE endpoint tests |

---

## Chunk 1: Dependency Swap & Global Config

### Task 1: Swap npm dependencies

**Files:**
- Modify: `apps/backend/package.json`

- [ ] **Step 1: Uninstall `@nestjs/bull`**

```bash
cd apps/backend && npm uninstall @nestjs/bull
```

- [ ] **Step 2: Install `@nestjs/bullmq`**

```bash
cd apps/backend && npm install @nestjs/bullmq
```

Note: `bullmq` and `ioredis` are already in `package.json` — no need to install them.

- [ ] **Step 3: Verify package.json**

Run: `cd apps/backend && node -e "const p=require('./package.json'); console.log('@nestjs/bull:', p.dependencies['@nestjs/bull']); console.log('@nestjs/bullmq:', p.dependencies['@nestjs/bullmq']); console.log('bullmq:', p.dependencies['bullmq']);"`

Expected:
```
@nestjs/bull: undefined
@nestjs/bullmq: ^11.x.x
bullmq: ^5.70.0
```

- [ ] **Step 4: Commit**

```bash
git add apps/backend/package.json apps/backend/package-lock.json
git commit -m "chore: swap @nestjs/bull for @nestjs/bullmq"
```

---

### Task 2: Migrate `app.module.ts` global Bull config

**Files:**
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Update imports and connection config**

Replace the import and `BullModule.forRootAsync` block:

```typescript
// OLD (line 3):
import { BullModule } from '@nestjs/bull';

// NEW:
import { BullModule } from '@nestjs/bullmq';
```

Replace the `useFactory` (lines 27-33):

```typescript
// OLD:
BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    redis: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
  }),
  inject: [ConfigService],
}),

// NEW:
BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => {
    const url = new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379'));
    return {
      connection: {
        host: url.hostname,
        port: parseInt(url.port || '6379'),
      },
    };
  },
  inject: [ConfigService],
}),
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/backend && npx tsc --noEmit 2>&1 | head -20`

Expected: Compilation errors in `scoring/` and `upload/` modules (they still import from `@nestjs/bull`). That's expected — we fix those in the next tasks.

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/app.module.ts
git commit -m "feat: migrate app.module.ts to @nestjs/bullmq global config"
```

---

## Chunk 2: Scoring Module Migration

### Task 3: Migrate `scoring.module.ts`

**Files:**
- Modify: `apps/backend/src/scoring/scoring.module.ts`

- [ ] **Step 1: Update imports and simplify queue registration**

Replace the entire file content:

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma';
import { LlmClientService } from './llm-client.service';
import { ScoringProducerService, SCORING_QUEUE } from './scoring.producer';
import { ScoringConsumer } from './scoring.consumer';

@Module({
    imports: [
        PrismaModule,
        BullModule.registerQueue({ name: SCORING_QUEUE }),
    ],
    providers: [LlmClientService, ScoringProducerService, ScoringConsumer],
    exports: [ScoringProducerService, LlmClientService],
})
export class ScoringModule { }
```

Note: This simplification (from `registerQueueAsync` with connection config to `registerQueue` with just the name) is safe because `app.module.ts` now has the global BullMQ connection config via `BullModule.forRootAsync`. All queues inherit it.

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/scoring/scoring.module.ts
git commit -m "feat: migrate scoring.module.ts to @nestjs/bullmq"
```

---

### Task 4: Migrate `scoring.producer.ts` with priority support

**Files:**
- Modify: `apps/backend/src/scoring/scoring.producer.ts`
- Create: `apps/backend/src/scoring/scoring.producer.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/backend/src/scoring/scoring.producer.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { ScoringProducerService, SCORING_QUEUE, ScoringJobData } from './scoring.producer';

describe('ScoringProducerService', () => {
    let service: ScoringProducerService;
    const mockQueue = { add: jest.fn().mockResolvedValue(undefined) };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScoringProducerService,
                { provide: getQueueToken(SCORING_QUEUE), useValue: mockQueue },
            ],
        }).compile();

        service = module.get(ScoringProducerService);
        mockQueue.add.mockClear();
    });

    it('should enqueue a cheap job with priority 5', async () => {
        const data: ScoringJobData = {
            submissionId: 'sub-1',
            userId: 'user-1',
            promptId: 'prompt-1',
            essayContent: 'test essay',
            promptText: 'test prompt',
            modelTier: 'cheap',
        };

        await service.enqueue(data);

        expect(mockQueue.add).toHaveBeenCalledWith('score-essay', data, expect.objectContaining({
            priority: 5,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        }));
    });

    it('should enqueue a premium job with priority 1', async () => {
        const data: ScoringJobData = {
            submissionId: 'sub-2',
            userId: 'user-1',
            promptId: 'prompt-1',
            essayContent: 'test essay',
            promptText: 'test prompt',
            modelTier: 'premium',
        };

        await service.enqueue(data);

        expect(mockQueue.add).toHaveBeenCalledWith('score-essay', data, expect.objectContaining({
            priority: 1,
        }));
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/backend && npx jest src/scoring/scoring.producer.spec.ts --no-cache 2>&1 | tail -10`

Expected: FAIL (imports from `@nestjs/bull` still in producer, or module resolution errors).

- [ ] **Step 3: Update `scoring.producer.ts`**

Replace the entire file:

```typescript
import { Injectable, Logger } from '@nestjs/common';
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

    constructor(
        @InjectQueue(SCORING_QUEUE) private readonly scoringQueue: Queue,
    ) { }

    async enqueue(data: ScoringJobData): Promise<void> {
        await this.scoringQueue.add('score-essay', data, {
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

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/backend && npx jest src/scoring/scoring.producer.spec.ts --no-cache 2>&1 | tail -10`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/scoring/scoring.producer.ts apps/backend/src/scoring/scoring.producer.spec.ts
git commit -m "feat: migrate scoring.producer to BullMQ with job priority"
```

---

### Task 5: Migrate `scoring.consumer.ts` with Redis pub/sub

**Files:**
- Modify: `apps/backend/src/scoring/scoring.consumer.ts`
- Create: `apps/backend/src/scoring/scoring.consumer.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/backend/src/scoring/scoring.consumer.spec.ts`:

```typescript
import { ScoringConsumer } from './scoring.consumer';
import { ScoringJobData } from './scoring.producer';

describe('ScoringConsumer', () => {
    let consumer: ScoringConsumer;
    const mockPrisma = {
        writingSubmission: {
            update: jest.fn().mockResolvedValue({}),
        },
    };
    const mockLlmClient = {
        scoreEssay: jest.fn(),
    };
    const mockConfig = {
        get: jest.fn().mockReturnValue('redis://localhost:6379'),
    };
    const mockRedisPub = {
        publish: jest.fn().mockResolvedValue(1),
        disconnect: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        consumer = new ScoringConsumer(
            mockPrisma as any,
            mockLlmClient as any,
            mockConfig as any,
        );
        // Replace the real Redis instance with mock
        (consumer as any).redisPub = mockRedisPub;
    });

    it('should score essay, update DB, and publish Redis event on success', async () => {
        mockLlmClient.scoreEssay.mockResolvedValue({
            feedback: {
                TR: 6.5, CC: 6.0, LR: 7.0, GRA: 6.0, overall: 6.5,
                summary: 'Good essay',
                strengths: ['Clear thesis'],
                improvements: ['More examples'],
                suggestions: 'Practice more',
            },
            modelName: 'gpt-4o-mini',
        });

        const mockJob = {
            data: {
                submissionId: 'sub-1',
                userId: 'user-1',
                promptId: 'prompt-1',
                essayContent: 'My essay content',
                promptText: 'Write about...',
                modelTier: 'cheap',
            } as ScoringJobData,
            attemptsMade: 0,
            opts: { attempts: 3 },
        };

        await consumer.process(mockJob as any);

        // Verify DB update
        expect(mockPrisma.writingSubmission.update).toHaveBeenCalledWith({
            where: { id: 'sub-1' },
            data: expect.objectContaining({
                processing_status: 'done',
                model_name: 'gpt-4o-mini',
                scores: expect.objectContaining({ TR: 6.5, overall: 6.5 }),
            }),
        });

        // Verify Redis publish
        expect(mockRedisPub.publish).toHaveBeenCalledWith(
            'scoring:status:sub-1',
            expect.stringContaining('"processing_status":"done"'),
        );
    });

    it('should mark as failed and publish event on last retry', async () => {
        mockLlmClient.scoreEssay.mockRejectedValue(new Error('LLM unavailable'));

        const mockJob = {
            data: {
                submissionId: 'sub-2',
                userId: 'user-1',
                promptId: 'prompt-1',
                essayContent: 'My essay',
                promptText: 'Write about...',
                modelTier: 'cheap',
            } as ScoringJobData,
            attemptsMade: 2, // Last attempt (0-indexed, attempts=3)
            opts: { attempts: 3 },
        };

        await expect(consumer.process(mockJob as any)).rejects.toThrow('LLM unavailable');

        // Verify marked as failed
        expect(mockPrisma.writingSubmission.update).toHaveBeenCalledWith({
            where: { id: 'sub-2' },
            data: expect.objectContaining({
                processing_status: 'failed',
                error_message: 'LLM unavailable',
            }),
        });

        // Verify failure event published
        expect(mockRedisPub.publish).toHaveBeenCalledWith(
            'scoring:status:sub-2',
            expect.stringContaining('"processing_status":"failed"'),
        );
    });

    it('should NOT mark as failed on non-final retry', async () => {
        mockLlmClient.scoreEssay.mockRejectedValue(new Error('Temporary error'));

        const mockJob = {
            data: {
                submissionId: 'sub-3',
                userId: 'user-1',
                promptId: 'prompt-1',
                essayContent: 'My essay',
                promptText: 'Write about...',
                modelTier: 'cheap',
            } as ScoringJobData,
            attemptsMade: 0, // First attempt
            opts: { attempts: 3 },
        };

        await expect(consumer.process(mockJob as any)).rejects.toThrow('Temporary error');

        // Should NOT update DB or publish
        expect(mockPrisma.writingSubmission.update).not.toHaveBeenCalled();
        expect(mockRedisPub.publish).not.toHaveBeenCalled();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/backend && npx jest src/scoring/scoring.consumer.spec.ts --no-cache 2>&1 | tail -10`

Expected: FAIL (consumer still uses old Bull decorators).

- [ ] **Step 3: Update `scoring.consumer.ts`**

Replace the entire file:

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import Redis from 'ioredis';
import { PrismaService } from '../prisma';
import { LlmClientService } from './llm-client.service';
import { SCORING_QUEUE, ScoringJobData } from './scoring.producer';

@Processor(SCORING_QUEUE, {
    concurrency: parseInt(process.env.SCORING_CONCURRENCY || '3'),
    lockDuration: 120000,
})
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
                promptText,
                essayContent,
                modelTier,
            });

            const turnaroundMs = Date.now() - startTime;

            await this.prisma.writingSubmission.update({
                where: { id: submissionId },
                data: {
                    scores: {
                        TR: feedback.TR,
                        CC: feedback.CC,
                        LR: feedback.LR,
                        GRA: feedback.GRA,
                        overall: feedback.overall,
                    },
                    feedback: {
                        summary: feedback.summary,
                        strengths: feedback.strengths,
                        improvements: feedback.improvements,
                        suggestions: feedback.suggestions,
                    },
                    processing_status: 'done',
                    model_name: modelName,
                    turnaround_ms: turnaroundMs,
                    scored_at: new Date(),
                },
            });

            this.logger.log(
                `Scored submission ${submissionId} — overall: ${feedback.overall}, model: ${modelName}, time: ${turnaroundMs}ms`,
            );

            await this.redisPub.publish(
                `scoring:status:${submissionId}`,
                JSON.stringify({ processing_status: 'done', submission_id: submissionId }),
            );
        } catch (err) {
            const error = err as Error;
            this.logger.error(`Scoring failed for ${submissionId}: ${error.message}`);

            // Only mark as failed on the last attempt
            if (job.attemptsMade >= (job.opts.attempts ?? 1) - 1) {
                await this.prisma.writingSubmission.update({
                    where: { id: submissionId },
                    data: {
                        processing_status: 'failed',
                        error_message: error.message,
                    },
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

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/backend && npx jest src/scoring/scoring.consumer.spec.ts --no-cache 2>&1 | tail -10`

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/scoring/scoring.consumer.ts apps/backend/src/scoring/scoring.consumer.spec.ts
git commit -m "feat: migrate scoring.consumer to BullMQ WorkerHost with Redis pub/sub"
```

---

## Chunk 3: Upload Module Migration

### Task 6: Migrate upload module to BullMQ

**Files:**
- Modify: `apps/backend/src/upload/upload.module.ts`
- Modify: `apps/backend/src/upload/conversion.types.ts`
- Modify: `apps/backend/src/upload/conversion.producer.ts`
- Modify: `apps/backend/src/upload/conversion.processor.ts`
- Modify: `apps/backend/src/upload/conversion-status.service.ts`

- [ ] **Step 1: Update `conversion.types.ts`**

Replace Bull `Job` type with BullMQ:

```typescript
import { Job } from 'bullmq';

export const FILE_CONVERSION_QUEUE = 'file-conversion';

export interface FileConversionJobData {
    filePath: string;
    originalName: string;
    mimeType?: string;
}

export type FileConversionJob = Job<FileConversionJobData>;

export interface FileConversionResult {
    pdfUrl?: string | null;
    htmlUrl?: string | null;
    textUrl?: string | null;
    imageUrls?: string[];
    completedAt: string;
}

export interface FileConversionStatusResponse {
    id: string;
    state: string;
    progress: number | object;
    attemptsMade: number;
    result?: FileConversionResult | null;
    failedReason?: string;
}
```

- [ ] **Step 2: Update `upload.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UploadController } from './upload.controller';
import { DocxParserService } from './docx-parser.service';
import { FILE_CONVERSION_QUEUE } from './conversion.types';
import { FileConversionProducerService } from './conversion.producer';
import { FileConversionStatusService } from './conversion-status.service';
import { FileConversionProcessor } from './conversion.processor';

@Module({
    imports: [
        BullModule.registerQueue({ name: FILE_CONVERSION_QUEUE }),
    ],
    controllers: [UploadController],
    providers: [DocxParserService, FileConversionProducerService, FileConversionStatusService, FileConversionProcessor],
})
export class UploadModule { }
```

- [ ] **Step 3: Update `conversion.producer.ts`**

```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Queue } from 'bullmq';
import { FILE_CONVERSION_QUEUE, FileConversionJobData } from './conversion.types';

@Injectable()
export class FileConversionProducerService {
    private readonly logger = new Logger(FileConversionProducerService.name);

    constructor(
        @InjectQueue(FILE_CONVERSION_QUEUE) private readonly queue: Queue,
    ) { }

    async enqueue(data: FileConversionJobData): Promise<string> {
        const jobId = randomUUID();
        await this.queue.add('convert', data, {
            jobId,
            removeOnFail: 50,
            removeOnComplete: false,
            attempts: 1,
        });
        this.logger.log(`Queued file conversion for ${data.originalName} (job ${jobId})`);
        return jobId;
    }
}
```

- [ ] **Step 4: Update `conversion.processor.ts`**

Replace the `@Processor`/`@Process` decorators with `WorkerHost` pattern. Only the class declaration and method signature change — the internal conversion logic stays identical:

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { basename, extname, join } from 'path';
import { spawn } from 'child_process';
import * as mammoth from 'mammoth';
import { Job } from 'bullmq';
import { FILE_CONVERSION_QUEUE, FileConversionJobData, FileConversionResult } from './conversion.types';

@Processor(FILE_CONVERSION_QUEUE, { concurrency: 2 })
export class FileConversionProcessor extends WorkerHost {
    private readonly logger = new Logger(FileConversionProcessor.name);
    private readonly uploadsRoot = join(process.cwd(), 'uploads');
    private readonly convertedRoot = join(this.uploadsRoot, 'converted');

    async process(job: Job<FileConversionJobData>): Promise<FileConversionResult> {
        const jobDir = await this.ensureJobDir(job.id!.toString());
        const ext = extname(job.data.originalName).toLowerCase();

        let pdfPath: string | null = null;
        let htmlPath: string | null = null;
        let textPath: string | null = null;

        try {
            if (ext === '.pdf') {
                pdfPath = await this.copyInto(job.data.filePath, jobDir, 'source.pdf');
            } else if (ext === '.docx' || ext === '.doc') {
                pdfPath = await this.convertWithLibreOffice(job.data.filePath, jobDir, job.data.originalName);
                if (ext === '.docx') {
                    htmlPath = await this.renderDocxToHtml(job.data.filePath, jobDir);
                    textPath = await this.renderDocxToText(job.data.filePath, jobDir);
                }
            } else if (ext === '.txt') {
                textPath = await this.copyInto(job.data.filePath, jobDir, 'source.txt');
                htmlPath = await this.wrapTextAsHtml(job.data.filePath, jobDir);
            } else {
                await this.copyInto(job.data.filePath, jobDir, basename(job.data.filePath));
            }
        } catch (err) {
            const error = err as Error;
            this.logger.error(`Conversion failed for ${job.data.originalName}: ${error.message}`);
            throw error;
        }

        return {
            pdfUrl: pdfPath ? this.toPublicUrl(pdfPath) : null,
            htmlUrl: htmlPath ? this.toPublicUrl(htmlPath) : null,
            textUrl: textPath ? this.toPublicUrl(textPath) : null,
            completedAt: new Date().toISOString(),
        };
    }

    // Keep all private methods unchanged: ensureJobDir, copyInto,
    // convertWithLibreOffice, renderDocxToHtml, renderDocxToText,
    // wrapTextAsHtml, toPublicUrl
    // (copy from existing file — no changes needed)
```

**Important:** Do NOT replace the entire file. Use surgical edits to preserve the private methods. The changes are:

1. Replace imports (lines 1-8):
   - `import { Process, Processor } from '@nestjs/bull';` → `import { Processor, WorkerHost } from '@nestjs/bullmq';`
   - `import type { FileConversionJob, FileConversionResult } from './conversion.types';` → `import { Job } from 'bullmq';` + `import { FILE_CONVERSION_QUEUE, FileConversionJobData, FileConversionResult } from './conversion.types';`
   - Remove: `import { FILE_CONVERSION_QUEUE } from './conversion.types';` (merged into above)
2. Replace class declaration (line 10-11):
   - `@Processor(FILE_CONVERSION_QUEUE)` → `@Processor(FILE_CONVERSION_QUEUE, { concurrency: 2 })`
   - `export class FileConversionProcessor {` → `export class FileConversionProcessor extends WorkerHost {`
3. Remove `constructor() { }` (line 16) — WorkerHost has its own constructor
4. Replace method signature (lines 18-19):
   - `@Process({ concurrency: 2 })` → remove this decorator entirely
   - `async handle(job: FileConversionJob): Promise<FileConversionResult> {` → `async process(job: Job<FileConversionJobData>): Promise<FileConversionResult> {`
5. Update `job.id` usage (line 20):
   - `job.id.toString()` → `job.id!.toString()` (BullMQ `job.id` is `string | undefined`)

- [ ] **Step 5: Update `conversion-status.service.ts`**

```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { FILE_CONVERSION_QUEUE, FileConversionResult, FileConversionStatusResponse } from './conversion.types';

@Injectable()
export class FileConversionStatusService {
    constructor(
        @InjectQueue(FILE_CONVERSION_QUEUE) private readonly queue: Queue,
    ) { }

    async getStatus(jobId: string): Promise<FileConversionStatusResponse> {
        const job = await this.queue.getJob(jobId);
        if (!job) {
            throw new NotFoundException('Conversion job not found');
        }

        const state = await job.getState();
        let result: FileConversionResult | null = null;
        if (state === 'completed') {
            result = (job.returnvalue as FileConversionResult) ?? null;
        }

        return {
            id: job.id!.toString(),
            state,
            progress: job.progress,
            attemptsMade: job.attemptsMade,
            result,
            failedReason: state === 'failed' ? job.failedReason : undefined,
        };
    }
}
```

Note: In BullMQ, `job.progress` is a property (not a method call `job.progress()`).

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd apps/backend && npx tsc --noEmit 2>&1 | tail -20`

Expected: No errors (all Bull imports now point to BullMQ).

- [ ] **Step 7: Commit**

```bash
git add apps/backend/src/upload/
git commit -m "feat: migrate upload module to @nestjs/bullmq"
```

---

## Chunk 4: SSE Endpoint

### Task 7: Add SSE endpoint to WritingController

**Files:**
- Modify: `apps/backend/src/writing/writing.controller.ts`
- Create: `apps/backend/src/writing/writing.controller.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/backend/src/writing/writing.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WritingController } from './writing.controller';
import { WritingService } from './writing.service';
import { firstValueFrom } from 'rxjs';

// Mock JwtAuthGuard to be a pass-through
jest.mock('../auth/guards/jwt-auth.guard', () => ({
    JwtAuthGuard: jest.fn().mockImplementation(() => ({
        canActivate: () => true,
    })),
}));

describe('WritingController - SSE', () => {
    let controller: WritingController;
    const mockWritingService = {
        getSubmission: jest.fn(),
        listPrompts: jest.fn(),
        getPrompt: jest.fn(),
        submitEssay: jest.fn(),
        getHistory: jest.fn(),
    };
    const mockConfig = {
        get: jest.fn().mockReturnValue('redis://localhost:6379'),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WritingController],
            providers: [
                { provide: WritingService, useValue: mockWritingService },
                { provide: ConfigService, useValue: mockConfig },
            ],
        }).compile();

        controller = module.get(WritingController);
    });

    it('should emit immediately if submission is already done', async () => {
        mockWritingService.getSubmission.mockResolvedValue({
            id: 'sub-1',
            processing_status: 'done',
        });

        const req = { user: { sub: 'user-1' } };
        const observable = controller.subscribeToScoring(req, 'sub-1');
        const event = await firstValueFrom(observable);

        expect(event.type).toBe('status');
        const data = JSON.parse(event.data as string);
        expect(data.processing_status).toBe('done');
        expect(data.submission_id).toBe('sub-1');
    });

    it('should emit immediately if submission is already failed', async () => {
        mockWritingService.getSubmission.mockResolvedValue({
            id: 'sub-2',
            processing_status: 'failed',
        });

        const req = { user: { sub: 'user-1' } };
        const observable = controller.subscribeToScoring(req, 'sub-2');
        const event = await firstValueFrom(observable);

        const data = JSON.parse(event.data as string);
        expect(data.processing_status).toBe('failed');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/backend && npx jest src/writing/writing.controller.spec.ts --no-cache 2>&1 | tail -10`

Expected: FAIL — `subscribeToScoring` method does not exist.

- [ ] **Step 3: Update `writing.controller.ts`**

Replace the entire file:

```typescript
import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    Sse,
    MessageEvent,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import Redis from 'ioredis';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WritingService } from './writing.service';

@Controller('writing')
@UseGuards(JwtAuthGuard)
export class WritingController {
    constructor(
        private readonly writingService: WritingService,
        private readonly config: ConfigService,
    ) { }

    @Get('prompts')
    listPrompts(
        @Query('task_type') taskType?: string,
        @Query('level') level?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.writingService.listPrompts({
            task_type: taskType,
            level: level,
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
        });
    }

    @Get('prompts/:id')
    getPrompt(@Param('id') id: string) {
        return this.writingService.getPrompt(id);
    }

    @Post('prompts/:id/submit')
    @HttpCode(HttpStatus.ACCEPTED)
    submitEssay(
        @Request() req: any,
        @Param('id') promptId: string,
        @Body()
        body: {
            essay_text: string;
            duration_sec?: number;
            word_count?: number;
            model_tier?: 'cheap' | 'premium';
        },
    ) {
        return this.writingService.submitEssay(req.user.sub, promptId, body);
    }

    @Get('history')
    getHistory(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.writingService.getHistory(req.user.sub, {
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
        });
    }

    @Get('submissions/:id')
    getSubmission(@Request() req: any, @Param('id') id: string) {
        return this.writingService.getSubmission(req.user.sub, id);
    }

    @Sse('submissions/:id/events')
    subscribeToScoring(
        @Request() req: any,
        @Param('id') submissionId: string,
    ): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            this.writingService
                .getSubmission(req.user.sub, submissionId)
                .then((sub) => {
                    // Race condition fix: if already done/failed, emit immediately
                    if (sub.processing_status === 'done' || sub.processing_status === 'failed') {
                        subscriber.next({
                            data: JSON.stringify({
                                processing_status: sub.processing_status,
                                submission_id: submissionId,
                            }),
                            type: 'status',
                        });
                        subscriber.complete();
                        return;
                    }

                    // Subscribe to Redis pub/sub for future updates
                    const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
                    const redisSub = new Redis(redisUrl);
                    const channel = `scoring:status:${submissionId}`;

                    redisSub.subscribe(channel);
                    redisSub.on('message', (_ch: string, message: string) => {
                        subscriber.next({ data: message, type: 'status' });
                        redisSub.unsubscribe(channel);
                        redisSub.disconnect();
                        subscriber.complete();
                    });

                    // Timeout after 5 minutes
                    const timeout = setTimeout(() => {
                        subscriber.next({
                            data: JSON.stringify({ processing_status: 'timeout' }),
                            type: 'status',
                        });
                        redisSub.unsubscribe(channel);
                        redisSub.disconnect();
                        subscriber.complete();
                    }, 5 * 60 * 1000);

                    // Cleanup on unsubscribe
                    subscriber.add(() => {
                        clearTimeout(timeout);
                        redisSub.unsubscribe(channel);
                        redisSub.disconnect();
                    });
                })
                .catch((err) => {
                    subscriber.error(err);
                });
        });
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/backend && npx jest src/writing/writing.controller.spec.ts --no-cache 2>&1 | tail -10`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/writing/writing.controller.ts apps/backend/src/writing/writing.controller.spec.ts
git commit -m "feat: add SSE endpoint for real-time scoring status"
```

---

## Chunk 5: Smoke Test & Cleanup

### Task 8: Full compilation check and run all tests

**Files:** None (verification only)

- [ ] **Step 1: Verify TypeScript compiles with zero errors**

Run: `cd apps/backend && npx tsc --noEmit`

Expected: Clean output, no errors.

- [ ] **Step 2: Run all tests**

Run: `cd apps/backend && npx jest --passWithNoTests 2>&1 | tail -20`

Expected: All tests pass.

- [ ] **Step 3: Verify the app starts**

Run: `cd apps/backend && npx nest build && timeout 10 node dist/main.js 2>&1 || true`

Expected: App starts without crashing. Look for:
- `Nest application successfully started`
- No BullMQ/Redis connection errors (Redis must be running locally)

- [ ] **Step 4: Flush stale Bull keys from Redis (if any)**

Run: `redis-cli KEYS "bull:*" | head -5`

If keys exist:
```bash
redis-cli KEYS "bull:*" | xargs redis-cli DEL
```

---

### Task 9: Final commit and summary

- [ ] **Step 1: Check for any uncommitted changes**

Run: `git status`

- [ ] **Step 2: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: finalize Bull to BullMQ migration"
```

---

### Note: Integration Tests (Deferred)

The spec Section 8 lists these integration/E2E tests which are **deferred to a follow-up task** (requires running Redis + full NestJS app context):

- `POST /writing/prompts/:id/submit` — verify 202 + job enqueued
- SSE normal flow — submit → subscribe SSE → verify event on completion
- SSE race condition — complete job first → subscribe SSE → verify immediate emit
- SSE timeout — subscribe SSE with no job completion → verify timeout event
- SSE unauthorized — verify 401 for wrong user's submission

These require a test Redis instance and are best implemented as E2E tests in `apps/backend/test/`. The unit tests in this plan cover the core logic; integration tests should be added before production deployment.

---

## Summary of all commits

| # | Message | Files |
|---|---------|-------|
| 1 | `chore: swap @nestjs/bull for @nestjs/bullmq` | package.json |
| 2 | `feat: migrate app.module.ts to @nestjs/bullmq global config` | app.module.ts |
| 3 | `feat: migrate scoring.module.ts to @nestjs/bullmq` | scoring.module.ts |
| 4 | `feat: migrate scoring.producer to BullMQ with job priority` | scoring.producer.ts + spec |
| 5 | `feat: migrate scoring.consumer to BullMQ WorkerHost with Redis pub/sub` | scoring.consumer.ts + spec |
| 6 | `feat: migrate upload module to @nestjs/bullmq` | upload/*.ts |
| 7 | `feat: add SSE endpoint for real-time scoring status` | writing.controller.ts + spec |
| 8 | `chore: finalize Bull to BullMQ migration` | cleanup |
