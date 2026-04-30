'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { ArrowLeft, RotateCcw, Check, X, Clock } from 'lucide-react';

type Detail = {
  question_id: string;
  correct: boolean;
  your_answer: any;
  correct_answer: any;
  explanation: string | null;
};

type QuestionMeta = {
  id: string;
  type: string;
  prompt: string;
  options: string[] | null;
  order: number;
};

type ResultPayload = {
  submission_id: string;
  score_pct: number;
  correct_count: number;
  total_questions: number;
  duration_sec: number | null;
  timed_out: boolean;
  test_mode: string;
  details: Detail[];
  passage_title?: string;
  questions_meta?: QuestionMeta[];
  completed_at?: string;
};

function formatDuration(sec: number | null | undefined): string {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatAnswer(value: any): string {
  if (value == null || value === '') return '(blank)';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export default function ReadingAttemptResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();

  const [data, setData] = useState<ResultPayload | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(`reading-result-${id}`);
      if (raw) {
        setData(JSON.parse(raw) as ResultPayload);
      }
    } catch {
      // corrupt entry — fall through
    }
    setHydrated(true);
  }, [id]);

  // Redirect when no data
  useEffect(() => {
    if (hydrated && !data) {
      router.replace('/reading/history');
    }
  }, [hydrated, data, router]);

  const byType = useMemo(() => {
    if (!data) return [] as Array<{ type: string; ok: number; total: number }>;
    const map = new Map<string, { ok: number; total: number }>();
    for (const d of data.details) {
      const meta = data.questions_meta?.find(q => q.id === d.question_id);
      const type = meta?.type ?? 'other';
      const cur = map.get(type) ?? { ok: 0, total: 0 };
      cur.total += 1;
      if (d.correct) cur.ok += 1;
      map.set(type, cur);
    }
    return Array.from(map.entries()).map(([type, v]) => ({ type, ...v }));
  }, [data]);

  const detailedRows = useMemo(() => {
    if (!data) return [];
    return data.details.map((d, i) => {
      const meta = data.questions_meta?.find(q => q.id === d.question_id);
      const order = meta?.order ?? i + 1;
      return { ...d, meta, order };
    }).sort((a, b) => a.order - b.order);
  }, [data]);

  if (!hydrated) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <div className="app-loading-spinner" />
      </div>
    );
  }
  if (!data) return null; // redirecting

  const percent = data.score_pct.toFixed(0);
  const completedDate = data.completed_at
    ? new Date(data.completed_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/reading"
          style={{ fontSize: 12, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={12} /> {t.common.back ?? 'Back'} to Reading
        </Link>
      </div>

      <div className="page-head">
        <div className="eyebrow">
          — Results{completedDate ? ` · ${completedDate}` : ''}
          {data.timed_out && (
            <span className="badge badge-warn" style={{ marginLeft: 8 }}>Timed out</span>
          )}
        </div>
        <h1 className="page-title">
          {data.passage_title ? <>{data.passage_title}</> : <>Reading <em>attempt</em></>}
        </h1>
        <p className="page-subtitle">
          {data.correct_count >= data.total_questions * 0.7
            ? 'Solid attempt. Review wrong answers to lock in the gains.'
            : 'Use the breakdown below to find what tripped you up.'}
        </p>
      </div>

      {/* Hero score strip — RR-2: Score + Time only */}
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="grid g-24" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', alignItems: 'center' }}>
          <div>
            <div className="section-label">— Score</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <div className="stat-value" style={{ fontSize: 48, color: 'var(--primary)', lineHeight: 1 }}>
                {data.correct_count}
              </div>
              <div className="mono" style={{ color: 'var(--ink-3)' }}>/ {data.total_questions}</div>
            </div>
            <div className="italic-serif" style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
              — {percent}% correct
            </div>
          </div>
          <div>
            <div className="section-label">— Time taken</div>
            <div className="row" style={{ alignItems: 'baseline', marginTop: 4, gap: 6 }}>
              <Clock size={16} style={{ color: 'var(--ink-3)' }} />
              <div className="stat-value mono" style={{ fontSize: 30, color: 'var(--ink)', lineHeight: 1 }}>
                {formatDuration(data.duration_sec)}
              </div>
            </div>
            <div className="italic-serif" style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
              — {data.test_mode === 'simulation' ? 'Simulation mode' : 'Practice mode'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid g-16" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
        {/* Question breakdown */}
        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div className="section-label">— Your answers</div>
            <div className="row" style={{ gap: 10, fontSize: 11, color: 'var(--ink-3)' }}>
              <span className="row" style={{ gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--success)' }} /> Correct
              </span>
              <span className="row" style={{ gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--danger)' }} /> Wrong
              </span>
            </div>
          </div>

          {/* Square grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(detailedRows.length, 13)}, 1fr)`,
              gap: 4,
              marginBottom: 16,
            }}
          >
            {detailedRows.map(d => (
              <a
                key={d.question_id}
                href={`#q-${d.question_id}`}
                className="mono"
                style={{
                  padding: '10px 0', fontSize: 11, fontWeight: 600, borderRadius: 4,
                  border: '1px solid var(--border)',
                  background: d.correct
                    ? 'color-mix(in oklch, var(--success) 14%, var(--bg-raised))'
                    : 'color-mix(in oklch, var(--danger) 16%, var(--bg-raised))',
                  color: d.correct ? 'var(--success)' : 'var(--danger)',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                {d.order}
              </a>
            ))}
          </div>

          {/* Detailed list */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            {detailedRows.map(d => (
              <div
                key={d.question_id}
                id={`q-${d.question_id}`}
                style={{
                  padding: '12px 10px',
                  borderBottom: '1px solid var(--border)',
                  scrollMarginTop: 80,
                }}
              >
                <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', width: 28, fontWeight: 600 }}>
                    Q{d.order}
                  </div>
                  {d.meta?.type && (
                    <span className="badge" style={{ fontSize: 10 }}>{d.meta.type.replace(/_/g, ' ')}</span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {d.meta?.prompt && (
                      <div style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.5 }}>
                        {stripHtml(d.meta.prompt).slice(0, 220)}
                        {stripHtml(d.meta.prompt).length > 220 && '…'}
                      </div>
                    )}
                    <div className="row" style={{ gap: 12, fontSize: 13, flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--ink-3)' }}>Your answer:</span>
                      <span
                        className="mono"
                        style={{ fontWeight: 600, color: d.correct ? 'var(--success)' : 'var(--danger)' }}
                      >
                        {formatAnswer(d.your_answer)}
                      </span>
                      {!d.correct && (
                        <>
                          <span style={{ color: 'var(--ink-4)' }}>→</span>
                          <span style={{ color: 'var(--ink-3)' }}>Correct:</span>
                          <span className="mono" style={{ fontWeight: 600, color: 'var(--success)' }}>
                            {formatAnswer(d.correct_answer)}
                          </span>
                        </>
                      )}
                    </div>
                    {d.explanation && (
                      <div
                        className="italic-serif"
                        style={{
                          fontSize: 12, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.55,
                          borderLeft: '2px solid var(--border-strong)', paddingLeft: 10,
                        }}
                      >
                        — {d.explanation}
                      </div>
                    )}
                  </div>
                  {d.correct ? (
                    <Check size={16} style={{ color: 'var(--success)' }} />
                  ) : (
                    <X size={16} style={{ color: 'var(--danger)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="stack g-16">
          <div className="card card-pad">
            <div className="section-label" style={{ marginBottom: 10 }}>— By question type</div>
            {byType.length === 0 ? (
              <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                No data
              </div>
            ) : (
              byType.map(v => {
                const ratio = v.total > 0 ? v.ok / v.total : 0;
                const bg = v.ok === v.total
                  ? 'var(--success)'
                  : ratio >= 0.5 ? 'var(--primary)' : 'var(--danger)';
                return (
                  <div key={v.type} style={{ marginBottom: 10 }}>
                    <div className="row-between" style={{ fontSize: 12, marginBottom: 4 }}>
                      <span>{v.type.replace(/_/g, ' ')}</span>
                      <span className="mono" style={{ fontWeight: 600 }}>{v.ok}/{v.total}</span>
                    </div>
                    <div className="progress">
                      <div style={{ width: `${ratio * 100}%`, background: bg }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="card card-pad">
            <div className="section-label" style={{ marginBottom: 10 }}>— What's next</div>
            <div className="stack g-8">
              <Link
                href={`/reading`}
                className="btn"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span><RotateCcw size={13} /> Try another passage</span>
                <span>→</span>
              </Link>
              <Link
                href="/reading/history"
                className="btn"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>Back to history</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}