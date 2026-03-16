'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function PassageDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [subPage, setSubPage] = useState(1);

    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['passage', id],
        queryFn: () => apiClient.get(`/admin/passages/${id}`).then(r => r.data),
    });

    const { data: subsData } = useQuery({
        queryKey: ['passage-submissions', id, subPage],
        queryFn: () => apiClient.get(`/admin/passages/${id}/submissions?page=${subPage}&limit=10`).then(r => r.data),
        enabled: !!data,
    });

    const updateQuestionMut = useMutation({
        mutationFn: (payload: { qid: string, answer_key: string }) => apiClient.patch(`/admin/questions/${payload.qid}`, { answer_key: payload.answer_key }),
        onSuccess: () => {
            toast.success('Answer key updated');
            queryClient.invalidateQueries({ queryKey: ['passage', id] });
        },
        onError: () => toast.error('Failed to update answer key')
    });

    const handleKeyChange = (qid: string, val: string) => {
        updateQuestionMut.mutate({ qid, answer_key: val });
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this passage?')) return;
        try {
            await apiClient.delete(`/admin/passages/${id}`);
            toast.success('Passage deleted');
            router.push('/admin/passages');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
    if (error || !data) return <div className="p-8 text-center text-red-500">Failed to load passage details.</div>;

    return (
        <div className="max-w-[100rem] w-full mx-auto p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/passages" className="text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
                        <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${data.level === 'C1' || data.level === 'C2' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                Level {data.level}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${data.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {data.status}
                            </span>
                            <span className="text-gray-500">{new Date(data.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href={`/admin/passages/${id}/edit`} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                        <Edit className="w-4 h-4" />
                        Edit
                    </Link>
                    <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Passage Body */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[75vh]">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-800">
                        Reading Passage
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
                        {data.body ? (
                            <div
                                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: data.body }}
                            />
                        ) : (
                            <p className="text-gray-500 italic">No passage text provided.</p>
                        )}
                    </div>
                </div>

                {/* Right: Existing Questions List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[75vh]">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between font-semibold text-gray-800">
                        <span>Questions ({data.questions?.length || 0})</span>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                        {data.questions && data.questions.length > 0 ? (
                            <div className="space-y-4">
                                {data.questions.map((q: any) => (
                                    <div key={q.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <span className="font-bold text-gray-800 mr-2">{q.order_index}.</span>
                                                <span className="text-gray-800 text-sm font-medium" dangerouslySetInnerHTML={{ __html: q.prompt }} />
                                            </div>
                                            <span className="shrink-0 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded uppercase">
                                                {q.type.replace('_', ' ')}
                                            </span>
                                        </div>

                                        {q.options && q.options.length > 0 && (
                                            <div className="mt-3 ml-6">
                                                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600">
                                                    {q.options.map((opt: string, i: number) => (
                                                        <li key={i}>{opt}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="mt-3 ml-6 flex items-center gap-2">
                                            <div className="flex items-center gap-2 bg-emerald-50 px-2 py-1 rounded">
                                                <span className="text-xs font-semibold text-emerald-600">Key:</span>
                                                <input
                                                    type="text"
                                                    defaultValue={Array.isArray(q.answer_key) ? q.answer_key.join(', ') : (q.answer_key || '')}
                                                    onBlur={(e) => {
                                                        const currentVal = Array.isArray(q.answer_key) ? q.answer_key.join(', ') : (q.answer_key || '');
                                                        if (e.target.value !== currentVal) {
                                                            handleKeyChange(q.id, e.target.value);
                                                        }
                                                    }}
                                                    className="w-24 px-1 text-xs font-bold border border-emerald-200 bg-white text-emerald-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded placeholder:font-normal placeholder:text-emerald-300"
                                                    placeholder="Type key..."
                                                />
                                            </div>
                                            {q.explanation && (
                                                <span className="text-xs text-gray-500 truncate max-w-[200px]" title={q.explanation}>
                                                    💡 {q.explanation}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <p>No questions attached to this passage yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submissions section */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                                        <th className="px-4 py-3 text-left">Score</th>
                                        <th className="px-4 py-3 text-left">Correct</th>
                                        <th className="px-4 py-3 text-left">Duration</th>
                                        <th className="px-4 py-3 text-left">Mode</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {subsData.data.map((s: any) => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{s.user?.display_name || s.user?.email || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`font-bold ${s.score_pct >= 70 ? 'text-emerald-600' : s.score_pct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {s.score_pct.toFixed(0)}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{s.correct_count}/{s.total_questions}</td>
                                            <td className="px-4 py-3 text-gray-600">{s.duration_sec ? `${Math.floor(s.duration_sec / 60)}m ${s.duration_sec % 60}s` : '—'}</td>
                                            <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{s.test_mode}</span></td>
                                            <td className="px-4 py-3 text-gray-500">{new Date(s.completed_at).toLocaleDateString()}</td>
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
