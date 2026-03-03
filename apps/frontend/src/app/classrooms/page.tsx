"use client";

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Users, BookOpen, Plus, Loader2, UserPlus, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { JoinClassroomDialog } from '@/components/classroom/JoinClassroomDialog';

export default function ClassroomsPage() {
    const [page, setPage] = useState(1);
    const [menuOpen, setMenuOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

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

                {/* "+" dropdown — Google Classroom style */}
                <div ref={menuRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setMenuOpen(prev => !prev)}
                        aria-label="Add"
                        style={{
                            width: 44, height: 44,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--color-primary)',
                            color: '#fff', border: 'none',
                            borderRadius: 'var(--radius-full)',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-md)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.08)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                    >
                        <Plus size={22} strokeWidth={2.5} />
                    </button>

                    {menuOpen && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-lg)',
                            minWidth: 200, zIndex: 50,
                            overflow: 'hidden',
                            animation: 'fadeIn 0.15s ease',
                        }}>
                            <button
                                onClick={() => { setMenuOpen(false); setJoinOpen(true); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    width: '100%', padding: '0.75rem 1rem',
                                    background: 'transparent', border: 'none',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.875rem', fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <UserPlus size={18} style={{ color: 'var(--color-primary)' }} />
                                Join Classroom
                            </button>
                            <div style={{ height: 1, background: 'var(--color-border)' }} />
                            <Link href="/classrooms/new" style={{ textDecoration: 'none' }}>
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        width: '100%', padding: '0.75rem 1rem',
                                        background: 'transparent', border: 'none',
                                        color: 'var(--color-text-primary)',
                                        fontSize: '0.875rem', fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                        textAlign: 'left',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <GraduationCap size={18} style={{ color: 'var(--color-primary)' }} />
                                    Create Classroom
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
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
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setJoinOpen(true)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1.25rem',
                                background: 'var(--color-primary)',
                                color: '#fff', border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                fontWeight: 600, fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}>
                            <UserPlus size={16} /> Join a classroom
                        </button>
                        <Link href="/classrooms/new" style={{ textDecoration: 'none' }}>
                            <button style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1.25rem',
                                background: 'transparent',
                                color: 'var(--color-primary)',
                                border: '2px solid var(--color-primary)',
                                borderRadius: 'var(--radius-lg)',
                                fontWeight: 600, fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}>
                                <Plus size={16} /> Create a classroom
                            </button>
                        </Link>
                    </div>
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

            {/* Join Dialog */}
            <JoinClassroomDialog isOpen={joinOpen} onClose={() => setJoinOpen(false)} />
        </div>
    );
}
