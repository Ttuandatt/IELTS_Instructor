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

    async checkQueueHealth(): Promise<{ depth: number; healthy: boolean }> {
        const waiting = await this.scoringQueue.getWaitingCount();
        const active = await this.scoringQueue.getActiveCount();
        const depth = waiting + active;
        return { depth, healthy: depth < 100 };
    }

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
