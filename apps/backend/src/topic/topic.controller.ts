import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ReorderTopicsDto } from './dto/reorder-topics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class TopicController {
    constructor(
        private readonly topicService: TopicService,
        private readonly prisma: PrismaService
    ) { }

    @Post('classrooms/:classroomId/topics')
    async create(@Req() req: any, @Param('classroomId') classroomId: string, @Body() createTopicDto: CreateTopicDto) {
        await this.checkClassroomOwnership(req.user, classroomId);
        return this.topicService.create(classroomId, createTopicDto);
    }

    @Get('classrooms/:classroomId/topics')
    async findAll(@Req() req: any, @Param('classroomId') classroomId: string) {
        const role = await this.getClassroomRole(req.user, classroomId);
        return this.topicService.findAllByClassroom(classroomId, role);
    }

    @Patch('topics/:id')
    async update(@Req() req: any, @Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
        const topic = await this.prisma.topic.findUnique({ where: { id } });
        if (!topic) throw new NotFoundException('Topic not found');
        await this.checkClassroomOwnership(req.user, topic.classroom_id);
        return this.topicService.update(id, updateTopicDto);
    }

    @Delete('topics/:id')
    async remove(@Req() req: any, @Param('id') id: string) {
        const topic = await this.prisma.topic.findUnique({ where: { id } });
        if (!topic) throw new NotFoundException('Topic not found');
        await this.checkClassroomOwnership(req.user, topic.classroom_id);
        return this.topicService.remove(id);
    }

    @Patch('classrooms/:classroomId/topics/reorder')
    async reorder(@Req() req: any, @Param('classroomId') classroomId: string, @Body() dto: ReorderTopicsDto) {
        await this.checkClassroomOwnership(req.user, classroomId);
        return this.topicService.reorder(classroomId, dto.topic_ids);
    }

    private async checkClassroomOwnership(user: any, classroomId: string) {
        if (user.role === 'admin') return true;
        const classroom = await this.prisma.classroom.findUnique({ where: { id: classroomId } });
        if (!classroom) throw new NotFoundException('Classroom not found');
        if (classroom.owner_id !== user.sub) {
            throw new ForbiddenException('Only classroom owner can perform this action');
        }
        return true;
    }

    private async getClassroomRole(user: any, classroomId: string) {
        if (user.role === 'admin') return 'teacher';
        const member = await this.prisma.classroomMember.findUnique({
            where: { classroom_id_user_id: { classroom_id: classroomId, user_id: user.sub } }
        });
        if (!member) throw new ForbiddenException('Not a member of this classroom');
        return member.role;
    }
}
