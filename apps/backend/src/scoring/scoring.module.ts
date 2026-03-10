import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma';
import { LlmClientService } from './llm-client.service';
import { ScoringProducerService, SCORING_QUEUE } from './scoring.producer';
import { ScoringConsumer } from './scoring.consumer';

@Module({
    imports: [
        PrismaModule,
        BullModule.registerQueueAsync({
            name: SCORING_QUEUE,
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                redis: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [LlmClientService, ScoringProducerService, ScoringConsumer],
    exports: [ScoringProducerService, LlmClientService],
})
export class ScoringModule { }
