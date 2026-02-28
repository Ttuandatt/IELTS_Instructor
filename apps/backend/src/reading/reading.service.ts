import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ReadingService {
  constructor(private readonly prisma: PrismaService) { }

  async listPassages(query: { level?: string; collection?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { status: 'published' };
    if (query.level) where.level = query.level;
    if (query.collection) where.collection = query.collection;

    const [data, total] = await Promise.all([
      this.prisma.passage.findMany({
        where,
        select: { id: true, title: true, level: true, collection: true, topic_tags: true, created_at: true, _count: { select: { questions: true } } },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.passage.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getPassage(id: string) {
    const passage = await this.prisma.passage.findUnique({
      where: { id, status: 'published' },
      include: {
        questions: {
          select: { id: true, type: true, prompt: true, options: true, order_index: true },
          orderBy: { order_index: 'asc' },
        },
      },
    });
    if (!passage) throw new NotFoundException('Passage not found');
    // Don't expose answer keys to learners
    return passage;
  }

  async submitAnswers(userId: string, passageId: string, dto: { answers: Array<{ question_id: string; value: string }>; duration_sec?: number; timed_out?: boolean; test_mode?: string }) {
    const passage = await this.prisma.passage.findUnique({
      where: { id: passageId, status: 'published' },
      include: { questions: true },
    });
    if (!passage) throw new NotFoundException('Passage not found');

    let correct = 0;
    const total = passage.questions.length;
    const details = [];

    for (const answer of dto.answers) {
      const question = passage.questions.find(q => q.id === answer.question_id);
      if (!question) continue;

      let isCorrect = false;
      const key = question.answer_key;
      if (typeof key === 'string' && answer.value.toLowerCase() === key.toLowerCase()) {
        isCorrect = true;
      } else if (Array.isArray(key)) {
        if (key.some((k: string) => answer.value.toLowerCase().includes(k.toLowerCase()))) {
          isCorrect = true;
        }
      }

      if (isCorrect) correct++;

      details.push({
        question_id: question.id,
        correct: isCorrect,
        your_answer: answer.value,
        correct_answer: key,
        explanation: question.explanation,
      });
    }

    const scorePct = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;

    const submission = await this.prisma.readingSubmission.create({
      data: {
        user_id: userId,
        passage_id: passageId,
        answers: dto.answers as any,
        score_pct: scorePct,
        correct_count: correct,
        total_questions: total,
        duration_sec: dto.duration_sec,
        timed_out: dto.timed_out || false,
        test_mode: dto.test_mode || 'practice',
      },
    });

    return {
      submission_id: submission.id,
      score_pct: submission.score_pct,
      correct_count: submission.correct_count,
      total_questions: submission.total_questions,
      duration_sec: submission.duration_sec,
      timed_out: submission.timed_out,
      test_mode: submission.test_mode,
      details,
    };
  }

  async getHistory(userId: string, query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.readingSubmission.findMany({
        where: { user_id: userId },
        include: { passage: { select: { id: true, title: true, level: true } } },
        orderBy: { completed_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.readingSubmission.count({ where: { user_id: userId } }),
    ]);

    return { data, total, page, limit };
  }
}
