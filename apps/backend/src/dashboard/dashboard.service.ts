import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) { }

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
  /* ───────── GET /dashboard/progress ───────── */
  async getProgress(userId: string) {
    const [readingSubs, writingSubs] = await Promise.all([
      this.prisma.readingSubmission.findMany({
        where: { user_id: userId },
        include: { passage: { select: { id: true, title: true } } },
        orderBy: { completed_at: 'desc' },
      }),
      this.prisma.writingSubmission.findMany({
        where: { user_id: userId, processing_status: 'done' },
        include: { prompt: { select: { id: true, title: true } } },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    // Reading aggregates
    const readingTotal = readingSubs.length;
    const readingAvg = readingTotal > 0
      ? Math.round(readingSubs.reduce((s, r) => s + r.score_pct, 0) / readingTotal * 10) / 10
      : 0;
    const readingCompletionRate = readingTotal > 0
      ? Math.round(readingSubs.filter(r => r.score_pct > 0).length / readingTotal * 100) / 100
      : 0;

    // Writing aggregates — per-criterion averages
    const writingTotal = writingSubs.length;
    const criterionKeys = ['TR', 'CC', 'LR', 'GRA', 'overall'] as const;
    const writingAvgScores: Record<string, number> = {};
    for (const key of criterionKeys) {
      const vals = writingSubs
        .map(s => (s.scores as any)?.[key])
        .filter((v): v is number => typeof v === 'number');
      writingAvgScores[key] = vals.length > 0
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
        : 0;
    }

    // Recent submissions — mixed, top 10
    type RecentItem = { type: 'reading' | 'writing'; id: string; title: string; score: number; date: Date };
    const recent: RecentItem[] = [
      ...readingSubs.slice(0, 10).map(r => ({
        type: 'reading' as const,
        id: r.id,
        title: r.passage.title,
        score: r.score_pct,
        date: r.completed_at,
      })),
      ...writingSubs.slice(0, 10).map(w => ({
        type: 'writing' as const,
        id: w.id,
        title: w.prompt.title,
        score: (w.scores as any)?.overall ?? 0,
        date: w.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      reading: {
        avg_score_pct: readingAvg,
        completion_rate: readingCompletionRate,
        total_attempts: readingTotal,
      },
      writing: {
        avg_scores: writingAvgScores,
        total_submissions: writingTotal,
      },
      recent_submissions: recent,
    };
  }

  /* ───────── GET /dashboard/progress/trends ───────── */
  async getProgressTrends(userId: string, period: '4w' | '3m') {
    const weeksBack = period === '4w' ? 4 : 13;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeksBack * 7);

    const [readingSubs, writingSubs] = await Promise.all([
      this.prisma.readingSubmission.findMany({
        where: { user_id: userId, completed_at: { gte: startDate } },
        select: { score_pct: true, completed_at: true },
        orderBy: { completed_at: 'asc' },
      }),
      this.prisma.writingSubmission.findMany({
        where: { user_id: userId, processing_status: 'done', created_at: { gte: startDate } },
        select: { scores: true, created_at: true },
        orderBy: { created_at: 'asc' },
      }),
    ]);

    // Build weekly buckets
    const weeks: {
      week_start: string;
      reading_avg_score: number | null;
      writing_avg_overall: number | null;
      submission_count: number;
    }[] = [];

    for (let i = 0; i < weeksBack; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekReading = readingSubs.filter(
        s => s.completed_at >= weekStart && s.completed_at < weekEnd,
      );
      const weekWriting = writingSubs.filter(
        s => s.created_at >= weekStart && s.created_at < weekEnd,
      );

      const readingAvg = weekReading.length > 0
        ? Math.round(weekReading.reduce((s, r) => s + r.score_pct, 0) / weekReading.length * 10) / 10
        : null;
      const writingAvg = weekWriting.length > 0
        ? Math.round(
            weekWriting
              .map(w => (w.scores as any)?.overall ?? 0)
              .reduce((a, b) => a + b, 0) / weekWriting.length * 10,
          ) / 10
        : null;

      weeks.push({
        week_start: weekStart.toISOString().split('T')[0],
        reading_avg_score: readingAvg,
        writing_avg_overall: writingAvg,
        submission_count: weekReading.length + weekWriting.length,
      });
    }

    return { period, weeks };
  }

  async getInstructorStats(userId: string) {
    const [classrooms, pendingWriting, pendingReading] = await Promise.all([
      this.prisma.classroom.findMany({
        where: { owner_id: userId },
        include: { _count: { select: { members: true } } },
      }),
      this.prisma.writingSubmission.count({
        where: {
          processing_status: 'done',
          // Subs by students in instructor's classrooms
          user: {
            classroom_memberships: {
              some: {
                classroom: { owner_id: userId },
                role: 'student',
              },
            },
          },
        },
      }),
      this.prisma.readingSubmission.count({
        where: {
          user: {
            classroom_memberships: {
              some: {
                classroom: { owner_id: userId },
                role: 'student',
              },
            },
          },
        },
      }),
    ]);

    const totalClassrooms = classrooms.length;
    const totalStudents = classrooms.reduce((sum, c) => sum + Math.max(0, c._count.members - 1), 0); // -1 to exclude teacher

    return {
      total_classrooms: totalClassrooms,
      total_students: totalStudents,
      pending_writing_reviews: pendingWriting,
      pending_reading_reviews: pendingReading,
      classrooms: classrooms.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        members_count: c._count.members,
      })),
    };
  }
}
