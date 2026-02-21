import {
  Controller, Get, Param, Query, UseGuards,
} from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('instructor' as any, 'admin' as any)
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('stats')
  getStats() {
    return this.instructorService.getInstructorStats();
  }

  @Get('learners')
  listLearners(@Query() query: { search?: string; page?: string; limit?: string }) {
    return this.instructorService.listLearners({
      search: query.search,
      page: query.page ? +query.page : undefined,
      limit: query.limit ? +query.limit : undefined,
    });
  }

  @Get('writing-submissions')
  listWritingSubmissions(@Query() query: { user_id?: string; prompt_id?: string; status?: string; page?: string; limit?: string }) {
    return this.instructorService.listWritingSubmissions({
      user_id: query.user_id,
      prompt_id: query.prompt_id,
      status: query.status,
      page: query.page ? +query.page : undefined,
      limit: query.limit ? +query.limit : undefined,
    });
  }

  @Get('writing-submissions/:id')
  getWritingSubmission(@Param('id') id: string) {
    return this.instructorService.getWritingSubmission(id);
  }

  @Get('reading-submissions')
  listReadingSubmissions(@Query() query: { user_id?: string; passage_id?: string; page?: string; limit?: string }) {
    return this.instructorService.listReadingSubmissions({
      user_id: query.user_id,
      passage_id: query.passage_id,
      page: query.page ? +query.page : undefined,
      limit: query.limit ? +query.limit : undefined,
    });
  }
}
