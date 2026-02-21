import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLearnerStats(userId: string) {
    const [readingSubs, writingSubs] = await Promise.all([
      this.prisma.readingSubmission.findMany({
        where: { user_id: userId },
        select: { score_pct: true, completed_at: true },
        orderBy: { completed_at: 'desc' },
      }),
      this.prisma.writingSubmission.findMany({
        where: { user_id: userId },
        select: { scores: true, processing_status: true, created_at: true },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    // Reading stats
    const readingTotal = readingSubs.length;
    const readingAvg = readingTotal > 0
      ? Math.round(readingSubs.reduce((sum, s) => sum + s.score_pct, 0) / readingTotal * 10) / 10
      : 0;

    // Writing stats
    const writingTotal = writingSubs.length;
    const scoredWriting = writingSubs.filter(
      s => s.processing_status === 'done' && s.scores && typeof s.scores === 'object',
    );
    const writingAvg = scoredWriting.length > 0
      ? Math.round(scoredWriting.reduce((sum, s) => sum + ((s.scores as any).overall || 0), 0) / scoredWriting.length * 10) / 10
      : 0;

    // Recent activity (last 10)
    const recent = [
      ...readingSubs.slice(0, 5).map(s => ({
        type: 'reading' as const,
        score: `${s.score_pct}%`,
        date: s.completed_at,
      })),
      ...writingSubs.slice(0, 5).map(s => ({
        type: 'writing' as const,
        score: s.processing_status === 'done' && s.scores
          ? `${(s.scores as any).overall}`
          : s.processing_status,
        date: s.created_at,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return {
      reading: { total: readingTotal, avg_score: readingAvg },
      writing: { total: writingTotal, avg_score: writingAvg },
      total_attempts: readingTotal + writingTotal,
      recent_activity: recent,
    };
  }
}
