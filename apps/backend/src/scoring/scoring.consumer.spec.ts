import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { ScoringConsumer } from './scoring.consumer';
import { ScoringJobData } from './scoring.producer';

// Mock ioredis so the constructor doesn't create a real connection
jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
        publish: jest.fn().mockResolvedValue(1),
        disconnect: jest.fn(),
    }));
});

describe('ScoringConsumer', () => {
    let consumer: ScoringConsumer;
    let mockPrisma: any;
    let mockLlmClient: any;
    let mockConfig: ConfigService;
    let mockRedisPub: { publish: jest.Mock; disconnect: jest.Mock };

    const baseFeedback = {
        TR: 7,
        CC: 7,
        LR: 6.5,
        GRA: 7,
        overall: 7,
        summary: 'Good essay',
        strengths: ['Clear structure'],
        improvements: ['More examples'],
        suggestions: ['Use varied vocabulary'],
    };

    const baseJobData: ScoringJobData = {
        submissionId: 'sub-1',
        userId: 'user-1',
        promptId: 'prompt-1',
        essayContent: 'Some essay text',
        promptText: 'Write about technology',
        modelTier: 'cheap',
    };

    beforeEach(() => {
        mockPrisma = {
            writingSubmission: {
                update: jest.fn().mockResolvedValue({}),
            },
        };

        mockLlmClient = {
            scoreEssay: jest.fn().mockResolvedValue({
                feedback: baseFeedback,
                modelName: 'gpt-4o-mini',
            }),
        };

        mockConfig = {
            get: jest.fn().mockReturnValue('redis://localhost:6379'),
        } as any;

        consumer = new ScoringConsumer(mockPrisma, mockLlmClient, mockConfig);

        // Replace the redisPub with a mock
        mockRedisPub = {
            publish: jest.fn().mockResolvedValue(1),
            disconnect: jest.fn(),
        };
        (consumer as any).redisPub = mockRedisPub;
    });

    function createJob(overrides: Partial<Job<ScoringJobData>> = {}): Job<ScoringJobData> {
        return {
            data: baseJobData,
            attemptsMade: 0,
            opts: { attempts: 3 },
            ...overrides,
        } as unknown as Job<ScoringJobData>;
    }

    it('should score essay, update DB with done status, and publish Redis event on success', async () => {
        const job = createJob();

        await consumer.process(job);

        // LLM was called
        expect(mockLlmClient.scoreEssay).toHaveBeenCalledWith({
            promptText: baseJobData.promptText,
            essayContent: baseJobData.essayContent,
            modelTier: baseJobData.modelTier,
        });

        // DB was updated with done status
        expect(mockPrisma.writingSubmission.update).toHaveBeenCalledTimes(1);
        const updateCall = mockPrisma.writingSubmission.update.mock.calls[0][0];
        expect(updateCall.where.id).toBe('sub-1');
        expect(updateCall.data.processing_status).toBe('done');
        expect(updateCall.data.scores.overall).toBe(7);
        expect(updateCall.data.model_name).toBe('gpt-4o-mini');

        // Redis event was published
        expect(mockRedisPub.publish).toHaveBeenCalledTimes(1);
        expect(mockRedisPub.publish).toHaveBeenCalledWith(
            'scoring:status:sub-1',
            JSON.stringify({ processing_status: 'done', submission_id: 'sub-1' }),
        );
    });

    it('should mark as failed and publish failure event on last retry', async () => {
        const error = new Error('LLM timeout');
        mockLlmClient.scoreEssay.mockRejectedValue(error);

        // attemptsMade = 2 means this is the 3rd attempt (0-indexed), which is the last for attempts: 3
        const job = createJob({ attemptsMade: 2 });

        await expect(consumer.process(job)).rejects.toThrow('LLM timeout');

        // DB was updated with failed status
        expect(mockPrisma.writingSubmission.update).toHaveBeenCalledTimes(1);
        const updateCall = mockPrisma.writingSubmission.update.mock.calls[0][0];
        expect(updateCall.where.id).toBe('sub-1');
        expect(updateCall.data.processing_status).toBe('failed');
        expect(updateCall.data.error_message).toBe('LLM timeout');

        // Redis failure event was published
        expect(mockRedisPub.publish).toHaveBeenCalledTimes(1);
        expect(mockRedisPub.publish).toHaveBeenCalledWith(
            'scoring:status:sub-1',
            JSON.stringify({ processing_status: 'failed', submission_id: 'sub-1' }),
        );
    });

    it('should NOT update DB or publish on non-final retry failure', async () => {
        const error = new Error('LLM timeout');
        mockLlmClient.scoreEssay.mockRejectedValue(error);

        // attemptsMade = 0 means this is the 1st attempt, not the last
        const job = createJob({ attemptsMade: 0 });

        await expect(consumer.process(job)).rejects.toThrow('LLM timeout');

        // DB should NOT be updated
        expect(mockPrisma.writingSubmission.update).not.toHaveBeenCalled();

        // Redis should NOT be published
        expect(mockRedisPub.publish).not.toHaveBeenCalled();
    });
});
