import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { ContentStatus, CefrLevel, UserRole } from '@prisma/client';
import { ContentVersionService } from './content-version.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly versionService: ContentVersionService,
  ) { }

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

  async createPassage(adminId: string, dto: { title: string; body: string; level: CefrLevel; collection?: string; topic_tags?: string[]; status?: ContentStatus }) {
    const passage = await this.prisma.passage.create({
      data: {
        title: dto.title,
        body: dto.body,
        level: dto.level,
        collection_id: dto.collection,
        tags: {
          connectOrCreate: (dto.topic_tags || []).map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        },
        status: dto.status || ContentStatus.draft,
        created_by: adminId,
      },
    });
    await this.versionService.record({
      entityId: passage.id, entityType: 'passage', action: 'create', editorId: adminId,
    });
    return passage;
  }

  async updatePassage(id: string, dto: { title?: string; body?: string; level?: CefrLevel; collection?: string; topic_tags?: string[]; status?: ContentStatus }, userId?: string, userRole?: string) {
    const passage = await this.getPassage(id);
    if (userId && userRole !== 'admin' && passage.created_by !== userId) {
      throw new ForbiddenException('You can only edit your own passages');
    }
    const updateData: any = { ...dto };
    if ((dto as any).passage !== undefined) { 
      updateData.body = (dto as any).passage;
      delete updateData.passage;
    }
    if (dto.topic_tags !== undefined) {
      updateData.tags = {
        set: [], // Clear existing relations
        connectOrCreate: dto.topic_tags.map(tag => ({
          where: { name: tag },
          create: { name: tag }
        }))
      };
      delete updateData.topic_tags;
    }
    const updated = await this.prisma.passage.update({ where: { id }, data: updateData });
    const action = dto.status === 'published' ? 'publish' : dto.status === 'draft' ? 'unpublish' : 'update';
    if (userId) {
      await this.versionService.record({
        entityId: id, entityType: 'passage', action, editorId: userId, changes: dto,
      });
    }
    return updated;
  }

  async deletePassage(id: string, userId?: string, userRole?: string) {
    const passage = await this.getPassage(id);
    if (userId && userRole !== 'admin' && passage.created_by !== userId) {
      throw new ForbiddenException('You can only delete your own passages');
    }
    if (userId) {
      await this.versionService.record({
        entityId: id, entityType: 'passage', action: 'delete', editorId: userId,
      });
    }
    return this.prisma.passage.delete({ where: { id } });
  }

  async importPassage(adminId: string, dto: { title: string; level: CefrLevel; status: ContentStatus; passage: string; question_groups: any[] }) {
    const VALID_TYPES = new Set(['matching_headings', 'true_false_notgiven', 'yes_no_notgiven', 'mcq', 'matching_information', 'matching_features', 'matching_sentence_endings', 'sentence_completion', 'summary_completion', 'table_completion', 'flowchart_completion', 'diagram_label_completion', 'short']);

    return this.prisma.$transaction(async (tx) => {
      const newPassage = await tx.passage.create({
        data: {
          title: dto.title,
          body: dto.passage,
          level: dto.level,
          status: dto.status || 'draft' as any,
          created_by: adminId,
        }
      });

      let order_index = 0;
      for (const group of dto.question_groups) {
        const safeType = VALID_TYPES.has(group.type) ? group.type : 'short';

        for (let i = 0; i < group.questions?.length; i++) {
          const q = group.questions[i];
          let formattedPrompt = q.prompt;

          if (i === 0) {
            let prefix = '';
            if (group.instruction) {
              prefix += `<div class="mb-3 text-gray-800 font-semibold italic border-l-4 border-blue-400 pl-3 text-sm">${group.instruction}</div>`;
            }
            if (group.group_options && Array.isArray(group.group_options) && group.group_options.length > 0) {
              prefix += `<div class="mb-4 p-4 border border-gray-300 rounded-lg bg-white shadow-sm font-medium text-gray-800">
                <ul class="list-none space-y-1">
                  ${group.group_options.map((opt: string) => `<li>${opt}</li>`).join('')}
                </ul>
              </div>`;
            }
            formattedPrompt = prefix + q.prompt;
          }

          await tx.question.create({
            data: {
              passage_id: newPassage.id,
              type: safeType as any,
              prompt: formattedPrompt,
              options: q.options && q.options.length > 0 ? q.options : undefined,
              answer_key: q.answer_key || null,
              order_index: order_index++,
            }
          });
        }
      }
      return newPassage;
    });
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

  async createPrompt(adminId: string, dto: { task_type: string; title: string; prompt_text: string; level: CefrLevel; collection?: string; topic_tags?: string[]; status?: ContentStatus; min_words?: number }) {
    const prompt = await this.prisma.prompt.create({
      data: {
        task_type: dto.task_type as any,
        title: dto.title,
        prompt_text: dto.prompt_text,
        level: dto.level,
        collection_id: dto.collection,
        tags: {
          connectOrCreate: (dto.topic_tags || []).map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        },
        status: dto.status || ContentStatus.draft,
        min_words: dto.min_words || 250,
        created_by: adminId,
      },
    });
    await this.versionService.record({
      entityId: prompt.id, entityType: 'prompt', action: 'create', editorId: adminId,
    });
    return prompt;
  }

  async updatePrompt(id: string, dto: { title?: string; prompt_text?: string; level?: CefrLevel; collection?: string; topic_tags?: string[]; status?: ContentStatus; min_words?: number }, userId?: string, userRole?: string) {
    const prompt = await this.getPrompt(id);
    if (userId && userRole !== 'admin' && prompt.created_by !== userId) {
      throw new ForbiddenException('You can only edit your own prompts');
    }
    const updateData: any = { ...dto };
    if (dto.collection !== undefined) {
      updateData.collection_id = dto.collection;
      delete updateData.collection;
    }
    if (dto.topic_tags !== undefined) {
      updateData.tags = {
        set: [],
        connectOrCreate: dto.topic_tags.map(tag => ({
          where: { name: tag },
          create: { name: tag }
        }))
      };
      delete updateData.topic_tags;
    }
    const updated = await this.prisma.prompt.update({ where: { id }, data: updateData });
    const action = dto.status === 'published' ? 'publish' : dto.status === 'draft' ? 'unpublish' : 'update';
    if (userId) {
      await this.versionService.record({
        entityId: id, entityType: 'prompt', action, editorId: userId, changes: dto,
      });
    }
    return updated;
  }

  async deletePrompt(id: string, userId?: string, userRole?: string) {
    const prompt = await this.getPrompt(id);
    if (userId && userRole !== 'admin' && prompt.created_by !== userId) {
      throw new ForbiddenException('You can only delete your own prompts');
    }
    if (userId) {
      await this.versionService.record({
        entityId: id, entityType: 'prompt', action: 'delete', editorId: userId,
      });
    }
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
