import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

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
        await this.scoringQueue.add(data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: 100,
            removeOnFail: 50,
        });
        this.logger.log(`Enqueued scoring job for submission ${data.submissionId}`);
    }
}
