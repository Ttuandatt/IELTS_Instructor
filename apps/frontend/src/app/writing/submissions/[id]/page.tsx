'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import apiClient from '@/lib/api-client';
import FeedbackPanel from '@/components/FeedbackPanel';

type Status = 'pending' | 'done' | 'failed';

interface Submission {
    id: string;
    processing_status: Status;
    word_count: number;
    content: string;
    scores?: {
        TR: number;
        CC: number;
        LR: number;
        GRA: number;
        overall: number;
    };
    feedback?: {
        summary: string;
        strengths: string[];
        improvements: string[];
        suggestions: string;
    };
    error_message?: string;
    model_name?: string;
    turnaround_ms?: number;
    prompt?: {
        title: string;
        task_type: string;
        level: string;
    };
    created_at: string;
}

export default function WritingSubmissionPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useI18n();
    const router = useRouter();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pollCount, setPollCount] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        const fetchSubmission = async () => {
            try {
                const res = await apiClient.get(`/writing/submissions/${id}`);
                const data: Submission = res.data;
                setSubmission(data);

                if (data.processing_status === 'done' || data.processing_status === 'failed') {
                    clearInterval(interval);
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Failed to load submission');
                clearInterval(interval);
            }
            setPollCount(c => c + 1);
        };

        fetchSubmission();
        interval = setInterval(fetchSubmission, 3000);

        return () => clearInterval(interval);
    }, [id]);

    if (error) {
        return (
            <div className="result-card" style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
                <p className="error-text">❌ {error}</p>
                <button className="btn btn-secondary" onClick={() => router.back()}>
                    {t.common.back}
                </button>
            </div>
        );
    }

    if (!submission || submission.processing_status === 'pending') {
        return (
            <div className="submission-pending">
                <div className="scoring-spinner">
                    <div className="spinner" />
                </div>
                <h2>✍️ Scoring your essay...</h2>
                <p>Our AI is evaluating your writing. This usually takes 15–60 seconds.</p>
                <p className="poll-counter">Checking... ({pollCount})</p>
            </div>
        );
    }

    if (submission.processing_status === 'failed') {
        return (
            <div className="result-card" style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
                <h2>❌ Scoring Failed</h2>
                <p>{submission.error_message || 'An error occurred during scoring.'}</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => router.push('/writing')}>
                        {t.common.back}
                    </button>
                </div>
            </div>
        );
    }

    // Done
    if (!submission.scores || !submission.feedback) {
        return <p>{t.common.error}</p>;
    }

    return (
        <div className="submission-detail">
            <div className="submission-detail-header">
                <button className="btn btn-secondary" onClick={() => router.push('/writing')}>
                    {t.common.back}
                </button>
                <div style={{ flex: 1 }}>
                    <h1 className="page-title">{submission.prompt?.title || 'Writing Feedback'}</h1>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {submission.prompt?.level && (
                            <span className={`badge badge-${submission.prompt.level}`}>{submission.prompt.level}</span>
                        )}
                        {submission.prompt?.task_type && (
                            <span className="badge">{submission.prompt.task_type}</span>
                        )}
                        <span className="badge">{submission.word_count} words</span>
                        {submission.model_name && (
                            <span className="badge" style={{ opacity: 0.6 }}>🤖 {submission.model_name}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="submission-detail-body">
                {/* Left: Feedback */}
                <div className="submission-feedback-col">
                    <FeedbackPanel scores={submission.scores} feedback={submission.feedback} />
                </div>

                {/* Right: Essay */}
                <div className="submission-essay-col">
                    <h3 className="essay-heading">Your Essay</h3>
                    <div className="essay-content">{submission.content}</div>
                </div>
            </div>
        </div>
    );
}
