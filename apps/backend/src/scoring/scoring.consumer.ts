import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../prisma';
import { LlmClientService } from './llm-client.service';
import { SCORING_QUEUE, ScoringJobData } from './scoring.producer';


@Processor(SCORING_QUEUE)
export class ScoringConsumer {
    private readonly logger = new Logger(ScoringConsumer.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly llmClient: LlmClientService,
    ) { }

    @Process()
    async handleScoringJob(job: Job<ScoringJobData>): Promise<void> {
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
            }

            throw err; // Re-throw so BullMQ handles retry
        }
    }
}
