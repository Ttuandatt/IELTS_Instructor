import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonService {
    constructor(private prisma: PrismaService) { }

    async create(topicId: string, dto: CreateLessonDto) {
        const maxLesson = await this.prisma.lesson.findFirst({
            where: { topic_id: topicId },
            orderBy: { order_index: 'desc' },
            select: { order_index: true }
        });
        const nextOrder = maxLesson ? maxLesson.order_index + 1 : 0;

        return this.prisma.lesson.create({
            data: {
                ...dto,
                topic_id: topicId,
                order_index: nextOrder,
            }
        });
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

    async update(id: string, dto: UpdateLessonDto) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) throw new NotFoundException('Lesson not found');

        return this.prisma.lesson.update({
            where: { id },
            data: dto
        });
    }

    async remove(id: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) throw new NotFoundException('Lesson not found');

        return this.prisma.lesson.delete({
            where: { id }
        });
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
