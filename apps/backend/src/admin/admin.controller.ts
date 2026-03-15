import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ContentVersionService } from './content-version.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin' as any)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly versionService: ContentVersionService,
  ) { }

  /* ── Stats ── */

  @Get('stats')
  getStats() {
    return this.adminService.getSystemStats();
  }

  /* ── Passages ── */

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
  createPassage(@Request() req: any, @Body() body: any) {
    return this.adminService.createPassage(req.user.sub, body);
  }

  @Post('passages/import')
  importPassage(@Request() req: any, @Body() body: any) {
    return this.adminService.importPassage(req.user.sub, body);
  }

  @Patch('passages/:id')
  updatePassage(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.adminService.updatePassage(id, body, req.user.sub, req.user.role);
  }

  @Delete('passages/:id')
  deletePassage(@Param('id') id: string, @Request() req: any) {
    return this.adminService.deletePassage(id, req.user.sub, req.user.role);
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

  /* ── Prompts ── */

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

  @Post('prompts')
  createPrompt(@Request() req: any, @Body() body: any) {
    return this.adminService.createPrompt(req.user.sub, body);
  }

  @Patch('prompts/:id')
  updatePrompt(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.adminService.updatePrompt(id, body, req.user.sub, req.user.role);
  }

  @Delete('prompts/:id')
  deletePrompt(@Param('id') id: string, @Request() req: any) {
    return this.adminService.deletePrompt(id, req.user.sub, req.user.role);
  }

  /* ── Users ── */

  @Get('users')
  listUsers(@Query() query: { role?: string; search?: string; page?: string; limit?: string }) {
    return this.adminService.listUsers({
      role: query.role,
      search: query.search,
      page: query.page ? +query.page : undefined,
      limit: query.limit ? +query.limit : undefined,
    });
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.adminService.updateUserRole(id, body.role as any);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  /* ── Content Versioning ── */

  @Get('content/:entityType/:id/versions')
  getContentVersions(
    @Param('entityType') entityType: string,
    @Param('id') id: string,
  ) {
    return this.versionService.getHistory(entityType, id);
  }
}
