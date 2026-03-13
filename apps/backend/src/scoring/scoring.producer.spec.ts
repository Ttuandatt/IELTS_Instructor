import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { ScoringProducerService, SCORING_QUEUE, ScoringJobData } from './scoring.producer';

describe('ScoringProducerService', () => {
    let service: ScoringProducerService;
    let mockQueue: { add: jest.Mock };

    beforeEach(async () => {
        mockQueue = { add: jest.fn().mockResolvedValue(undefined) };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScoringProducerService,
                {
                    provide: getQueueToken(SCORING_QUEUE),
                    useValue: mockQueue,
                },
            ],
        }).compile();

        service = module.get<ScoringProducerService>(ScoringProducerService);
    });

    const baseJob: ScoringJobData = {
        submissionId: 'sub-1',
        userId: 'user-1',
        promptId: 'prompt-1',
        essayContent: 'Some essay text',
        promptText: 'Write about technology',
        modelTier: 'cheap',
    };

    it('should enqueue a cheap job with priority 5', async () => {
        await service.enqueue({ ...baseJob, modelTier: 'cheap' });

        expect(mockQueue.add).toHaveBeenCalledTimes(1);
        const [jobName, data, opts] = mockQueue.add.mock.calls[0];
        expect(jobName).toBe('score-essay');
        expect(data.modelTier).toBe('cheap');
        expect(opts.priority).toBe(5);
    });

    it('should enqueue a premium job with priority 1', async () => {
        await service.enqueue({ ...baseJob, modelTier: 'premium' });

        expect(mockQueue.add).toHaveBeenCalledTimes(1);
        const [jobName, data, opts] = mockQueue.add.mock.calls[0];
        expect(jobName).toBe('score-essay');
        expect(data.modelTier).toBe('premium');
        expect(opts.priority).toBe(1);
    });
});
