import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { ContentStatus, CefrLevel, UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /* ── Passages ── */

  async listPassages(query: { status?: string; level?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};
    if (query.status) where.status = query.status as ContentStatus;
    if (query.level) where.level = query.level as CefrLevel;

    const [data, total] = await Promise.all([
      this.prisma.passage.findMany({
        where,
        include: { creator: { select: { id: true, display_name: true } }, _count: { select: { questions: true, submissions: true } } },
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
      where: { id },
      include: {
        creator: { select: { id: true, display_name: true } },
        questions: { orderBy: { order_index: 'asc' } },
      },
    });
    if (!passage) throw new NotFoundException('Passage not found');
    return passage;
  }

  async createPassage(adminId: string, dto: { title: string; body: string; level: CefrLevel; topic_tags?: string[]; status?: ContentStatus }) {
    return this.prisma.passage.create({
      data: {
        title: dto.title,
        body: dto.body,
        level: dto.level,
        topic_tags: dto.topic_tags || [],
        status: dto.status || ContentStatus.draft,
        created_by: adminId,
      },
    });
  }

  async updatePassage(id: string, dto: { title?: string; body?: string; level?: CefrLevel; topic_tags?: string[]; status?: ContentStatus }) {
    await this.getPassage(id); // throws if not found
    return this.prisma.passage.update({ where: { id }, data: dto });
  }

  async deletePassage(id: string) {
    await this.getPassage(id);
    return this.prisma.passage.delete({ where: { id } });
  }

  /* ── Questions ── */

  async createQuestion(passageId: string, dto: { type: string; prompt: string; options?: any; answer_key: any; explanation?: string; order_index?: number }) {
    await this.getPassage(passageId);
    return this.prisma.question.create({
      data: {
        passage_id: passageId,
        type: dto.type as any,
        prompt: dto.prompt,
        options: dto.options || undefined,
        answer_key: dto.answer_key,
        explanation: dto.explanation,
        order_index: dto.order_index || 0,
      },
    });
  }

  async updateQuestion(id: string, dto: { prompt?: string; options?: any; answer_key?: any; explanation?: string; order_index?: number }) {
    const q = await this.prisma.question.findUnique({ where: { id } });
    if (!q) throw new NotFoundException('Question not found');
    return this.prisma.question.update({ where: { id }, data: dto });
  }

  async deleteQuestion(id: string) {
    const q = await this.prisma.question.findUnique({ where: { id } });
    if (!q) throw new NotFoundException('Question not found');
    return this.prisma.question.delete({ where: { id } });
  }

  /* ── Prompts ── */

  async listPrompts(query: { status?: string; level?: string; task_type?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};
    if (query.status) where.status = query.status as ContentStatus;
    if (query.level) where.level = query.level as CefrLevel;
    if (query.task_type) where.task_type = query.task_type;

    const [data, total] = await Promise.all([
      this.prisma.prompt.findMany({
        where,
        include: { creator: { select: { id: true, display_name: true } }, _count: { select: { submissions: true } } },
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
      where: { id },
      include: { creator: { select: { id: true, display_name: true } } },
    });
    if (!prompt) throw new NotFoundException('Prompt not found');
    return prompt;
  }

  async createPrompt(adminId: string, dto: { task_type: string; title: string; prompt_text: string; level: CefrLevel; topic_tags?: string[]; status?: ContentStatus; min_words?: number }) {
    return this.prisma.prompt.create({
      data: {
        task_type: dto.task_type as any,
        title: dto.title,
        prompt_text: dto.prompt_text,
        level: dto.level,
        topic_tags: dto.topic_tags || [],
        status: dto.status || ContentStatus.draft,
        min_words: dto.min_words || 250,
        created_by: adminId,
      },
    });
  }

  async updatePrompt(id: string, dto: { title?: string; prompt_text?: string; level?: CefrLevel; topic_tags?: string[]; status?: ContentStatus; min_words?: number }) {
    await this.getPrompt(id);
    return this.prisma.prompt.update({ where: { id }, data: dto });
  }

  async deletePrompt(id: string) {
    await this.getPrompt(id);
    return this.prisma.prompt.delete({ where: { id } });
  }

  /* ── Users Management ── */

  async listUsers(query: { role?: string; search?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};
    if (query.role) where.role = query.role as UserRole;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { display_name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: { id: true, email: true, display_name: true, role: true, created_at: true, updated_at: true },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async updateUserRole(userId: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, display_name: true, role: true },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.delete({ where: { id: userId } });
  }

  /* ── System Stats ── */

  async getSystemStats() {
    const [users, passages, prompts, readingSubs, writingSubs] = await Promise.all([
      this.prisma.user.groupBy({ by: ['role'], _count: true }),
      this.prisma.passage.groupBy({ by: ['status'], _count: true }),
      this.prisma.prompt.groupBy({ by: ['status'], _count: true }),
      this.prisma.readingSubmission.count(),
      this.prisma.writingSubmission.count(),
    ]);

    return {
      users: {
        total: users.reduce((acc, r) => acc + r._count, 0),
        by_role: Object.fromEntries(users.map(r => [r.role, r._count])),
      },
      passages: {
        total: passages.reduce((acc, r) => acc + r._count, 0),
        by_status: Object.fromEntries(passages.map(r => [r.status, r._count])),
      },
      prompts: {
        total: prompts.reduce((acc, r) => acc + r._count, 0),
        by_status: Object.fromEntries(prompts.map(r => [r.status, r._count])),
      },
      submissions: {
        reading: readingSubs,
        writing: writingSubs,
      },
    };
  }
}
