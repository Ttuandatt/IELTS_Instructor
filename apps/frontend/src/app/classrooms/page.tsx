"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Users, BookOpen, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ClassroomsPage() {
    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['classrooms', page],
        queryFn: () => apiClient.get(`/classrooms?page=${page}&limit=12`).then(r => r.data),
    });

    if (isLoading) return (
        <div className="app-loading">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
    );

    if (isError) return <div className="empty-state">Failed to load classrooms.</div>;

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '2rem',
            }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>My Classrooms</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                        Manage and view all your active classes.
                    </p>
                </div>
                <Link href="/classrooms/new" style={{ textDecoration: 'none' }}>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.25rem',
                        background: 'var(--color-primary)',
                        color: '#fff', border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 600, fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    >
                        <Plus size={18} />
                        Create Classroom
                    </button>
                </Link>
            </div>

            {data?.data?.length === 0 ? (
                <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                    <BookOpen size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 0.5rem' }}>
                        No classrooms found
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                        You haven&apos;t joined or created any classes yet.
                    </p>
                    <Link href="/classrooms/new" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.25rem',
                            background: 'var(--color-primary)',
                            color: '#fff', border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            fontWeight: 600, fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}>
                            <Plus size={16} /> Create a classroom
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="card-grid">
                    {data.data.map((classroom: any) => (
                        <Link key={classroom.id} href={`/classrooms/${classroom.id}`} style={{ textDecoration: 'none' }}>
                            <div className="content-card" style={{ padding: 0, height: '100%' }}>
                                {/* Cover image */}
                                {classroom.cover_image_url ? (
                                    <div style={{ height: 140, overflow: 'hidden', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }}>
                                        <img
                                            src={classroom.cover_image_url}
                                            alt={classroom.name}
                                            style={{
                                                width: '100%', height: '100%', objectFit: 'cover',
                                                transition: 'transform 0.5s ease',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        height: 140,
                                        background: 'linear-gradient(135deg, var(--color-primary-light) 0%, #f3e8ff 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                                    }}>
                                        <BookOpen size={48} style={{ color: 'var(--color-primary)', opacity: 0.4 }} />
                                    </div>
                                )}

                                {/* Content */}
                                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                    {/* Role badge */}
                                    <span style={{
                                        position: 'absolute', top: -14, right: 16,
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        padding: '0.2rem 0.75rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.7rem', fontWeight: 700,
                                        textTransform: 'uppercase',
                                        color: 'var(--color-primary)',
                                        boxShadow: 'var(--shadow-sm)',
                                        letterSpacing: '0.03em',
                                    }}>
                                        {classroom.role}
                                    </span>

                                    <h3 style={{
                                        fontSize: '1.1rem', fontWeight: 700,
                                        color: 'var(--color-text-primary)',
                                        margin: '0 0 0.5rem',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {classroom.name}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.85rem', color: 'var(--color-text-muted)',
                                        margin: '0 0 1rem',
                                        display: '-webkit-box', WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
                                        minHeight: '2.5em',
                                    }}>
                                        {classroom.description || "No description provided."}
                                    </p>

                                    {/* Members */}
                                    <div style={{
                                        marginTop: 'auto',
                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                        fontSize: '0.8rem', color: 'var(--color-text-muted)',
                                        background: 'var(--color-bg-tertiary)',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        width: 'fit-content',
                                    }}>
                                        <Users size={14} style={{ color: 'var(--color-primary)' }} />
                                        <span>{classroom.members_count} / {classroom.max_members} members</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {data?.meta?.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem', gap: '0.5rem' }}>
                    <button
                        className="btn btn-secondary"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        style={{ cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Previous
                    </button>
                    <button
                        className="btn btn-secondary"
                        disabled={page >= data.meta.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        style={{ cursor: page >= data.meta.totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
