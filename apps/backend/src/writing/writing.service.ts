import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';
import { ScoringProducerService } from '../scoring/scoring.producer';

@Injectable()
export class WritingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringProducer: ScoringProducerService,
    private readonly config: ConfigService,
  ) { }

  async listPrompts(query: { task_type?: string; level?: string; collection?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { status: 'published' };
    if (query.task_type) where.task_type = query.task_type;
    if (query.level) where.level = query.level;
    if (query.collection) where.collection = query.collection;

    const [data, total] = await Promise.all([
      this.prisma.prompt.findMany({
        where,
        select: {
          id: true,
          title: true,
          task_type: true,
          level: true,
          collection_id: true,
          tags: { select: { name: true } },
          min_words: true,
          prompt_text: true,
          created_at: true,
          _count: { select: { submissions: true } },
        },
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

  async submitEssay(
    userId: string,
    promptId: string,
    dto: {
      essay_text: string;
      duration_sec?: number;
      word_count?: number;
      model_tier?: 'cheap' | 'premium';
    },
  ) {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id: promptId, status: 'published' },
    });
    if (!prompt) throw new NotFoundException('Prompt not found');

    // Word count validation
    const wordCount = dto.word_count ?? dto.essay_text.trim().split(/\s+/).length;
    if (wordCount < prompt.min_words) {
      throw new BadRequestException(
        `Essay must be at least ${prompt.min_words} words (got ${wordCount})`,
      );
    }

    // Daily rate limit check
    const dailyLimit = this.config.get<number>('WRITING_DAILY_LIMIT', 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.prisma.writingSubmission.count({
      where: { user_id: userId, created_at: { gte: today } },
    });
    if (todayCount >= dailyLimit) {
      throw new HttpException(
        `You have reached the daily limit of ${dailyLimit} writing submissions`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const modelTier: 'cheap' | 'premium' = dto.model_tier || 'cheap';

    // Create submission in pending state
    const submission = await this.prisma.writingSubmission.create({
      data: {
        user_id: userId,
        prompt_id: promptId,
        content: dto.essay_text,
        word_count: wordCount,
        model_tier: modelTier,
        processing_status: 'pending',
      },
    });

    // Enqueue scoring job
    await this.scoringProducer.enqueue({
      submissionId: submission.id,
      userId,
      promptId,
      essayContent: dto.essay_text,
      promptText: prompt.prompt_text,
      modelTier,
    });

    return { id: submission.id, processing_status: 'pending' };
  }

  async getSubmission(userId: string, submissionId: string) {
    const sub = await this.prisma.writingSubmission.findFirst({
      where: { id: submissionId, user_id: userId },
      include: { prompt: true },
    });
    if (!sub) throw new NotFoundException('Submission not found');
    return sub;
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

  async getContentStats() {
    const [passages, prompts] = await Promise.all([
      this.prisma.readingSubmission.groupBy({
        by: ['passage_id'],
        _count: { _all: true },
      }),
      this.prisma.writingSubmission.groupBy({
        by: ['prompt_id'],
        _count: { _all: true },
      }),
    ]);

    return {
      passages: passages.map((p) => ({
        passage_id: p.passage_id,
        submission_count: p._count._all,
      })),
      prompts: prompts.map((p) => ({
        prompt_id: p.prompt_id,
        submission_count: p._count._all,
      })),
    };
  }
}
