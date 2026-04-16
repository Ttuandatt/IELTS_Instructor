import { Module } from '@nestjs/common';
import { ReadingController } from './reading.controller';
import { ReadingService } from './reading.service';
import { ParsingService } from './parsing.service';
import { MammothParserService } from './mammoth-parser.service';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [ScoringModule],
  controllers: [ReadingController],
  providers: [ReadingService, ParsingService, MammothParserService],
  exports: [ReadingService, MammothParserService, ParsingService],
})
export class ReadingModule { }
