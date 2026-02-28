'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Send, Star } from 'lucide-react';

const CRITERIA = [
    { key: 'TR', label: 'Task Response' },
    { key: 'CC', label: 'Coherence & Cohesion' },
    { key: 'LR', label: 'Lexical Resource' },
    { key: 'GRA', label: 'Grammatical Range & Accuracy' },
];

function ScoreBar({ label, value }: { label: string; value: number }) {
    const pct = (value / 9) * 100;
    return (
        <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{value.toFixed(1)}</span>
            </div>
            <div style={{
                height: 8, borderRadius: 4,
                background: 'var(--color-bg-tertiary)',
                overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%', borderRadius: 4,
                    background: 'var(--color-primary)',
                    width: `${pct}%`,
                    transition: 'width 0.5s ease',
                }} />
            </div>
        </div>
    );
}

export default function SubmissionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: submission, isLoading, isError } = useQuery({
        queryKey: ['writing-submission', id],
        queryFn: () => apiClient.get(`/instructor/writing-submissions/${id}`).then(r => r.data),
    });

    const [overrideScore, setOverrideScore] = useState<string>('');
    const [comment, setComment] = useState('');
    const [initialized, setInitialized] = useState(false);

    // Initialize form with existing review data
    if (submission && !initialized) {
        if (submission.instructor_override_score != null) {
            setOverrideScore(String(submission.instructor_override_score));
        }
        if (submission.instructor_comment) {
            setComment(submission.instructor_comment);
        }
        setInitialized(true);
    }

    const reviewMutation = useMutation({
        mutationFn: (data: { instructor_override_score?: number; instructor_comment?: string }) =>
            apiClient.patch(`/instructor/writing-submissions/${id}/review`, data).then(r => r.data),
        onSuccess: () => {
            toast.success('Review saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['writing-submission', id] });
            queryClient.invalidateQueries({ queryKey: ['instructor-writing-subs'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to save review');
        },
    });

    const handleSubmitReview = () => {
        const data: any = {};
        if (comment.trim()) data.instructor_comment = comment.trim();
        if (overrideScore !== '') {
            const score = parseFloat(overrideScore);
            if (isNaN(score) || score < 0 || score > 9) {
                return toast.error('Score must be between 0 and 9');
            }
            data.instructor_override_score = score;
        }
        reviewMutation.mutate(data);
    };

    if (isLoading) return (
        <div className="app-loading">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
    );

    if (isError || !submission) return <div className="empty-state">Submission not found.</div>;

    const scores = submission.scores as any;
    const feedback = submission.feedback as any;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Back link */}
            <Link href="/instructor/submissions" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                color: 'var(--color-text-muted)', textDecoration: 'none',
                fontSize: '0.875rem', marginBottom: '1.5rem',
                transition: 'color 0.2s',
            }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
                <ArrowLeft size={16} />
                Back to Submissions
            </Link>

            {/* Header info */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
            }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
                        {submission.prompt?.title || 'Writing Submission'}
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <span>By: <strong>{submission.user?.display_name}</strong></span>
                        <span>Task: <strong>{submission.prompt?.task_type}</strong></span>
                        <span>Words: <strong>{submission.word_count}</strong></span>
                        <span>Date: <strong>{new Date(submission.created_at).toLocaleDateString()}</strong></span>
                    </div>
                </div>
                <span className={`badge badge-${submission.processing_status}`}>
                    {submission.processing_status}
                </span>
            </div>

            {/* Split view: Essay + Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>

                {/* LEFT: Essay content */}
                <div className="form-card" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                        Essay Content
                    </h3>
                    <div style={{
                        fontSize: '0.9rem', lineHeight: 1.75,
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'pre-wrap',
                    }}>
                        {submission.content}
                    </div>
                </div>

                {/* RIGHT: Scores + Review */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* AI Scores */}
                    {scores && (
                        <div className="form-card">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                                AI Scores
                            </h3>
                            <div style={{
                                textAlign: 'center', marginBottom: '1rem',
                                padding: '0.75rem',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Overall</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                                    {scores.overall?.toFixed(1)}
                                </div>
                            </div>
                            {CRITERIA.map(c => (
                                <ScoreBar key={c.key} label={c.label} value={scores[c.key] || 0} />
                            ))}
                        </div>
                    )}

                    {/* AI Feedback */}
                    {feedback && (
                        <div className="form-card">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                AI Feedback
                            </h3>
                            {feedback.summary && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                                    {feedback.summary}
                                </p>
                            )}
                            {feedback.strengths?.length > 0 && (
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981', marginBottom: 4 }}>Strengths</div>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        {feedback.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                            {feedback.improvements?.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>Improvements</div>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        {feedback.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Instructor Review Form */}
                    <div className="form-card" style={{ border: '2px solid var(--color-primary)', borderStyle: 'dashed' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Star size={16} />
                            Instructor Review
                        </h3>

                        {/* Override score */}
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                Override Score (0–9, optional)
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={9}
                                step={0.5}
                                placeholder="e.g. 6.5"
                                value={overrideScore}
                                onChange={e => setOverrideScore(e.target.value)}
                                style={{ maxWidth: 120 }}
                            />
                        </div>

                        {/* Comment */}
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                Comment / Feedback
                            </label>
                            <textarea
                                placeholder="Write your feedback here..."
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                style={{ minHeight: 100 }}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmitReview}
                            disabled={reviewMutation.isPending || (!comment.trim() && overrideScore === '')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1.25rem',
                                background: 'var(--color-primary)',
                                color: '#fff', border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                fontWeight: 600, fontSize: '0.875rem',
                                cursor: 'pointer',
                                opacity: (reviewMutation.isPending || (!comment.trim() && overrideScore === '')) ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                                width: '100%', justifyContent: 'center',
                            }}
                        >
                            {reviewMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Save Review
                        </button>

                        {/* Previous review info */}
                        {submission.reviewed_at && (
                            <div style={{
                                marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)',
                                textAlign: 'center',
                            }}>
                                Last reviewed by {submission.reviewer?.display_name} on {new Date(submission.reviewed_at).toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
