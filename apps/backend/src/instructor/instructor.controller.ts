import {
  Controller, Get, Patch, Param, Query, Body, UseGuards, Req, Post, Delete
} from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { AdminService } from '../admin/admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('instructor' as any, 'admin' as any)
export class InstructorController {
  constructor(
    private readonly instructorService: InstructorService,
    private readonly adminService: AdminService
  ) { }

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

  @Get('all-submissions')
  listAllSubmissions(@Query() query: { type?: string; page?: string; limit?: string }) {
    return this.instructorService.listAllSubmissions({
      type: query.type,
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

  @Patch('writing-submissions/:id/review')
  reviewWritingSubmission(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { instructor_override_score?: number; instructor_comment?: string },
  ) {
    return this.instructorService.reviewWritingSubmission(id, req.user.sub, body);
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

  /* ── Passages (Shared with Admin) ── */

  @Get('passages')
  listPassages(@Query() query: { status?: string; level?: string; page?: string; limit?: string }) {
    return this.adminService.listPassages({
      status: query.status,
      level: query.level,
      page: query.page ? +query.page : undefined,
      limit: query.limit ? +query.limit : undefined,
    });
  }

  @Get('passages/:id')
  getPassage(@Param('id') id: string) {
    return this.adminService.getPassage(id);
  }

  @Post('passages')
  createPassage(@Req() req: any, @Body() body: any) {
    return this.adminService.createPassage(req.user.sub, body);
  }

  @Post('passages/import')
  importPassage(@Req() req: any, @Body() body: any) {
    return this.adminService.importPassage(req.user.sub, body);
  }

  @Patch('passages/:id')
  updatePassage(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.adminService.updatePassage(id, body, req.user.sub, req.user.role);
  }

  @Delete('passages/:id')
  deletePassage(@Param('id') id: string, @Req() req: any) {
    return this.adminService.deletePassage(id, req.user.sub, req.user.role);
  }

  @Get('passages/:id/submissions')
  getPassageSubmissions(@Param('id') id: string, @Query() query: { page?: string; limit?: string }) {
    return this.adminService.getPassageSubmissions(id, {
      page: query.page ? +query.page : undefined,
      limit: query.limit ? +query.limit : undefined,
    });
  }

  /* ── Questions ── */

  @Post('passages/:passageId/questions')
  createQuestion(@Param('passageId') passageId: string, @Body() body: any) {
    return this.adminService.createQuestion(passageId, body);
  }

  @Patch('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateQuestion(id, body);
  }

  @Delete('questions/:id')
  deleteQuestion(@Param('id') id: string) {
    return this.adminService.deleteQuestion(id);
  }

  /* ── Prompts (Shared with Admin) ── */

  @Get('prompts')
  listPrompts(@Query() query: { status?: string; level?: string; task_type?: string; page?: string; limit?: string }) {
    return this.adminService.listPrompts({
      status: query.status,
      level: query.level,
      task_type: query.task_type,
      page: query.page ? +query.page : undefined,
      limit: query.limit ? +query.limit : undefined,
    });
  }

  @Get('prompts/:id')
  getPrompt(@Param('id') id: string) {
    return this.adminService.getPrompt(id);
  }

  @Get('prompts/:id/submissions')
  getPromptSubmissions(@Param('id') id: string, @Query() query: { page?: string; limit?: string }) {
    return this.adminService.getPromptSubmissions(id, {
      page: query.page ? +query.page : undefined,
      limit: query.limit ? +query.limit : undefined,
    });
  }

  @Post('prompts')
  createPrompt(@Req() req: any, @Body() body: any) {
    return this.adminService.createPrompt(req.user.sub, body);
  }

  @Patch('prompts/:id')
  updatePrompt(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.adminService.updatePrompt(id, body, req.user.sub, req.user.role);
  }

  @Delete('prompts/:id')
  deletePrompt(@Param('id') id: string, @Req() req: any) {
    return this.adminService.deletePrompt(id, req.user.sub, req.user.role);
  }
}
