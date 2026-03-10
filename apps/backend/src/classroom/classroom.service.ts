import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JoinClassroomDto } from './dto/join-classroom.dto';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class ClassroomService {
    constructor(private prisma: PrismaService) { }

    private generateInviteCode(): string {
        return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
    }

    async create(userId: string, dto: CreateClassroomDto) {
        let invite_code = this.generateInviteCode();
        // basic collision handling
        let exists = await this.prisma.classroom.findUnique({ where: { invite_code } });
        while (exists) {
            invite_code = this.generateInviteCode();
            exists = await this.prisma.classroom.findUnique({ where: { invite_code } });
        }

        const classroom = await this.prisma.classroom.create({
            data: {
                name: dto.name,
                description: dto.description,
                cover_image_url: dto.cover_image_url,
                max_members: dto.max_members || 50,
                invite_code,
                owner_id: userId,
                members: {
                    create: {
                        user_id: userId,
                        role: 'teacher',
                    },
                },
            },
        });
        return classroom;
    }

    async findAll(userId: string, options: { page?: number; limit?: number; status?: string }) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = {
            members: { some: { user_id: userId } }
        };
        if (options.status) {
            where.status = options.status;
        }

        const [classrooms, total] = await Promise.all([
            this.prisma.classroom.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    _count: { select: { members: true } },
                    members: { where: { user_id: userId }, select: { role: true } }
                }
            }),
            this.prisma.classroom.count({ where }),
        ]);

        return {
            data: classrooms.map(c => ({
                ...c,
                members_count: c._count.members,
                role: c.members[0]?.role,
                members: undefined,
                _count: undefined,
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(userId: string, id: string) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { id },
            include: {
                _count: { select: { members: true } },
                members: { where: { user_id: userId } },
                topics: {
                    orderBy: { order_index: 'asc' },
                    include: {
                        lessons: { orderBy: { order_index: 'asc' } }
                    }
                }
            }
        });

        if (!classroom) throw new NotFoundException('Classroom not found');

        // Extract current user's role before stripping members from response
        const userRole = classroom.members[0]?.role;
        const isTeacher = userRole === 'teacher';

        // Filter topics/lessons for students (only show published content)
        if (!isTeacher) {
            classroom.topics = classroom.topics.filter(t => t.status === 'published').map(t => {
                t.lessons = t.lessons.filter(l => l.status === 'published');
                return t;
            });
        }

        // Preview rendering for Passages
        const passageEntityIds = classroom.topics
            .flatMap(t => t.lessons)
            .filter(l => l.content_type === 'passage' && l.linked_entity_id)
            .map(l => l.linked_entity_id as string);

        if (passageEntityIds.length > 0) {
            const passages = await this.prisma.passage.findMany({
                where: { id: { in: passageEntityIds } },
                select: { id: true, title: true, body: true }
            });
            const passageMap = new Map(passages.map(p => [p.id, p]));

            classroom.topics.forEach(t => {
                t.lessons.forEach((l: any) => {
                    if (l.content_type === 'passage' && l.linked_entity_id) {
                        l.linked_passage = passageMap.get(l.linked_entity_id);
                    }
                });
            });
        }

        return {
            ...classroom,
            role: userRole,           // ← include the user's role!
            members_count: classroom._count.members,
            members: undefined,
            _count: undefined,
        };

    }

    async update(userId: string, id: string, dto: UpdateClassroomDto) {
        const classroom = await this.prisma.classroom.findUnique({ where: { id } });
        if (!classroom) throw new NotFoundException('Classroom not found');

        // Ownership check done in guard/controller, but strictly speaking we should just double check here or trust controller
        return this.prisma.classroom.update({
            where: { id },
            data: dto,
        });
    }

    async remove(userId: string, id: string) {
        // Soft delete / archive
        const classroom = await this.prisma.classroom.findUnique({ where: { id } });
        if (!classroom) throw new NotFoundException('Classroom not found');

        return this.prisma.classroom.update({
            where: { id },
            data: { status: 'archived' },
        });
    }

    // Members Management
    async addMember(ownerId: string, classroomId: string, dto: AddMemberDto) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { id: classroomId },
            include: { _count: { select: { members: true } } }
        });
        if (!classroom) throw new NotFoundException('Classroom not found');

        if (classroom._count.members >= classroom.max_members) {
            throw new ForbiddenException('Classroom is full');
        }

        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new NotFoundException('User not found with this email');

        const memberExists = await this.prisma.classroomMember.findUnique({
            where: { classroom_id_user_id: { classroom_id: classroomId, user_id: user.id } }
        });
        if (memberExists) throw new ConflictException('User is already a member');

        return this.prisma.classroomMember.create({
            data: {
                classroom_id: classroomId,
                user_id: user.id,
                role: 'student',
            }
        });
    }

    async getMembers(classroomId: string) {
        return this.prisma.classroomMember.findMany({
            where: { classroom_id: classroomId },
            include: {
                user: { select: { display_name: true, email: true, id: true } }
            },
            orderBy: { joined_at: 'asc' }
        });
    }

    async removeMember(classroomId: string, userIdToRemove: string) {
        const member = await this.prisma.classroomMember.findUnique({
            where: { classroom_id_user_id: { classroom_id: classroomId, user_id: userIdToRemove } }
        });
        if (!member) throw new NotFoundException('Member not found');

        return this.prisma.classroomMember.delete({
            where: { classroom_id_user_id: { classroom_id: classroomId, user_id: userIdToRemove } }
        });
    }

    // Invite Logic
    async getInvite(classroomId: string, frontendUrl: string) {
        const classroom = await this.prisma.classroom.findUnique({ where: { id: classroomId } });
        if (!classroom) throw new NotFoundException();

        const invite_url = `${frontendUrl}/classrooms/join/${classroom.invite_code}`;
        const qr_code_base64 = await QRCode.toDataURL(invite_url);

        return {
            invite_code: classroom.invite_code,
            invite_url,
            qr_code_base64,
        };
    }

    async regenerateInvite(classroomId: string, frontendUrl: string) {
        let invite_code = this.generateInviteCode();
        let exists = await this.prisma.classroom.findUnique({ where: { invite_code } });
        while (exists) {
            invite_code = this.generateInviteCode();
            exists = await this.prisma.classroom.findUnique({ where: { invite_code } });
        }

        await this.prisma.classroom.update({
            where: { id: classroomId },
            data: { invite_code }
        });

        return this.getInvite(classroomId, frontendUrl);
    }

    async join(userId: string, dto: JoinClassroomDto) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { invite_code: dto.invite_code },
            include: { _count: { select: { members: true } } }
        });

        if (!classroom) throw new NotFoundException('Invalid invite code');

        if (classroom._count.members >= classroom.max_members) {
            throw new ForbiddenException('Classroom is full');
        }

        const memberExists = await this.prisma.classroomMember.findUnique({
            where: { classroom_id_user_id: { classroom_id: classroom.id, user_id: userId } }
        });

        if (memberExists) throw new ConflictException('Already a member');

        await this.prisma.classroomMember.create({
            data: {
                classroom_id: classroom.id,
                user_id: userId,
                role: 'student',
            }
        });

        return {
            classroom_id: classroom.id,
            classroom_name: classroom.name,
            role: 'student'
        };
    }

    // ─── Topic & Lesson Status Toggles (quick publish/draft) ─────────────────

    async toggleTopicStatus(topicId: string) {
        const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic) throw new NotFoundException('Topic not found');
        const newStatus = topic.status === 'published' ? ('draft' as const) : ('published' as const);
        return this.prisma.topic.update({ where: { id: topicId }, data: { status: newStatus } });
    }

    async toggleLessonStatus(lessonId: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) throw new NotFoundException('Lesson not found');
        const newStatus = lesson.status === 'published' ? ('draft' as const) : ('published' as const);
        return this.prisma.lesson.update({ where: { id: lessonId }, data: { status: newStatus } });
    }

    // ─── Student Progress ────────────────────────────────────────────────────

    async getClassroomProgress(classroomId: string) {
        const members = await this.prisma.classroomMember.findMany({
            where: { classroom_id: classroomId, role: 'student' },
            include: {
                user: {
                    select: {
                        id: true, display_name: true, email: true,
                        reading_submissions: {
                            select: { id: true, score_pct: true, completed_at: true },
                            orderBy: { completed_at: 'desc' },
                            take: 5,
                        },
                        writing_submissions: {
                            where: { processing_status: 'done' },
                            select: { id: true, scores: true, created_at: true },
                            orderBy: { created_at: 'desc' },
                            take: 5,
                        },
                    },
                },
            },
            orderBy: { joined_at: 'asc' },
        });

        return members.map(m => ({
            user_id: m.user_id,
            display_name: m.user.display_name || m.user.email,
            email: m.user.email,
            joined_at: m.joined_at,
            reading_count: m.user.reading_submissions.length,
            reading_avg: m.user.reading_submissions.length > 0
                ? Math.round(m.user.reading_submissions.reduce((s, r) => s + r.score_pct, 0) / m.user.reading_submissions.length * 10) / 10
                : null,
            writing_count: m.user.writing_submissions.length,
            writing_avg: m.user.writing_submissions.length > 0
                ? Math.round(m.user.writing_submissions.reduce((s, w) => s + ((w.scores as any)?.overall || 0), 0) / m.user.writing_submissions.length * 10) / 10
                : null,
            recent_reading: m.user.reading_submissions.slice(0, 3),
            recent_writing: m.user.writing_submissions.slice(0, 3),
        }));
    }

    // ─── Duplicate Topic / Lesson ───────────────────────────────────────

    async duplicateTopic(topicId: string) {
        const topic = await this.prisma.topic.findUnique({
            where: { id: topicId },
            include: { lessons: { orderBy: { order_index: 'asc' } } },
        });
        if (!topic) throw new NotFoundException('Topic not found');

        const count = await this.prisma.topic.count({ where: { classroom_id: topic.classroom_id } });
        const newTopic = await this.prisma.topic.create({
            data: {
                classroom_id: topic.classroom_id,
                title: `${topic.title} (Copy)`,
                description: topic.description,
                status: 'draft' as const,
                order_index: count,
            },
        });

        // Duplicate all lessons
        if (topic.lessons.length > 0) {
            await this.prisma.lesson.createMany({
                data: topic.lessons.map((l, i) => ({
                    topic_id: newTopic.id,
                    title: l.title,
                    content: l.content,
                    content_type: l.content_type,
                    linked_entity_id: l.linked_entity_id,
                    status: 'draft' as const,
                    order_index: i,
                })),
            });
        }

        return this.prisma.topic.findUnique({
            where: { id: newTopic.id },
            include: { lessons: true },
        });
    }

    async duplicateLesson(lessonId: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) throw new NotFoundException('Lesson not found');

        const count = await this.prisma.lesson.count({ where: { topic_id: lesson.topic_id } });
        return this.prisma.lesson.create({
            data: {
                topic_id: lesson.topic_id,
                title: `${lesson.title} (Copy)`,
                content: lesson.content,
                content_type: lesson.content_type,
                linked_entity_id: lesson.linked_entity_id,
                status: 'draft' as const,
                order_index: count,
            },
        });
    }

    // ─── Announcements ─────────────────────────────────────────────────────

    async getAnnouncements(classroomId: string) {
        return this.prisma.announcement.findMany({
            where: { classroom_id: classroomId },
            orderBy: { created_at: 'desc' },
            take: 20,
            include: { author: { select: { display_name: true } } },
        });
    }

    async createAnnouncement(classroomId: string, authorId: string, message: string) {
        return this.prisma.announcement.create({
            data: { classroom_id: classroomId, author_id: authorId, message },
            include: { author: { select: { display_name: true } } },
        });
    }

    async deleteAnnouncement(announcementId: string) {
        return this.prisma.announcement.delete({ where: { id: announcementId } });
    }
}
