import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class LessonController {
    private readonly logger = new Logger(LessonController.name);

    constructor(
        private readonly lessonService: LessonService,
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
    ) { }

    @Post('topics/:topicId/lessons')
    async create(@Req() req: any, @Param('topicId') topicId: string, @Body() createLessonDto: CreateLessonDto) {
        await this.checkTopicOwnership(req.user, topicId);
        return this.lessonService.create(req.user.sub, topicId, createLessonDto);
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
        return this.lessonService.update(req.user.sub, id, updateLessonDto);
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

    @Post('lessons/:id/submissions')
    async submitEssay(
        @Req() req: any,
        @Param('id') lessonId: string,
        @Body() body: { content: string },
    ) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { topic: { include: { classroom: true } } },
        });
        if (!lesson) throw new NotFoundException('Lesson not found');
        if (!lesson.allow_submit) throw new ForbiddenException('Submissions are not enabled for this lesson');
        if (!body.content?.trim()) throw new ForbiddenException('Content cannot be empty');

        const wordCount = body.content.trim().split(/\s+/).filter(Boolean).length;

        const submission = await this.prisma.lessonSubmission.create({
            data: {
                lesson_id: lessonId,
                user_id: req.user.sub,
                content: body.content,
                word_count: wordCount,
            },
        });

        // Notify classroom owner about the new submission
        if (lesson.topic?.classroom?.owner_id) {
            try {
                const user = await this.prisma.user.findUnique({
                    where: { id: req.user.sub },
                    select: { display_name: true },
                });
                const displayName = user?.display_name || 'A student';
                await this.notificationService.create({
                    userId: lesson.topic.classroom.owner_id,
                    type: 'lesson_submission',
                    title: 'Bài nộp mới',
                    message: `${displayName} đã nộp bài trong "${lesson.title}"`,
                    link: `/classrooms/${lesson.topic.classroom.id}/lessons/${lessonId}/submissions`,
                    metadata: { lessonId, submissionId: submission.id },
                });
            } catch (err) {
                this.logger.error('Failed to create submission notification', err);
            }
        }

        return submission;
    }

    @Get('lessons/:id/submissions')
    async getSubmissions(@Param('id') lessonId: string) {
        return this.prisma.lessonSubmission.findMany({
            where: { lesson_id: lessonId },
            orderBy: { created_at: 'desc' },
            include: { user: { select: { id: true, display_name: true, email: true } } },
        });
    }

    @Get('lessons/:id/my-submissions')
    async getMySubmissions(@Req() req: any, @Param('id') lessonId: string) {
        return this.prisma.lessonSubmission.findMany({
            where: { lesson_id: lessonId, user_id: req.user.sub },
            orderBy: { created_at: 'desc' },
        });
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
