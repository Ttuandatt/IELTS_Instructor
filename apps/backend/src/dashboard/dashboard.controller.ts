import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrendsQueryDto } from './dto/progress-query.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.dashboardService.getLearnerStats(req.user.sub);
  }

  @Get('progress')
  getProgress(@Request() req: any) {
    return this.dashboardService.getProgress(req.user.sub);
  }

  @Get('progress/trends')
  getProgressTrends(@Request() req: any, @Query() query: TrendsQueryDto) {
    return this.dashboardService.getProgressTrends(req.user.sub, query.period ?? '4w');
  }

  @Get('instructor-stats')
  getInstructorStats(@Request() req: any) {
    return this.dashboardService.getInstructorStats(req.user.sub);
  }
}
