"use client";

import { useState, useEffect, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Loader2, Settings, Users, ArrowLeft, Plus, Play, FileText, BookOpen, ChevronDown, ChevronRight, Eye, EyeOff, Pencil, ExternalLink, BarChart2, Copy, Megaphone, Paperclip, PenTool } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Import our Dialogs
import { TopicDialog } from '@/components/classroom/TopicDialog';
import { LessonDialog } from '@/components/classroom/LessonDialog';
import { AnnouncementPanel } from '@/components/classroom/AnnouncementPanel';

// Fix relative /uploads/ paths in HTML content to use full backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
function fixContentUrls(html: string): string {
    return html.replace(/src="\/uploads\//g, `src="${BACKEND_URL}/uploads/`);
}

export default function ClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});

    const toggleAccordion = (topicId: string) => {
        setOpenTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    // Dialog states
    const [topicDialogOpen, setTopicDialogOpen] = useState(false);
    const [activeTopicForEdit, setActiveTopicForEdit] = useState<any>(null);
    const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
    const [activeLessonForEdit, setActiveLessonForEdit] = useState<any>(null);
    const [selectedTopicIdForLesson, setSelectedTopicIdForLesson] = useState<string>('');
    const [sidebarTab, setSidebarTab] = useState<'syllabus' | 'announcements'>('syllabus');

    const { data: classroom, isLoading, isError } = useQuery({
        queryKey: ['classroom', id],
        queryFn: () => apiClient.get(`/classrooms/${id}`).then(r => r.data),
    });

    useEffect(() => {
        if (classroom?.topics) {
            const initialOpenStates: Record<string, boolean> = {};
            classroom.topics.forEach((t: any) => initialOpenStates[t.id] = true);
            setOpenTopics(initialOpenStates);
        }
    }, [classroom]);

    // Toggle Topic publish/draft status
    const { mutate: toggleTopicStatus } = useMutation({
        mutationFn: (topicId: string) => apiClient.patch(`/classrooms/topics/${topicId}/toggle-status`).then(r => r.data),
        onSuccess: (data) => {
            toast.success(`Topic "${data.title}" is now ${data.status}`);
            queryClient.invalidateQueries({ queryKey: ['classroom', id] });
        },
        onError: () => toast.error('Failed to update topic status'),
    });

    // Toggle Lesson publish/draft status
    const { mutate: toggleLessonStatus } = useMutation({
        mutationFn: (lessonId: string) => apiClient.patch(`/classrooms/lessons/${lessonId}/toggle-status`).then(r => r.data),
        onSuccess: (data) => {
            toast.success(`Lesson "${data.title}" is now ${data.status}`);
            queryClient.invalidateQueries({ queryKey: ['classroom', id] });
            // Also update activeLesson if it's the one being toggled
            if (activeLesson?.id === data.id) setActiveLesson(data);
        },
        onError: () => toast.error('Failed to update lesson status'),
    });

    // Duplicate Topic
    const { mutate: duplicateTopic } = useMutation({
        mutationFn: (topicId: string) => apiClient.post(`/classrooms/topics/${topicId}/duplicate`).then(r => r.data),
        onSuccess: (data) => {
            toast.success(`Topic duplicated as "${data.title}"`);
            queryClient.invalidateQueries({ queryKey: ['classroom', id] });
        },
        onError: () => toast.error('Failed to duplicate topic'),
    });

    // Duplicate Lesson
    const { mutate: duplicateLesson } = useMutation({
        mutationFn: (lessonId: string) => apiClient.post(`/classrooms/lessons/${lessonId}/duplicate`).then(r => r.data),
        onSuccess: (data) => {
            toast.success(`Lesson duplicated as "${data.title}"`);
            queryClient.invalidateQueries({ queryKey: ['classroom', id] });
        },
        onError: () => toast.error('Failed to duplicate lesson'),
    });

    if (isLoading) return <div className="flex pt-20 justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (isError || !classroom) return <div className="text-center pt-20 text-red-500">Classroom not found</div>;

    const isTeacher = classroom.role === 'teacher';

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl h-[calc(100vh-80px)] flex flex-col">

            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
                <div>
                    <Link href="/classrooms" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-2 transition-colors">
                        <ArrowLeft className="w-3 h-3 mr-1" /> My Classrooms
                    </Link>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold">{classroom.name}</h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${classroom.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {classroom.status}
                        </span>
                        {isTeacher && <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">Instructor</span>}
                    </div>
                    <p className="text-gray-500 mt-1 text-sm max-w-2xl line-clamp-2">{classroom.description}</p>
                </div>

                {isTeacher && (
                    <div className="flex gap-2 shrink-0">
                        <Link href={`/classrooms/${id}/progress`}>
                            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors">
                                <BarChart2 className="w-4 h-4 mr-2" /> Progress
                            </button>
                        </Link>
                        <Link href={`/classrooms/${id}/members`}>
                            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors">
                                <Users className="w-4 h-4 mr-2" /> Members ({classroom.members_count})
                            </button>
                        </Link>
                        <Link href={`/classrooms/${id}/edit`}>
                            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors">
                                <Settings className="w-4 h-4 mr-2" /> Settings
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            {/* ── Main Layout ─────────────────────────────────── */}
            <div className="flex flex-col md:flex-row gap-6 grow min-h-0">

                {/* Sidebar: Syllabus / Announcements */}
                <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                    {/* Tab switcher */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setSidebarTab('syllabus')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${sidebarTab === 'syllabus' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 bg-gray-50'}`}
                        >
                            <BookOpen className="w-3.5 h-3.5" /> Syllabus
                        </button>
                        <button
                            onClick={() => setSidebarTab('announcements')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${sidebarTab === 'announcements' ? 'text-orange-600 border-b-2 border-orange-500 bg-white' : 'text-gray-500 hover:text-gray-700 bg-gray-50'}`}
                        >
                            <Megaphone className="w-3.5 h-3.5" /> Announcements
                        </button>
                    </div>

                    {sidebarTab === 'announcements' ? (
                        <AnnouncementPanel classroomId={id} isTeacher={isTeacher} />
                    ) : (
                        <>
                            {isTeacher && (
                                <div className="p-2 border-b bg-gray-50 flex justify-end">
                                    <button
                                        className="text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors"
                                        onClick={() => { setActiveTopicForEdit(null); setTopicDialogOpen(true); }}
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Topic
                                    </button>
                                </div>
                            )}

                            <div className="overflow-y-auto grow p-2 custom-scrollbar">
                                {!classroom.topics || classroom.topics.length === 0 ? (
                                    <div className="text-center py-10 px-4">
                                        <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                        <p className="text-gray-500 text-sm">No topics yet.</p>
                                        {isTeacher && <p className="text-gray-400 text-xs mt-1">Click "+ Topic" to create your first topic.</p>}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {classroom.topics.map((topic: any) => (
                                            <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden">

                                                {/* Topic header */}
                                                <div
                                                    className="bg-white hover:bg-gray-50 px-3 py-2 cursor-pointer flex justify-between items-center group select-none"
                                                    onClick={() => toggleAccordion(topic.id)}
                                                >
                                                    <div className="flex items-center text-left gap-1.5 min-w-0">
                                                        {openTopics[topic.id]
                                                            ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                                            : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                                        }
                                                        <span className="font-semibold text-[15px] truncate">{topic.title}</span>
                                                        {topic.status === 'draft' && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700 shrink-0">Draft</span>
                                                        )}
                                                    </div>

                                                    {isTeacher && (
                                                        <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                                                            {/* Toggle publish/draft */}
                                                            <button
                                                                title={topic.status === 'published' ? 'Set to Draft' : 'Publish'}
                                                                className="p-1 rounded hover:bg-gray-200 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); toggleTopicStatus(topic.id); }}
                                                            >
                                                                {topic.status === 'published'
                                                                    ? <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                                                                    : <Eye className="w-3.5 h-3.5 text-blue-500" />
                                                                }
                                                            </button>
                                                            {/* Edit */}
                                                            <button
                                                                title="Edit topic"
                                                                className="p-1 rounded hover:bg-gray-200 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); setActiveTopicForEdit(topic); setTopicDialogOpen(true); }}
                                                            >
                                                                <Pencil className="w-3.5 h-3.5 text-gray-500" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Lessons list */}
                                                {openTopics[topic.id] && (
                                                    <div className="bg-gray-50/50 p-2 border-t border-gray-100 space-y-1">
                                                        {topic.lessons?.map((lesson: any) => (
                                                            <div
                                                                key={lesson.id}
                                                                onClick={() => setActiveLesson(lesson)}
                                                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-sm group/lesson ${activeLesson?.id === lesson.id
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-medium'
                                                                    : 'hover:bg-gray-100 border border-transparent text-gray-700'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2 truncate">
                                                                    {lesson.content_type === 'video'
                                                                        ? <Play className="w-4 h-4 shrink-0 text-blue-500" />
                                                                        : lesson.content_type === 'passage'
                                                                            ? <BookOpen className="w-4 h-4 shrink-0 text-green-500" />
                                                                            : <FileText className="w-4 h-4 shrink-0 text-amber-500" />
                                                                    }
                                                                    <span className="truncate">{lesson.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 shrink-0 ml-1">
                                                                    {lesson.status === 'draft' && (
                                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-600">Draft</span>
                                                                    )}
                                                                    {isTeacher && (
                                                                        <div className="hidden group-hover/lesson:flex items-center gap-0.5">
                                                                            <button
                                                                                title={lesson.status === 'published' ? 'Set to Draft' : 'Publish'}
                                                                                className="p-0.5 rounded hover:bg-gray-300 transition-colors"
                                                                                onClick={(e) => { e.stopPropagation(); toggleLessonStatus(lesson.id); }}
                                                                            >
                                                                                {lesson.status === 'published'
                                                                                    ? <EyeOff className="w-3 h-3 text-gray-500" />
                                                                                    : <Eye className="w-3 h-3 text-blue-500" />
                                                                                }
                                                                            </button>
                                                                            <button
                                                                                title="Edit lesson"
                                                                                className="p-0.5 rounded hover:bg-gray-300 transition-colors"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedTopicIdForLesson(topic.id);
                                                                                    setActiveLessonForEdit(lesson);
                                                                                    setLessonDialogOpen(true);
                                                                                }}
                                                                            >
                                                                                <Pencil className="w-3 h-3 text-gray-500" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {isTeacher && (
                                                            <button
                                                                className="w-full mt-1 text-left px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded flex items-center transition-colors"
                                                                onClick={() => {
                                                                    setSelectedTopicIdForLesson(topic.id);
                                                                    setActiveLessonForEdit(null);
                                                                    setLessonDialogOpen(true);
                                                                }}
                                                            >
                                                                <Plus className="w-3 h-3 mr-1.5" /> Add Lesson
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Main Content: Lesson View */}
                <div className="flex-1 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
                    {activeLesson ? (
                        <div className="h-full flex flex-col">
                            <div className="p-6 border-b bg-gray-50 flex justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{activeLesson.title}</h2>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full border bg-white capitalize text-gray-600">
                                            {activeLesson.content_type}
                                        </span>
                                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${activeLesson.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {activeLesson.status}
                                        </span>
                                    </div>
                                </div>
                                {isTeacher && (
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            className={`text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors border ${activeLesson.status === 'published' ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'}`}
                                            onClick={() => toggleLessonStatus(activeLesson.id)}
                                        >
                                            {activeLesson.status === 'published' ? <><EyeOff className="w-4 h-4 mr-1.5" /> Set Draft</> : <><Eye className="w-4 h-4 mr-1.5" /> Publish</>}
                                        </button>
                                        <button
                                            className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors"
                                            onClick={() => {
                                                setSelectedTopicIdForLesson(activeLesson.topic_id);
                                                setActiveLessonForEdit(activeLesson);
                                                setLessonDialogOpen(true);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Attachment Link */}
                            {activeLesson.attachment_url && (
                                <div className="px-6 py-3 border-b border-gray-100 bg-blue-50/30 flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Attachment:</span>
                                    <a
                                        href={activeLesson.attachment_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                                        title={activeLesson.attachment_url}
                                    >
                                        {activeLesson.attachment_url}
                                    </a>
                                </div>
                            )}

                            {/* ── Smart Lesson Content Renderer ─────────── */}
                            {activeLesson.content_type === 'video' ? (
                                <div className="flex flex-col items-center justify-center grow p-8 gap-4">
                                    {(() => {
                                        const url = activeLesson.content || '';
                                        // Extract YouTube video ID
                                        const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                                        // Extract Vimeo ID
                                        const vimMatch = url.match(/vimeo\.com\/(\d+)/);
                                        if (ytMatch) {
                                            return (
                                                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg max-w-3xl">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0`}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            );
                                        }
                                        if (vimMatch) {
                                            return (
                                                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg max-w-3xl">
                                                    <iframe
                                                        src={`https://player.vimeo.com/video/${vimMatch[1]}`}
                                                        className="w-full h-full"
                                                        allow="autoplay; fullscreen; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="text-center text-gray-400">
                                                <p className="text-sm">Invalid or unsupported video URL.</p>
                                                {url && <p className="text-xs mt-1 font-mono bg-gray-100 px-2 py-1 rounded">{url}</p>}
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : activeLesson.content_type === 'passage' || activeLesson.content_type === 'prompt' ? (
                                <div className="flex flex-col grow p-6 gap-4">
                                    {/* ALWAYS show image from attachment_url if it's an image */}
                                    {activeLesson.attachment_url && !activeLesson.linked_entity_id &&
                                        /\.(png|jpe?g|webp|gif)$/i.test(activeLesson.attachment_url) && (
                                            <div className="relative">
                                                <img
                                                    src={activeLesson.attachment_url}
                                                    alt="Lesson attachment"
                                                    className="w-full object-contain rounded-lg"
                                                    style={{ maxHeight: '220px', border: '1px solid var(--color-border, #e5e7eb)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/60 to-transparent pointer-events-none rounded-b-lg" />
                                            </div>
                                        )}

                                    {/* Instruction / content text (separate from image) */}
                                    {activeLesson.content && !activeLesson.linked_entity_id && (
                                        <div className="relative">
                                            <div
                                                className="w-full prose prose-sm prose-blue max-w-none max-h-[220px] overflow-hidden"
                                                dangerouslySetInnerHTML={{ __html: fixContentUrls(activeLesson.content) }}
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                        </div>
                                    )}

                                    {/* View Full Lesson button */}
                                    {(activeLesson.content || (activeLesson.attachment_url && /\.(png|jpe?g|webp|gif)$/i.test(activeLesson.attachment_url))) && !activeLesson.linked_entity_id && (
                                        <Link href={`/classrooms/${id}/lessons/${activeLesson.id}`}>
                                            <button className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow-md">
                                                View Full Lesson
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </Link>
                                    )}

                                    {/* Attachment download link (non-image files) */}
                                    {activeLesson.attachment_url && !activeLesson.linked_entity_id &&
                                        !/\.(png|jpe?g|webp|gif)$/i.test(activeLesson.attachment_url) && (
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Paperclip className="w-3.5 h-3.5" />
                                                <a
                                                    href={activeLesson.attachment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-blue-500 hover:underline truncate"
                                                >
                                                    Download original file
                                                </a>
                                            </div>
                                        )}

                                    {/* Library-linked content: show practice button */}
                                    {activeLesson.linked_entity_id && (
                                        <>
                                            {activeLesson.content && (
                                                <div
                                                    className="w-full prose prose-sm prose-blue max-w-none mb-4"
                                                    dangerouslySetInnerHTML={{ __html: fixContentUrls(activeLesson.content) }}
                                                />
                                            )}

                                            {/* Passage Preview */}
                                            {activeLesson.linked_passage && (
                                                <div className="relative mb-6 border rounded-xl overflow-hidden bg-white shadow-sm">
                                                    <div className="bg-gray-50 border-b px-4 py-2 font-semibold text-gray-700 text-sm">
                                                        Preview: {activeLesson.linked_passage.title}
                                                    </div>
                                                    <div className="p-4 max-h-60 overflow-hidden relative">
                                                        <div
                                                            className="prose prose-sm prose-blue max-w-none text-gray-600"
                                                            dangerouslySetInnerHTML={{ __html: fixContentUrls(activeLesson.linked_passage.body) }}
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className={`w-full max-w-md p-6 rounded-2xl text-center shadow-md mx-auto ${activeLesson.content_type === 'prompt' ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200'}`}>
                                                <div className="mb-3 flex justify-center">
                                                    {activeLesson.content_type === 'prompt'
                                                        ? <PenTool className="w-8 h-8 text-purple-500" />
                                                        : <BookOpen className="w-8 h-8 text-blue-500" />
                                                    }
                                                </div>
                                                <h3 className={`font-bold text-lg mb-1 ${activeLesson.content_type === 'prompt' ? 'text-purple-800' : 'text-blue-800'}`}>
                                                    {activeLesson.content_type === 'prompt' ? 'Writing Assignment' : 'Reading Test'}
                                                </h3>
                                                <p className={`text-sm mb-4 ${activeLesson.content_type === 'prompt' ? 'text-purple-600' : 'text-blue-600'}`}>
                                                    {activeLesson.content_type === 'prompt' ? 'Write your essay and get AI feedback' : 'Complete the reading test with questions'}
                                                </p>
                                                <Link href={`/${activeLesson.content_type === 'prompt' ? 'writing' : 'reading'}/${activeLesson.linked_entity_id}`}>
                                                    <button className={`font-semibold py-3 px-8 rounded-xl shadow-sm flex items-center mx-auto transition-all hover:shadow-md ${activeLesson.content_type === 'prompt' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                                        {activeLesson.content_type === 'prompt' ? 'Start Writing' : 'Start Reading'}
                                                        <ExternalLink className="w-4 h-4 ml-2" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </>
                                    )}

                                    {/* No content at all */}
                                    {!activeLesson.content && !activeLesson.linked_entity_id && !activeLesson.attachment_url && (
                                        <p className="text-gray-400 text-sm italic text-center">No practice content linked yet.</p>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className="p-8 overflow-y-auto grow custom-scrollbar prose max-w-none prose-blue"
                                    dangerouslySetInnerHTML={{ __html: activeLesson.content || '<i class="text-gray-400">No content yet.</i>' }}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 px-4 text-center bg-gray-50/30">
                            <FileText className="w-16 h-16 mb-4 opacity-30 text-blue-300" />
                            <h3 className="text-xl font-medium text-gray-600">No Lesson Selected</h3>
                            <p className="mt-2 max-w-sm text-sm">
                                {isTeacher
                                    ? "Select a lesson from the syllabus to preview or edit it. Click '+ Add Lesson' to create a new one."
                                    : "Select a lesson from the syllabus to get started."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <TopicDialog
                isOpen={topicDialogOpen}
                onClose={() => setTopicDialogOpen(false)}
                classroomId={id}
                topic={activeTopicForEdit}
            />

            <LessonDialog
                isOpen={lessonDialogOpen}
                onClose={() => setLessonDialogOpen(false)}
                topicId={selectedTopicIdForLesson}
                classroomId={id}
                lesson={activeLessonForEdit}
            />
        </div>
    );
}
