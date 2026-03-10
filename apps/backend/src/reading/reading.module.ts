import { Module } from '@nestjs/common';
import { ReadingController } from './reading.controller';
import { ReadingService } from './reading.service';
import { ParsingService } from './parsing.service';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [ScoringModule],
  controllers: [ReadingController],
  providers: [ReadingService, ParsingService],
})
export class ReadingModule { }
