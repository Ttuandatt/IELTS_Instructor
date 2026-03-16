'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

export default function PromptDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [subPage, setSubPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['prompt', id],
        queryFn: () => apiClient.get(`/instructor/prompts/${id}`).then(r => r.data),
    });

    const { data: subsData } = useQuery({
        queryKey: ['prompt-submissions', id, subPage],
        queryFn: () => apiClient.get(`/instructor/prompts/${id}/submissions?page=${subPage}&limit=10`).then(r => r.data),
        enabled: !!data,
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
    if (error || !data) return <div className="p-8 text-center text-red-500">Failed to load prompt details.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/instructor/prompts" className="text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
                        <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className="px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">{data.task_type}</span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${data.level === 'C1' || data.level === 'C2' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                Level {data.level}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${data.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {data.status}
                            </span>
                            <span className="text-gray-500">Min {data.min_words} words</span>
                        </div>
                    </div>
                </div>
                <Link href={`/instructor/prompts/${id}/edit`} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                    <Edit className="w-4 h-4" /> Edit
                </Link>
            </div>

            {/* Prompt text */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-800">
                    Prompt Text
                </div>
                <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {data.prompt_text}
                </div>
            </div>

            {/* Submissions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-800">
                    Submissions ({subsData?.total || 0})
                </div>
                {subsData?.data?.length ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Learner</th>
                                        <th className="px-4 py-3 text-left">Overall</th>
                                        <th className="px-4 py-3 text-left">TR</th>
                                        <th className="px-4 py-3 text-left">CC</th>
                                        <th className="px-4 py-3 text-left">LR</th>
                                        <th className="px-4 py-3 text-left">GRA</th>
                                        <th className="px-4 py-3 text-left">Words</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {subsData.data.map((s: any) => (
                                        <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/writing/submissions/${s.id}`)}>
                                            <td className="px-4 py-3 font-medium text-gray-800">{s.user?.display_name || s.user?.email || '—'}</td>
                                            <td className="px-4 py-3">
                                                {s.scores?.overall != null ? (
                                                    <span className="font-bold text-indigo-600">{s.scores.overall}</span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{s.scores?.TR ?? '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{s.scores?.CC ?? '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{s.scores?.LR ?? '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{s.scores?.GRA ?? '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{s.word_count}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                                    s.processing_status === 'done' ? 'bg-emerald-50 text-emerald-600' :
                                                    s.processing_status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-red-50 text-red-600'
                                                }`}>{s.processing_status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {subsData.total > 10 && (
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                                <button disabled={subPage <= 1} onClick={() => setSubPage(p => p - 1)} className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40">Previous</button>
                                <span className="text-gray-500">Page {subPage} / {Math.ceil(subsData.total / 10)}</span>
                                <button disabled={subPage * 10 >= subsData.total} onClick={() => setSubPage(p => p + 1)} className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="px-6 py-8 text-center text-gray-400 text-sm">No submissions yet.</div>
                )}
            </div>
        </div>
    );
}
