import { Controller, Get, Param, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReadingService } from './reading.service';

@Controller('reading')
@UseGuards(JwtAuthGuard)
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get('passages')
  listPassages(@Query('level') level?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.readingService.listPassages({ level, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get('passages/:id')
  getPassage(@Param('id') id: string) {
    return this.readingService.getPassage(id);
  }

  @Post('passages/:id/submit')
  submitAnswers(@Request() req: any, @Param('id') passageId: string, @Body() body: { answers: Array<{ question_id: string; value: string }>; duration_sec?: number; timed_out?: boolean }) {
    return this.readingService.submitAnswers(req.user.sub, passageId, body);
  }

  @Get('history')
  getHistory(@Request() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.readingService.getHistory(req.user.sub, { page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }
}
