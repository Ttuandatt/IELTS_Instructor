'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function EditPassagePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = use(params);

    const { data, isLoading, error } = useQuery({
        queryKey: ['passage', id],
        queryFn: () => apiClient.get(`/admin/passages/${id}`).then(r => r.data),
    });

    const [form, setForm] = useState({
        title: '',
        passage: '',
        level: 'B1',
        status: 'draft',
        topic_tags: ''
    });

    useEffect(() => {
        if (data) {
            setForm({
                title: data.title || '',
                passage: data.body || '',
                level: data.level || 'B1',
                status: data.status || 'draft',
                topic_tags: data.topic_tags?.join(', ') || '',
            });
        }
    }, [data]);

    const updateMut = useMutation({
        mutationFn: (payload: any) => apiClient.patch(`/admin/passages/${id}`, payload),
        onSuccess: () => {
            toast.success('Passage updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-passages'] });
            queryClient.invalidateQueries({ queryKey: ['passage', id] });
            router.push('/admin/passages');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update passage');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMut.mutate({
            ...form,
            topic_tags: form.topic_tags.split(',').map(s => s.trim()).filter(Boolean),
        });
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load passage details</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/passages" className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Passage</h1>
                    <p className="text-gray-500 text-sm">Update the reading passage content and metadata</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passage Title</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passage Content (HTML)</label>
                        <textarea
                            rows={15}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                            value={form.passage}
                            onChange={e => setForm(f => ({ ...f, passage: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={form.level}
                                onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                            >
                                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={form.status}
                                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic Tags (comma separated)</label>
                        <input
                            type="text"
                            placeholder="science, history, nature"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.topic_tags}
                            onChange={e => setForm(f => ({ ...f, topic_tags: e.target.value }))}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={updateMut.isPending}
                        >
                            {updateMut.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
