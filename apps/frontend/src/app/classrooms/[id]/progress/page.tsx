"use client";

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Loader2, ArrowLeft, BookOpen, PenTool, User, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ClassroomProgressPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { data: classroom } = useQuery({
        queryKey: ['classroom', id],
        queryFn: () => apiClient.get(`/classrooms/${id}`).then(r => r.data),
    });

    const { data: progress, isLoading } = useQuery({
        queryKey: ['classroom-progress', id],
        queryFn: () => apiClient.get(`/classrooms/${id}/progress`).then(r => r.data),
    });

    if (isLoading) return <div className="flex pt-20 justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Link href={`/classrooms/${id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Classroom
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>
                <p className="text-gray-500 mt-1">{classroom?.name} — {progress?.length ?? 0} students</p>
            </div>

            {!progress || progress.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No students enrolled yet.</p>
                    <Link href={`/classrooms/${id}/members`} className="text-blue-500 hover:underline text-sm mt-2 inline-block">
                        Add students via Members page →
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {progress.map((student: any) => (
                        <div key={student.user_id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                {/* Student Info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                                        {(student.display_name || student.email)[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{student.display_name}</p>
                                        <p className="text-xs text-gray-400">{student.email}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-6">
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                                            <BookOpen className="w-4 h-4" />
                                            {student.reading_count} tests
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            Avg: {student.reading_avg !== null ? `${student.reading_avg}%` : '—'}
                                        </div>
                                    </div>
                                    <div className="h-10 w-px bg-gray-200" />
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 text-purple-600 text-sm font-medium">
                                            <PenTool className="w-4 h-4" />
                                            {student.writing_count} essays
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            Avg: {student.writing_avg !== null ? `${student.writing_avg}/9` : '—'}
                                        </div>
                                    </div>
                                    <div className="h-10 w-px bg-gray-200" />
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 text-gray-600 text-sm font-medium">
                                            <TrendingUp className="w-4 h-4" />
                                            {student.reading_count + student.writing_count} total
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">submissions</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent activity */}
                            {(student.recent_reading.length > 0 || student.recent_writing.length > 0) && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Recent Activity
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        {student.recent_reading.map((r: any) => (
                                            <span key={r.id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                                                📖 {r.score_pct}%
                                            </span>
                                        ))}
                                        {student.recent_writing.map((w: any) => (
                                            <span key={w.id} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs">
                                                ✍️ {(w.scores as any)?.overall ?? '?'}/9
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
