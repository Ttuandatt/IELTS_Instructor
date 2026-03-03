"use client";

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Loader2, ArrowLeft, Paperclip, BookOpen, PenTool } from 'lucide-react';
import Link from 'next/link';

export default function LessonDetailPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
    const { id: classroomId, lessonId } = use(params);

    const { data: lesson, isLoading, error } = useQuery({
        queryKey: ['lesson', lessonId],
        queryFn: () => apiClient.get(`/lessons/${lessonId}`).then(r => r.data),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <p className="text-gray-500">Lesson not found</p>
                <Link href={`/classrooms/${classroomId}`}>
                    <button className="text-blue-600 hover:underline flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Back to classroom
                    </button>
                </Link>
            </div>
        );
    }

    const isWriting = lesson.content_type === 'prompt';
    const isReading = lesson.content_type === 'passage';
    const themeColor = isWriting ? 'emerald' : 'blue';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
                    <div className="flex items-center gap-3">
                        <Link href={`/classrooms/${classroomId}`}>
                            <button className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        </Link>
                        <div className="flex items-center gap-2">
                            {isWriting ? (
                                <PenTool className="w-5 h-5 text-emerald-500" />
                            ) : isReading ? (
                                <BookOpen className="w-5 h-5 text-blue-500" />
                            ) : null}
                            <h1 className="font-semibold text-gray-800 text-sm sm:text-base truncate max-w-md">
                                {lesson.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {lesson.attachment_url && (
                            <a
                                href={lesson.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                            >
                                <Paperclip className="w-3.5 h-3.5" />
                                Original file
                            </a>
                        )}
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${lesson.content_type === 'prompt' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {lesson.content_type === 'prompt' ? 'Writing' : 'Reading'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Content Area — centered reading layout */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
                    {/* Lesson Title */}
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                            {lesson.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isWriting ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {isWriting ? <PenTool className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                                {isWriting ? 'Writing Test' : 'Reading Test'}
                            </span>
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${lesson.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {lesson.status}
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200 mb-8" />

                    {/* Full Content */}
                    {lesson.content && (
                        <article className="prose prose-lg prose-blue max-w-none
                            prose-headings:text-gray-900 prose-headings:font-bold
                            prose-p:text-gray-700 prose-p:leading-relaxed
                            prose-strong:text-gray-900
                            prose-em:text-gray-600
                            prose-li:text-gray-700
                        ">
                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                        </article>
                    )}

                    {/* Empty state */}
                    {!lesson.content && (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-sm italic">No content available for this lesson.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
