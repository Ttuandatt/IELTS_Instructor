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

            throw err;
        }
    }
}
