import { Injectable, NotFoundException } from '@nestjs/common';
import { CefrLevel, LessonContentType, Prisma, QuestionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { buildReadingHtml } from '../reading/reading-html.util';

@Injectable()
export class LessonService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, topicId: string, dto: CreateLessonDto) {
        const maxLesson = await this.prisma.lesson.findFirst({
            where: { topic_id: topicId },
            orderBy: { order_index: 'desc' },
            select: { order_index: true }
        });
        const nextOrder = maxLesson ? maxLesson.order_index + 1 : 0;

        const { reading_payload, target_level, ...lessonFields } = dto as any;
        const data: Prisma.LessonUncheckedCreateInput = {
            ...lessonFields,
            topic_id: topicId,
            order_index: nextOrder,
        };

        const lessonTitle: string = data.title || 'Reading Lesson';

        if (reading_payload) {
            const { passageId, lessonHtml } = await this.upsertPassageFromPayload({
                userId,
                lessonTitle,
                payload: reading_payload,
                targetLevel: target_level,
            });
            data.linked_entity_id = passageId;
            data.content_type = data.content_type || LessonContentType.passage;
            if (lessonHtml) {
                data.content = lessonHtml;
            }
        }

        return this.prisma.lesson.create({ data });
    }

    async findAllByTopic(topicId: string, role: string) {
        const where: any = { topic_id: topicId };
        if (role === 'student') {
            where.status = 'published';
        }

        return this.prisma.lesson.findMany({
            where,
            orderBy: { order_index: 'asc' },
        });
    }

    async findOne(id: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) throw new NotFoundException('Lesson not found');
        return lesson;
    }

    async update(userId: string, id: string, dto: UpdateLessonDto) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) throw new NotFoundException('Lesson not found');

        const { reading_payload, target_level, ...lessonFields } = dto as any;
        const data: Prisma.LessonUncheckedUpdateInput = {
            ...lessonFields,
        };

        if (reading_payload) {
            const lessonTitle: string = (data.title as string) || lesson.title;
            const { passageId, lessonHtml } = await this.upsertPassageFromPayload({
                userId,
                lessonTitle,
                payload: reading_payload,
                targetLevel: target_level,
                existingPassageId: lesson.linked_entity_id || undefined,
            });
            data.linked_entity_id = passageId;
            data.content_type = data.content_type || LessonContentType.passage;
            if (lessonHtml) {
                data.content = lessonHtml;
            }
        }

        return this.prisma.lesson.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) throw new NotFoundException('Lesson not found');

        return this.prisma.lesson.delete({
            where: { id }
        });
    }

    private async upsertPassageFromPayload(params: {
        userId: string;
        lessonTitle: string;
        payload: any;
        targetLevel?: CefrLevel;
        existingPassageId?: string;
    }): Promise<{ passageId: string; lessonHtml: string }> {
        const { userId, lessonTitle, payload, targetLevel, existingPassageId } = params;
        const level = targetLevel || CefrLevel.B2;
        const passageHtml = (payload?.passage?.html || '').trim();
        const passageText = (payload?.passage?.text || '').trim();
        const body = passageHtml || passageText || '';
        const safeBody = body || '<p></p>';

        let passageId = existingPassageId;
        if (passageId) {
            await this.prisma.question.deleteMany({ where: { passage_id: passageId } });
            await this.prisma.passage.update({
                where: { id: passageId },
                data: {
                    title: lessonTitle,
                    body: safeBody,
                    level,
                },
            });
        } else {
            const passage = await this.prisma.passage.create({
                data: {
                    title: lessonTitle,
                    body: safeBody,
                    level,
                    created_by: userId,
                },
            });
            passageId = passage.id;
        }

        const questionRecords = this.buildQuestionRecords(payload?.questions, passageId);
        if (questionRecords.length) {
            await this.prisma.question.createMany({ data: questionRecords });
        }

        return {
            passageId,
            lessonHtml: buildReadingHtml(payload),
        };
    }

    private buildQuestionRecords(rawQuestions: any, passageId: string): Prisma.QuestionCreateManyInput[] {
        if (!Array.isArray(rawQuestions)) return [];

        return rawQuestions
            .map((item: any, index: number): Prisma.QuestionCreateManyInput | null => {
                const kind = (item?.type || 'question').toLowerCase();
                if (kind !== 'question') return null;
                const prompt = (item?.html || item?.text || '').trim();
                if (!prompt) return null;
                const options = Array.isArray(item?.options) ? item.options : null;
                const answerKey = this.normalizeAnswerKey(item);
                return {
                    passage_id: passageId,
                    type: QuestionType.short,
                    prompt,
                    options,
                    answer_key: answerKey,
                    order_index: index,
                };
            })
            .filter((record): record is Prisma.QuestionCreateManyInput => Boolean(record));
    }

    private normalizeAnswerKey(item: any) {
        const raw = item?.answer_key ?? item?.answers ?? item?.answer ?? [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string' && raw.trim()) return [raw.trim()];
        return [];
    }

    async reorder(topicId: string, lessonIds: string[]) {
        const updates = lessonIds.map((id, index) =>
            this.prisma.lesson.update({
                where: { id },
                data: { order_index: index }
            })
        );
        await this.prisma.$transaction(updates);
        return { success: true };
    }
}
