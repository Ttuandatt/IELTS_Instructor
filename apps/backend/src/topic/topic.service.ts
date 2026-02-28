import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
    constructor(private prisma: PrismaService) { }

    async create(classroomId: string, dto: CreateTopicDto) {
        const maxTopic = await this.prisma.topic.findFirst({
            where: { classroom_id: classroomId },
            orderBy: { order_index: 'desc' },
            select: { order_index: true }
        });
        const nextOrder = maxTopic ? maxTopic.order_index + 1 : 0;

        return this.prisma.topic.create({
            data: {
                ...dto,
                classroom_id: classroomId,
                order_index: nextOrder,
            }
        });
    }

    async findAllByClassroom(classroomId: string, role: string) {
        const where: any = { classroom_id: classroomId };
        if (role === 'student') {
            where.status = 'published';
        }

        return this.prisma.topic.findMany({
            where,
            orderBy: { order_index: 'asc' },
        });
    }

    async update(id: string, dto: UpdateTopicDto) {
        const topic = await this.prisma.topic.findUnique({ where: { id } });
        if (!topic) throw new NotFoundException('Topic not found');

        return this.prisma.topic.update({
            where: { id },
            data: dto
        });
    }

    async remove(id: string) {
        const topic = await this.prisma.topic.findUnique({ where: { id } });
        if (!topic) throw new NotFoundException('Topic not found');

        return this.prisma.topic.delete({
            where: { id }
        });
    }

    async reorder(classroomId: string, topicIds: string[]) {
        const updates = topicIds.map((id, index) =>
            this.prisma.topic.update({
                where: { id },
                data: { order_index: index }
            })
        );
        await this.prisma.$transaction(updates);
        return { success: true };
    }
}
