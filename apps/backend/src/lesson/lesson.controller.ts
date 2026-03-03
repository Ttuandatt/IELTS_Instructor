import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class LessonController {
    constructor(
        private readonly lessonService: LessonService,
        private readonly prisma: PrismaService
    ) { }

    @Post('topics/:topicId/lessons')
    async create(@Req() req: any, @Param('topicId') topicId: string, @Body() createLessonDto: CreateLessonDto) {
        await this.checkTopicOwnership(req.user, topicId);
        return this.lessonService.create(topicId, createLessonDto);
    }

    @Get('topics/:topicId/lessons')
    async findAll(@Req() req: any, @Param('topicId') topicId: string) {
        const role = await this.getTopicRole(req.user, topicId);
        return this.lessonService.findAllByTopic(topicId, role);
    }

    @Get('lessons/:id')
    async findOne(@Param('id') id: string) {
        return this.lessonService.findOne(id);
    }

    @Patch('lessons/:id')
    async update(@Req() req: any, @Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) throw new NotFoundException('Lesson not found');
        await this.checkTopicOwnership(req.user, lesson.topic_id);
        return this.lessonService.update(id, updateLessonDto);
    }

    @Delete('lessons/:id')
    async remove(@Req() req: any, @Param('id') id: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) throw new NotFoundException('Lesson not found');
        await this.checkTopicOwnership(req.user, lesson.topic_id);
        return this.lessonService.remove(id);
    }

    @Patch('topics/:topicId/lessons/reorder')
    async reorder(@Req() req: any, @Param('topicId') topicId: string, @Body() dto: ReorderLessonsDto) {
        await this.checkTopicOwnership(req.user, topicId);
        return this.lessonService.reorder(topicId, dto.lesson_ids);
    }

    private async checkTopicOwnership(user: any, topicId: string) {
        if (user.role === 'admin') return true;
        const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic) throw new NotFoundException('Topic not found');

        const classroom = await this.prisma.classroom.findUnique({ where: { id: topic.classroom_id } });
        if (!classroom || classroom.owner_id !== user.sub) {
            throw new ForbiddenException('Only classroom owner can perform this action');
        }
        return true;
    }

    private async getTopicRole(user: any, topicId: string) {
        if (user.role === 'admin') return 'teacher';
        const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic) throw new NotFoundException('Topic not found');

        const member = await this.prisma.classroomMember.findUnique({
            where: { classroom_id_user_id: { classroom_id: topic.classroom_id, user_id: user.sub } }
        });
        if (!member) throw new ForbiddenException('Not a member of this classroom');
        return member.role;
    }
}
