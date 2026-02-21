import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class WritingService {
  constructor(private readonly prisma: PrismaService) {}

  async listPrompts(query: { task_type?: string; level?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { status: 'published' };
    if (query.task_type) where.task_type = query.task_type;
    if (query.level) where.level = query.level;

    const [data, total] = await Promise.all([
      this.prisma.prompt.findMany({
        where,
        select: { id: true, title: true, task_type: true, level: true, topic_tags: true, min_words: true, created_at: true },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.prompt.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getPrompt(id: string) {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id, status: 'published' },
    });
    if (!prompt) throw new NotFoundException('Prompt not found');
    return prompt;
  }

  async submitEssay(userId: string, promptId: string, dto: { essay_text: string; duration_sec?: number; word_count?: number }) {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id: promptId, status: 'published' },
    });
    if (!prompt) throw new NotFoundException('Prompt not found');

    const wordCount = dto.word_count || dto.essay_text.trim().split(/\s+/).length;

    return this.prisma.writingSubmission.create({
      data: {
        user_id: userId,
        prompt_id: promptId,
        content: dto.essay_text,
        word_count: wordCount,
        processing_status: 'pending',
      },
    });
  }

  async getHistory(userId: string, query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.writingSubmission.findMany({
        where: { user_id: userId },
        include: { prompt: { select: { id: true, title: true, task_type: true, level: true } } },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.writingSubmission.count({ where: { user_id: userId } }),
    ]);

    return { data, total, page, limit };
  }

  async getSubmission(userId: string, submissionId: string) {
    const sub = await this.prisma.writingSubmission.findFirst({
      where: { id: submissionId, user_id: userId },
      include: { prompt: true },
    });
    if (!sub) throw new NotFoundException('Submission not found');
    return sub;
  }
}
