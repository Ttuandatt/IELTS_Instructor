import { Controller, Get, Param, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WritingService } from './writing.service';

@Controller('writing')
@UseGuards(JwtAuthGuard)
export class WritingController {
  constructor(private readonly writingService: WritingService) {}

  @Get('prompts')
  listPrompts(
    @Query('task_type') taskType?: string,
    @Query('level') level?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.writingService.listPrompts({ task_type: taskType, level: level, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get('prompts/:id')
  getPrompt(@Param('id') id: string) {
    return this.writingService.getPrompt(id);
  }

  @Post('prompts/:id/submit')
  submitEssay(@Request() req: any, @Param('id') promptId: string, @Body() body: { essay_text: string; duration_sec?: number; word_count?: number }) {
    return this.writingService.submitEssay(req.user.sub, promptId, body);
  }

  @Get('history')
  getHistory(@Request() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.writingService.getHistory(req.user.sub, { page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get('submissions/:id')
  getSubmission(@Request() req: any, @Param('id') id: string) {
    return this.writingService.getSubmission(req.user.sub, id);
  }
}
