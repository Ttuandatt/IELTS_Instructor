import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Request, Query, ForbiddenException } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JoinClassroomDto } from './dto/join-classroom.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('classrooms')
export class ClassroomController {
    constructor(
        private readonly classroomService: ClassroomService,
        private readonly prisma: PrismaService,
    ) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('instructor' as any, 'admin' as any)
    create(@Req() req: any, @Body() createClassroomDto: CreateClassroomDto) {
        return this.classroomService.create(req.user.sub, createClassroomDto);
    }

    @Get()
    findAll(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.classroomService.findAll(req.user.sub, {
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
            status,
        });
    }

    @Get('join') // Defined before :id route to avoid conflict
    joinClassroomFallback() { }

    @Post('join')
    join(@Req() req: any, @Body() joinClassroomDto: JoinClassroomDto) {
        return this.classroomService.join(req.user.sub, joinClassroomDto);
    }

    // ── Library: Published Passages & Prompts for Lesson linking ─────────────

    @Get('library/passages')
    async listPublishedPassages(@Query('q') q?: string) {
        return this.prisma.passage.findMany({
            where: {
                status: 'published' as any,
                ...(q ? { title: { contains: q, mode: 'insensitive' as any } } : {}),
            },
            select: { id: true, title: true, level: true, tags: { select: { name: true } } },
            orderBy: { title: 'asc' },
            take: 100,
        });
    }

    @Get('library/prompts')
    async listPublishedPrompts(@Query('q') q?: string) {
        return this.prisma.prompt.findMany({
            where: {
                status: 'published' as any,
                ...(q ? { title: { contains: q, mode: 'insensitive' as any } } : {}),
            },
            select: { id: true, title: true, task_type: true, level: true },
            orderBy: { title: 'asc' },
            take: 100,
        });
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        // Must be member check
        const members = await this.classroomService.getMembers(id);
        const isMember = members.some(m => m.user_id === req.user.sub);
        const userRole = req.user.role;
        if (!isMember && userRole !== 'admin') {
            throw new ForbiddenException('Not a member of this classroom');
        }
        return this.classroomService.findOne(req.user.sub, id);
    }

    @Patch(':id')
    async update(@Req() req: any, @Param('id') id: string, @Body() updateClassroomDto: UpdateClassroomDto) {
        await this.checkOwnership(req.user, id);
        return this.classroomService.update(req.user.sub, id, updateClassroomDto);
    }

    @Delete(':id')
    async remove(@Req() req: any, @Param('id') id: string) {
        await this.checkOwnership(req.user, id);
        return this.classroomService.remove(req.user.sub, id);
    }

    // -- Members API --

    @Post(':id/members')
    async addMember(@Req() req: any, @Param('id') id: string, @Body() addMemberDto: AddMemberDto) {
        await this.checkOwnership(req.user, id);
        return this.classroomService.addMember(req.user.sub, id, addMemberDto);
    }

    @Get(':id/members')
    async getMembers(@Req() req: any, @Param('id') id: string) {
        await this.checkOwnership(req.user, id);
        return this.classroomService.getMembers(id);
    }

    @Delete(':id/members/:userId')
    async removeMember(@Req() req: any, @Param('id') id: string, @Param('userId') userId: string) {
        await this.checkOwnership(req.user, id);
        return this.classroomService.removeMember(id, userId);
    }

    @Get(':id/progress')
    async getProgress(@Req() req: any, @Param('id') id: string) {
        await this.checkOwnership(req.user, id);
        return this.classroomService.getClassroomProgress(id);
    }

    // ── Invite API ──────────────────────────────────────────────────
    @Get(':id/invite')
    async getInvite(@Req() req: any, @Param('id') id: string) {
        await this.checkOwnership(req.user, id);
        // Ideally from config/env:
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return this.classroomService.getInvite(id, frontendUrl);
    }

    @Post(':id/invite/regenerate')
    async regenerateInvite(@Req() req: any, @Param('id') id: string) {
        await this.checkOwnership(req.user, id);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return this.classroomService.regenerateInvite(id, frontendUrl);
    }

    // ─── Topic & Lesson Status Toggles ──────────────────────────────────────

    @Patch('topics/:topicId/toggle-status')
    async toggleTopicStatus(@Req() req: any, @Param('topicId') topicId: string) {
        const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic) throw new ForbiddenException('Topic not found');
        await this.checkOwnership(req.user, topic.classroom_id);
        return this.classroomService.toggleTopicStatus(topicId);
    }

    @Patch('lessons/:lessonId/toggle-status')
    async toggleLessonStatus(@Req() req: any, @Param('lessonId') lessonId: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) throw new ForbiddenException('Lesson not found');
        const topic = await this.prisma.topic.findUnique({ where: { id: lesson.topic_id } });
        if (!topic) throw new ForbiddenException('Topic not found');
        await this.checkOwnership(req.user, topic.classroom_id);
        return this.classroomService.toggleLessonStatus(lessonId);
    }

    // ── Duplicate ────────────────────────────────────────────────────────────

    @Post('topics/:topicId/duplicate')
    async duplicateTopic(@Req() req: any, @Param('topicId') topicId: string) {
        const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic) throw new ForbiddenException('Topic not found');
        await this.checkOwnership(req.user, topic.classroom_id);
        return this.classroomService.duplicateTopic(topicId);
    }

    @Post('lessons/:lessonId/duplicate')
    async duplicateLesson(@Req() req: any, @Param('lessonId') lessonId: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) throw new ForbiddenException('Lesson not found');
        const topic = await this.prisma.topic.findUnique({ where: { id: lesson.topic_id } });
        if (!topic) throw new ForbiddenException('Topic not found');
        await this.checkOwnership(req.user, topic.classroom_id);
        return this.classroomService.duplicateLesson(lessonId);
    }

    // ── Announcements ────────────────────────────────────────────────────────

    @Get(':id/announcements')
    async getAnnouncements(@Req() req: any, @Param('id') id: string) {
        await this.checkOwnership(req.user, id);
        return this.classroomService.getAnnouncements(id);
    }

    @Post(':id/announcements')
    async createAnnouncement(@Req() req: any, @Param('id') id: string, @Body() body: { message: string }) {
        await this.checkOwnership(req.user, id);
        return this.classroomService.createAnnouncement(id, req.user.sub, body.message);
    }

    @Delete(':id/announcements/:announcementId')
    async deleteAnnouncement(@Req() req: any, @Param('id') id: string, @Param('announcementId') announcementId: string) {
        await this.checkOwnership(req.user, id);
        return this.classroomService.deleteAnnouncement(announcementId);
    }

    // Helper method for ownership guard inline
    private async checkOwnership(user: any, classroomId: string) {
        if (user.role === 'admin') return true;
        const c = await this.classroomService.findOne(user.sub, classroomId);
        if (!c) throw new ForbiddenException('Classroom not found');
        if (c.owner_id !== user.sub) {
            throw new ForbiddenException('Only classroom owner can perform this action');
        }
        return true;
    }
}
