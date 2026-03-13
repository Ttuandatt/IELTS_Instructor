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
