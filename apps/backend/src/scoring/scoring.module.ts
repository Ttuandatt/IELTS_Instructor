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
