"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function EditClassroomPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = use(params);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cover_image_url: '',
        max_members: 50,
        status: 'active'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get(`/classrooms/${id}`).then(res => {
            const data = res.data;
            setFormData({
                name: data.name,
                description: data.description || '',
                cover_image_url: data.cover_image_url || '',
                max_members: data.max_members,
                status: data.status,
            });
            setIsLoading(false);
        }).catch(err => {
            toast.error('Failed to load classroom details');
            router.push('/classrooms');
        });
    }, [id, router]);

    const { mutate: updateClass, isPending } = useMutation({
        mutationFn: (data: typeof formData) => apiClient.patch(`/classrooms/${id}`, data).then(r => r.data),
        onSuccess: () => {
            toast.success('Classroom updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['classroom', id] });
            queryClient.invalidateQueries({ queryKey: ['classrooms'] });
            router.push(`/classrooms/${id}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update classroom');
        }
    });

    const { mutate: deleteClass, isPending: isDeleting } = useMutation({
        mutationFn: () => apiClient.delete(`/classrooms/${id}`),
        onSuccess: () => {
            toast.success('Classroom archived successfully!');
            queryClient.invalidateQueries({ queryKey: ['classrooms'] });
            router.push('/classrooms');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error('Name is required');
        updateClass(formData);
    };

    if (isLoading) return <div className="flex pt-20 justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Link href={`/classrooms/${id}`} className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Classroom
            </Link>

            <div className="border shadow-md rounded-xl bg-white overflow-hidden">
                <div className="p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">Edit Classroom</h2>
                        <p className="text-gray-500 text-sm mt-1">Update classroom details and settings.</p>
                    </div>
                    <button
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors"
                        onClick={() => {
                            if (confirm('Are you sure you want to archive this classroom? It will be hidden from students.')) {
                                deleteClass();
                            }
                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Archive Class
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Classroom Name *</label>
                            <input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                maxLength={100}
                                className="w-full border rounded-md px-3 py-2 bg-gray-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                maxLength={1000}
                                className="w-full border rounded-md px-3 py-2 min-h-[100px] bg-gray-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="cover_image_url" className="text-sm font-medium">Cover Image URL (Optional)</label>
                            <input
                                id="cover_image_url"
                                type="url"
                                value={formData.cover_image_url}
                                onChange={e => setFormData({ ...formData, cover_image_url: e.target.value })}
                                className="w-full border rounded-md px-3 py-2 bg-gray-50"
                            />
                            {formData.cover_image_url && (
                                <div className="mt-2 h-32 w-full rounded-md overflow-hidden border">
                                    <img src={formData.cover_image_url} alt="Cover preview" className="w-full h-full object-cover" onError={(e: any) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="max_members" className="text-sm font-medium">Max Members</label>
                                <input
                                    id="max_members"
                                    type="number"
                                    min={2}
                                    max={200}
                                    value={formData.max_members}
                                    onChange={e => setFormData({ ...formData, max_members: parseInt(e.target.value) || 50 })}
                                    required
                                    className="w-full border rounded-md px-3 py-2 bg-gray-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 bg-gray-50"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t flex justify-end gap-3">
                            <button
                                type="button"
                                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                                onClick={() => router.back()}
                                disabled={isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors disabled:opacity-50"
                                disabled={isPending || !formData.name}
                            >
                                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
