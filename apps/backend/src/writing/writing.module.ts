import { Module } from '@nestjs/common';
import { WritingController } from './writing.controller';
import { WritingService } from './writing.service';
import { ScoringModule } from '../scoring/scoring.module';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule, ScoringModule],
  controllers: [WritingController],
  providers: [WritingService],
})
export class WritingModule { }
