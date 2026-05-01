'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import apiClient from '@/lib/api-client';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Sparkles, Check, ArrowRight } from 'lucide-react';
import RadarChart from '@/components/dashboard/charts/RadarChart';

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
    id?: string;
    title: string;
    task_type: string;
    level: string;
  };
  created_at: string;
}

const CRITERIA: Array<{ k: 'TR' | 'CC' | 'LR' | 'GRA'; label: string }> = [
  { k: 'TR', label: 'Task Response' },
  { k: 'CC', label: 'Coherence & Cohesion' },
  { k: 'LR', label: 'Lexical Resource' },
  { k: 'GRA', label: 'Grammatical Range' },
];

function bandTone(b: number): string {
  if (b >= 7) return 'var(--success)';
  if (b >= 6) return 'var(--primary)';
  if (b >= 5) return 'var(--warn)';
  return 'var(--danger)';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
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
    let active = true;

    const fetchSubmission = async () => {
      try {
        const res = await apiClient.get(`/writing/submissions/${id}`);
        if (!active) return;
        const data: Submission = res.data;
        setSubmission(data);
        if (data.processing_status === 'done' || data.processing_status === 'failed') {
          clearInterval(interval);
        }
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.message || 'Failed to load submission');
        clearInterval(interval);
      }
      if (active) setPollCount(c => c + 1);
    };

    fetchSubmission();
    interval = setInterval(fetchSubmission, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id]);

  if (error) {
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '2rem auto' }}>
        <div className="card card-pad" style={{ textAlign: 'center', padding: 32 }}>
          <AlertCircle size={28} style={{ color: 'var(--danger)', marginBottom: 12 }} />
          <p style={{ marginBottom: 16, color: 'var(--ink-2)' }}>{error}</p>
          <button className="btn" onClick={() => router.back()}>
            <ArrowLeft size={13} /> {t.common.back}
          </button>
        </div>
      </div>
    );
  }

  if (!submission || submission.processing_status === 'pending') {
    return (
      <div className="fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <Link
            href="/writing/history"
            style={{ fontSize: 12, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={12} /> {t.common.back} to history
          </Link>
        </div>
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
          <h2 className="page-title" style={{ fontSize: 22, marginBottom: 6 }}>
            <Sparkles size={16} style={{ color: 'var(--primary)', verticalAlign: 'middle', marginRight: 6 }} />
            {t.writing.scoring}
          </h2>
          <p className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
            — Our AI is evaluating your writing. This usually takes 15–60 seconds.
          </p>
          <p className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 12 }}>
            Checking… ({pollCount})
          </p>
        </div>

        {submission?.content && (
          <div className="card card-pad" style={{ marginTop: 16 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>— Your essay</div>
            <div
              style={{
                padding: 16, background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 6, fontFamily: 'var(--ff-display)', fontSize: 13.5,
                lineHeight: 1.7, color: 'var(--ink-2)', whiteSpace: 'pre-wrap',
                maxHeight: 320, overflow: 'auto',
              }}
            >
              {submission.content}
            </div>
            <div className="row" style={{ gap: 12, marginTop: 8, fontSize: 11, color: 'var(--ink-3)' }}>
              <span><span className="mono">{submission.word_count}</span> words</span>
              <span><span className="mono">{submission.content.length}</span> characters</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (submission.processing_status === 'failed') {
    const promptId = submission.prompt?.id;
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '2rem auto' }}>
        <div className="card card-pad" style={{ textAlign: 'center', padding: 32 }}>
          <AlertCircle size={28} style={{ color: 'var(--danger)', marginBottom: 12 }} />
          <h2 className="page-title" style={{ fontSize: 22, marginBottom: 6 }}>Scoring failed</h2>
          <p style={{ color: 'var(--ink-2)', marginBottom: 16 }}>
            {submission.error_message || 'An error occurred during scoring.'}
          </p>
          <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
            <Link href="/writing" className="btn">
              <ArrowLeft size={13} /> Back to prompts
            </Link>
            {promptId && (
              <Link href={`/writing/${promptId}`} className="btn btn-primary">
                <RefreshCw size={13} /> Try resubmitting
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Done
  if (!submission.scores || !submission.feedback) return <p>{t.common.error}</p>;

  const scores = submission.scores;
  const feedback = submission.feedback;
  const radarValues = CRITERIA.map(c => scores[c.k]);
  const promptId = submission.prompt?.id;

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/writing/history"
          style={{ fontSize: 12, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={12} /> {t.common.back} to history
        </Link>
      </div>

      <div className="page-head">
        <div className="eyebrow">— {submission.prompt?.task_type ?? 'Writing'} · {formatDate(submission.created_at)}</div>
        <h1 className="page-title">
          {submission.prompt?.title ?? 'Writing feedback'}
        </h1>
        <p className="page-subtitle">
          AI-scored across the four IELTS criteria. Your instructor can override if they&apos;re watching.
        </p>
      </div>

      {/* Hero score strip */}
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="grid g-24" style={{ gridTemplateColumns: 'minmax(220px, 280px) 1fr', alignItems: 'center' }}>
          <div>
            <div className="section-label">— Overall band</div>
            <div className="row" style={{ alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <div
                className="stat-value"
                style={{ fontSize: 56, color: bandTone(scores.overall), lineHeight: 1 }}
              >
                {scores.overall.toFixed(1)}
              </div>
              <span className="mono" style={{ color: 'var(--ink-3)' }}>/ 9</span>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 8, fontSize: 12, color: 'var(--ink-3)' }}>
              <span className="badge badge-outline">{submission.prompt?.level ?? '—'}</span>
              <span className="badge badge-outline">{submission.prompt?.task_type ?? '—'}</span>
              <span className="badge badge-outline">{submission.word_count} words</span>
              {submission.model_name && (
                <span className="badge" style={{ opacity: 0.7 }}>{submission.model_name}</span>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <RadarChart scores={radarValues} size={200} />
          </div>
        </div>
      </div>

      <div className="grid g-16" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)' }}>
        {/* Feedback column */}
        <div className="stack g-16">
          <div className="card card-pad">
            <div className="section-label" style={{ marginBottom: 10 }}>— Criteria breakdown</div>
            <div className="stack g-8">
              {CRITERIA.map(c => {
                const v = scores[c.k];
                return (
                  <div key={c.k} className="row" style={{ gap: 10 }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', width: 36 }}>{c.k}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-2)', flex: 1 }}>{c.label}</span>
                    <div className="progress" style={{ width: 120 }}>
                      <div style={{ width: `${(v / 9) * 100}%`, background: bandTone(v) }} />
                    </div>
                    <span
                      className="mono"
                      style={{ fontSize: 13, fontWeight: 600, width: 32, textAlign: 'right', color: bandTone(v) }}
                    >
                      {v.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-label" style={{ marginBottom: 10 }}>— Summary</div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
              {feedback.summary}
            </p>
          </div>

          {feedback.strengths.length > 0 && (
            <div className="card card-pad" style={{ borderLeft: '3px solid var(--success)' }}>
              <div className="row" style={{ gap: 6, marginBottom: 8 }}>
                <span className="badge badge-success">strengths</span>
              </div>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {feedback.strengths.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
              </ul>
            </div>
          )}

          {feedback.improvements.length > 0 && (
            <div className="card card-pad" style={{ borderLeft: '3px solid var(--warn)' }}>
              <div className="row" style={{ gap: 6, marginBottom: 8 }}>
                <span className="badge badge-warn">improvements</span>
              </div>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {feedback.improvements.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
              </ul>
            </div>
          )}

          {feedback.suggestions && (
            <div className="card card-pad" style={{ borderLeft: '3px solid var(--primary)' }}>
              <div className="row" style={{ gap: 6, marginBottom: 8 }}>
                <span className="badge badge-primary">suggestions</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                {feedback.suggestions}
              </p>
            </div>
          )}
        </div>

        {/* Right column: essay panel + CTAs */}
        <div className="stack g-16">
          <div className="card card-pad">
            <div className="row-between" style={{ marginBottom: 8 }}>
              <div className="section-label">— Your essay</div>
              <span className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                — {submission.word_count} words
              </span>
            </div>
            <div
              style={{
                padding: 16, background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 6, fontFamily: 'var(--ff-display)', fontSize: 13.5,
                lineHeight: 1.7, color: 'var(--ink-2)', whiteSpace: 'pre-wrap',
                maxHeight: 480, overflow: 'auto',
              }}
            >
              {submission.content}
            </div>
            <div className="row" style={{ gap: 12, marginTop: 8, fontSize: 11, color: 'var(--ink-3)' }}>
              <span><Check size={11} style={{ verticalAlign: 'middle' }} /> autosaved & submitted</span>
              <span>· <span className="mono">{submission.content.length}</span> characters</span>
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-label" style={{ marginBottom: 10 }}>— What&apos;s next</div>
            <div className="stack g-8">
              <Link href="/writing" className="btn" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>Try another prompt</span>
                <ArrowRight size={13} />
              </Link>
              {promptId && (
                <Link
                  href={`/writing/${promptId}`}
                  className="btn"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span>Rewrite this prompt</span>
                  <ArrowRight size={13} />
                </Link>
              )}
              <Link href="/writing/history" className="btn" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>Back to history</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
