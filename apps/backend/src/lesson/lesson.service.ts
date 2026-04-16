import { Injectable, NotFoundException } from '@nestjs/common';
import { CefrLevel, LessonContentType, Prisma, QuestionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import type { HybridParseResult, IeltsQuestionType, ParsedQuestion } from '../reading/hybrid-parser.types';

const VALID_QUESTION_TYPES = new Set<IeltsQuestionType>([
    'matching_headings', 'true_false_notgiven', 'yes_no_notgiven', 'mcq',
    'matching_information', 'matching_features', 'matching_sentence_endings',
    'sentence_completion', 'summary_completion', 'table_completion',
    'flowchart_completion', 'diagram_label_completion', 'short',
]);

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
            const { passageId } = await this.upsertPassageFromPayload({
                userId,
                lessonTitle,
                payload: reading_payload,
                targetLevel: target_level,
            });
            data.linked_entity_id = passageId;
            data.content_type = data.content_type || LessonContentType.passage;
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
            const { passageId } = await this.upsertPassageFromPayload({
                userId,
                lessonTitle,
                payload: reading_payload,
                targetLevel: target_level,
                existingPassageId: lesson.linked_entity_id || undefined,
            });
            data.linked_entity_id = passageId;
            data.content_type = data.content_type || LessonContentType.passage;
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
        payload: HybridParseResult;
        targetLevel?: CefrLevel;
        existingPassageId?: string;
    }): Promise<{ passageId: string }> {
        const { userId, lessonTitle, payload, targetLevel, existingPassageId } = params;
        const level = targetLevel || CefrLevel.B2;

        const pdfUrl = payload?.passage?.source_pdf_url;
        const bodyHtml = (payload?.passage?.body_html || '').trim();
        const body = pdfUrl
            ? `<iframe src="${pdfUrl}" style="width:100%;height:100%;border:0" data-source-pdf="${pdfUrl}"></iframe>`
            : bodyHtml || '<p></p>';

        let passageId = existingPassageId;
        if (passageId) {
            await this.prisma.question.deleteMany({ where: { passage_id: passageId } });
            await this.prisma.passage.update({
                where: { id: passageId },
                data: { title: lessonTitle, body, level, status: 'published' },
            });
        } else {
            const passage = await this.prisma.passage.create({
                data: { title: lessonTitle, body, level, status: 'published', created_by: userId },
            });
            passageId = passage.id;
        }

        const questions = Array.isArray(payload?.questions) ? payload.questions : [];
        if (questions.length) {
            const groupFirstSeen = new Set<string>();
            const records: Prisma.QuestionCreateManyInput[] = questions.map((q: ParsedQuestion, idx) => {
                const safeType = (VALID_QUESTION_TYPES.has(q.type) ? q.type : 'short') as QuestionType;
                const isFirstInGroup = !groupFirstSeen.has(q.group_id);
                if (isFirstInGroup) groupFirstSeen.add(q.group_id);
                const prompt = isFirstInGroup && q.group_instruction
                    ? `<div class="mb-3 text-gray-800 font-semibold italic border-l-4 border-blue-400 pl-3 text-sm">${q.group_instruction}</div>${q.stem || ''}`
                    : (q.stem || '');
                return {
                    passage_id: passageId,
                    type: safeType,
                    prompt,
                    options: q.options && q.options.length > 0 ? q.options : Prisma.JsonNull,
                    answer_key: q.correct_answer ?? Prisma.JsonNull,
                    order_index: idx,
                };
            });
            await this.prisma.question.createMany({ data: records });
        }

        return { passageId };
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
