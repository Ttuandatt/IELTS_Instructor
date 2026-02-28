"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CreateClassroomPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cover_image_url: '',
        max_members: 50,
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: typeof formData) => apiClient.post('/classrooms', data).then(r => r.data),
        onSuccess: (data) => {
            toast.success('Classroom created successfully!');
            queryClient.invalidateQueries({ queryKey: ['classrooms'] });
            router.push(`/classrooms/${data.id}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create classroom');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error('Name is required');
        mutate(formData);
    };

    return (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <Link href="/classrooms" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                color: 'var(--color-text-muted)', textDecoration: 'none',
                fontSize: '0.875rem', marginBottom: '1.5rem',
                transition: 'color 0.2s',
            }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
                <ArrowLeft size={16} />
                Back to Classrooms
            </Link>

            <div className="form-card">
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                        Create New Classroom
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
                        Set up a new learning environment for your students.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Classroom Name *</label>
                        <input
                            id="name"
                            placeholder="e.g. IELTS Foundation K42"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            placeholder="What is this class about?"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            maxLength={1000}
                            style={{ minHeight: 100 }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cover_image_url">Cover Image URL (Optional)</label>
                        <input
                            id="cover_image_url"
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={formData.cover_image_url}
                            onChange={e => setFormData({ ...formData, cover_image_url: e.target.value })}
                        />
                        {formData.cover_image_url && (
                            <div style={{
                                marginTop: '0.5rem', height: 128, borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden', border: '1px solid var(--color-border)',
                            }}>
                                <img
                                    src={formData.cover_image_url} alt="Cover preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e: any) => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="max_members">Max Members</label>
                        <input
                            id="max_members"
                            type="number"
                            min={2}
                            max={200}
                            value={formData.max_members}
                            onChange={e => setFormData({ ...formData, max_members: parseInt(e.target.value) || 50 })}
                            required
                            style={{ maxWidth: 200 }}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => router.back()} disabled={isPending}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !formData.name}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1.25rem',
                                background: 'var(--color-primary)',
                                color: '#fff', border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                fontWeight: 600, fontSize: '0.875rem',
                                cursor: isPending ? 'not-allowed' : 'pointer',
                                opacity: (isPending || !formData.name) ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {isPending && <Loader2 size={16} className="animate-spin" />}
                            Create Classroom
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
