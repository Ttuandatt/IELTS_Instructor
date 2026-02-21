import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class InstructorService {
  constructor(private readonly prisma: PrismaService) {}

  /* ── Learner list ── */

  async listLearners(query: { search?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { role: 'learner' };
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { display_name: { contains: query.search, mode: 'insensitive' } },
      ];
      // If search is provided, we still want role filter
      where.AND = [{ role: 'learner' }];
      delete where.role;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, display_name: true, created_at: true,
          _count: { select: { reading_submissions: true, writing_submissions: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /* ── Writing Submissions ── */

  async listWritingSubmissions(query: { user_id?: string; prompt_id?: string; status?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};
    if (query.user_id) where.user_id = query.user_id;
    if (query.prompt_id) where.prompt_id = query.prompt_id;
    if (query.status) where.processing_status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.writingSubmission.findMany({
        where,
        include: {
          user: { select: { id: true, display_name: true, email: true } },
          prompt: { select: { id: true, title: true, task_type: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.writingSubmission.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getWritingSubmission(id: string) {
    return this.prisma.writingSubmission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, display_name: true, email: true } },
        prompt: true,
      },
    });
  }

  /* ── Reading Submissions ── */

  async listReadingSubmissions(query: { user_id?: string; passage_id?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};
    if (query.user_id) where.user_id = query.user_id;
    if (query.passage_id) where.passage_id = query.passage_id;

    const [data, total] = await Promise.all([
      this.prisma.readingSubmission.findMany({
        where,
        include: {
          user: { select: { id: true, display_name: true, email: true } },
          passage: { select: { id: true, title: true, level: true } },
        },
        orderBy: { completed_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.readingSubmission.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /* ── Instructor Stats ── */

  async getInstructorStats() {
    const [totalLearners, readingSubs, writingSubs, recentWriting] = await Promise.all([
      this.prisma.user.count({ where: { role: 'learner' } }),
      this.prisma.readingSubmission.count(),
      this.prisma.writingSubmission.count(),
      this.prisma.writingSubmission.findMany({
        where: { processing_status: 'done' },
        select: { scores: true },
        orderBy: { created_at: 'desc' },
        take: 100,
      }),
    ]);

    // Calculate average writing score from recent submissions
    let avgWritingScore = 0;
    const scored = recentWriting.filter(s => s.scores && typeof s.scores === 'object');
    if (scored.length > 0) {
      const sum = scored.reduce((acc, s) => acc + ((s.scores as any).overall || 0), 0);
      avgWritingScore = Math.round((sum / scored.length) * 10) / 10;
    }

    return {
      total_learners: totalLearners,
      total_reading_submissions: readingSubs,
      total_writing_submissions: writingSubs,
      avg_writing_score: avgWritingScore,
    };
  }
}
