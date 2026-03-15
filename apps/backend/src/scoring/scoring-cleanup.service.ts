import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScoringCleanupService {
  private readonly logger = new Logger(ScoringCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupStaleJobs() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const result = await this.prisma.writingSubmission.updateMany({
      where: {
        processing_status: 'pending',
        created_at: { lt: tenMinutesAgo },
      },
      data: {
        processing_status: 'failed',
      },
    });

    if (result.count > 0) {
      this.logger.warn(`Cleaned up ${result.count} stale scoring jobs`);
    }
  }
}
