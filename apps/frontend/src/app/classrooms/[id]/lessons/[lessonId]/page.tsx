"use client";

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Loader2, ArrowLeft, Paperclip, BookOpen, PenTool, Send, Sparkles, Clock, User, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/providers/AuthProvider';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
function fixContentUrls(html: string): string {
    return html.replace(/src="\/uploads\//g, `src="${BACKEND_URL}/uploads/`);
}
function fixUrl(url: string): string {
    if (url.startsWith('/uploads/')) return `${BACKEND_URL}${url}`;
    return url;
}

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif)$/i.test(url);

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function LessonDetailPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
    const { id: classroomId, lessonId } = use(params);
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [essay, setEssay] = useState('');
    const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

    const { data: lesson, isLoading, error } = useQuery({
        queryKey: ['lesson', lessonId],
        queryFn: () => apiClient.get(`/lessons/${lessonId}`).then(r => r.data),
    });

    // Student: fetch own submissions
    const { data: mySubmissions } = useQuery({
        queryKey: ['my-submissions', lessonId],
        queryFn: () => apiClient.get(`/lessons/${lessonId}/my-submissions`).then(r => r.data),
        enabled: !!lesson && lesson.content_type === 'prompt',
    });

    // Teacher/Admin: fetch all submissions
    const isTeacherOrAdmin = user?.role === 'instructor' || user?.role === 'admin';
    const { data: allSubmissions } = useQuery({
        queryKey: ['all-submissions', lessonId],
        queryFn: () => apiClient.get(`/lessons/${lessonId}/submissions`).then(r => r.data),
        enabled: !!lesson && lesson.content_type === 'prompt' && isTeacherOrAdmin,
    });

    const { mutate: submitEssay, isPending: isSubmitting } = useMutation({
        mutationFn: () => apiClient.post(`/lessons/${lessonId}/submissions`, { content: essay }).then(r => r.data),
        onSuccess: () => {
            toast.success('Essay submitted successfully!');
            setEssay('');
            queryClient.invalidateQueries({ queryKey: ['my-submissions', lessonId] });
            queryClient.invalidateQueries({ queryKey: ['all-submissions', lessonId] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to submit essay.');
        },
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
    const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
    const hasImageAttachment = lesson.attachment_url && isImageUrl(lesson.attachment_url);
    // Check if content already contains an <img> tag (to avoid duplicate image rendering)
    const contentHasImage = lesson.content && /<img\s/i.test(lesson.content);
    // Show standalone image only if content doesn't already embed it
    const showStandaloneImage = hasImageAttachment && !contentHasImage;

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
                        {lesson.attachment_url && !hasImageAttachment && (
                            <a
                                href={fixUrl(lesson.attachment_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                            >
                                <Paperclip className="w-3.5 h-3.5" />
                                Original file
                            </a>
                        )}
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${isWriting ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {isWriting ? 'Writing' : 'Reading'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Content Area */}
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

                    <hr className="border-gray-200 mb-8" />

                    {/* ALWAYS show image from attachment_url if content doesn't already embed it */}
                    {showStandaloneImage && (
                        <div className="mb-8 flex justify-center">
                            <img
                                src={fixUrl(lesson.attachment_url)}
                                alt="Lesson attachment"
                                className="max-w-full rounded-lg"
                                style={{
                                    maxHeight: '65vh',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                            />
                        </div>
                    )}

                    {/* Content / Instruction text */}
                    {lesson.content && (
                        <article className="prose prose-lg prose-blue max-w-none
                            prose-headings:text-gray-900 prose-headings:font-bold
                            prose-p:text-gray-700 prose-p:leading-relaxed
                            prose-strong:text-gray-900
                            prose-em:text-gray-600
                            prose-li:text-gray-700
                            mb-8
                        ">
                            <div dangerouslySetInnerHTML={{ __html: fixContentUrls(lesson.content) }} />
                        </article>
                    )}

                    {/* Empty state — no content AND no image */}
                    {!lesson.content && !hasImageAttachment && (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-sm italic">No content available for this lesson.</p>
                        </div>
                    )}

                    {/* Writing area for learners */}
                    {isWriting && (
                        <>
                            <hr className="border-gray-200 mb-8" />
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                {/* Writing header */}
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <PenTool className="w-5 h-5 text-emerald-500" />
                                        Your Essay
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Write at least 150 words.</p>
                                </div>

                                {/* Textarea */}
                                <div className="p-6">
                                    <textarea
                                        value={essay}
                                        onChange={e => setEssay(e.target.value)}
                                        placeholder="Start writing your essay here..."
                                        rows={12}
                                        className="w-full p-4 border border-gray-200 rounded-xl resize-y text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                        style={{ minHeight: '200px', fontSize: '0.95rem' }}
                                    />

                                    {/* Word count + buttons */}
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-medium ${wordCount >= 150 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {wordCount} {wordCount === 1 ? 'word' : 'words'}
                                            </span>
                                            {wordCount > 0 && wordCount < 150 && (
                                                <span className="text-xs text-amber-500">
                                                    ({150 - wordCount} more needed)
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {lesson.allow_checkscore && (
                                                <button
                                                    disabled
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                                    title="AI auto-scoring coming soon"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    Check Score
                                                </button>
                                            )}

                                            {lesson.allow_submit && (
                                                <button
                                                    onClick={() => submitEssay()}
                                                    disabled={wordCount < 10 || isSubmitting}
                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${wordCount >= 10
                                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                        }`}
                                                >
                                                    {isSubmitting ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Send className="w-4 h-4" />
                                                    )}
                                                    Submit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Student: My Past Submissions ─── */}
                            {mySubmissions && mySubmissions.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        Your Submissions
                                        <span className="text-sm font-normal text-gray-400">({mySubmissions.length})</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {mySubmissions.map((sub: any) => (
                                            <div key={sub.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:shadow-sm">
                                                <button
                                                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                                                    onClick={() => setExpandedSubmission(expandedSubmission === sub.id ? null : sub.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {sub.status === 'graded' ? '✓ Graded' : '⏳ Submitted'}
                                                        </div>
                                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {timeAgo(sub.created_at)}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{sub.word_count} words</span>
                                                        {sub.score != null && (
                                                            <span className="text-sm font-bold text-emerald-600">Score: {sub.score}</span>
                                                        )}
                                                    </div>
                                                    {expandedSubmission === sub.id ? (
                                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>
                                                {expandedSubmission === sub.id && (
                                                    <div className="px-5 pb-5 border-t border-gray-100">
                                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                            {sub.content}
                                                        </div>
                                                        {sub.feedback && (
                                                            <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                                                                <p className="text-xs font-semibold text-blue-600 mb-1">Teacher Feedback</p>
                                                                <p className="text-sm text-blue-800">{sub.feedback}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Teacher: All Student Submissions ─── */}
                            {isTeacherOrAdmin && allSubmissions && allSubmissions.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-indigo-500" />
                                        Student Submissions
                                        <span className="text-sm font-normal text-gray-400">({allSubmissions.length})</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {allSubmissions.map((sub: any) => (
                                            <div key={sub.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:shadow-sm">
                                                <button
                                                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                                                    onClick={() => setExpandedSubmission(expandedSubmission === sub.id ? null : sub.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                            {sub.user?.display_name?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">{sub.user?.display_name || 'Unknown'}</p>
                                                            <p className="text-xs text-gray-400">{sub.user?.email}</p>
                                                        </div>
                                                        <div className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {sub.status === 'graded' ? '✓ Graded' : '⏳ Pending'}
                                                        </div>
                                                        <span className="text-xs text-gray-400">{sub.word_count} words</span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {timeAgo(sub.created_at)}
                                                        </span>
                                                    </div>
                                                    {expandedSubmission === sub.id ? (
                                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>
                                                {expandedSubmission === sub.id && (
                                                    <div className="px-5 pb-5 border-t border-gray-100">
                                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                            {sub.content}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Teacher: empty state */}
                            {isTeacherOrAdmin && allSubmissions && allSubmissions.length === 0 && (
                                <div className="mt-8 text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-200">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No student submissions yet.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
