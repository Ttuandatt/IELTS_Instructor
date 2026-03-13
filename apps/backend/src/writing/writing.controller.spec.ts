import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WritingController } from './writing.controller';
import { WritingService } from './writing.service';
import { firstValueFrom } from 'rxjs';

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
