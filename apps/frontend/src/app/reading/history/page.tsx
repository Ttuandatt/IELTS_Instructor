'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { BookOpen, AlertCircle, RefreshCw, ArrowRight, Clock } from 'lucide-react';

type Attempt = {
  id: string;
  score_pct: number;
  correct_count: number;
  total_questions: number;
  duration_sec: number | null;
  timed_out: boolean;
  test_mode: 'practice' | 'simulation';
  completed_at: string;
  passage?: { id: string; title: string; level: string };
};

const FILTERS = [
  { key: 'all' as const, label: 'All' },
  { key: 'practice' as const, label: 'Practice' },
  { key: 'simulation' as const, label: 'Simulation' },
];

function scoreTone(pct: number | null | undefined): string {
  if (pct == null) return 'var(--ink-3)';
  if (pct >= 80) return 'var(--success)';
  if (pct >= 60) return 'var(--primary)';
  if (pct >= 40) return 'var(--warn)';
  return 'var(--danger)';
}

function formatDuration(sec: number | null | undefined): string {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const h = Math.round(diff / 3_600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ReadingHistoryPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'practice' | 'simulation'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['reading-history', page],
    queryFn: () => apiClient.get(`/reading/history?page=${page}&limit=20`).then(r => r.data),
  });

  const all: Attempt[] = query.data?.data ?? [];
  const filtered = useMemo(() => {
    if (filter === 'all') return all;
    return all.filter(a => a.test_mode === filter);
  }, [all, filter]);

  const effectiveOpenId = openId ?? filtered[0]?.id ?? null;
  const open = filtered.find(a => a.id === effectiveOpenId) ?? all.find(a => a.id === effectiveOpenId);

  // Score trend — last 5 attempts (chronological asc)
  const trendData = useMemo(() => {
    return all
      .slice(0, 5)
      .reverse()
      .map(a => ({ id: a.id, pct: a.score_pct, mode: a.test_mode }));
  }, [all]);

  const avgScore = useMemo(() => {
    if (all.length === 0) return null;
    return all.reduce((sum, a) => sum + a.score_pct, 0) / all.length;
  }, [all]);

  const totalPages = Math.max(1, Math.ceil((query.data?.total || 1) / 20));

  return (
    <div className="fade-in">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— Your reading</div>
          <h1 className="page-title">
            Attempt <em>history</em>
          </h1>
          <p className="page-subtitle">
            {all.length === 0
              ? 'Submitted attempts land here with scores and timing.'
              : `${all.length} attempt${all.length === 1 ? '' : 's'} submitted${avgScore != null ? `. Average ${avgScore.toFixed(1)}%.` : '.'}`}
          </p>
        </div>
        <Link href="/reading" className="btn btn-primary">
          <BookOpen size={13} /> Take a new test <ArrowRight size={12} />
        </Link>
      </div>

      {query.isLoading ? (
        <div className="card card-pad" style={{ color: 'var(--ink-3)' }}>{t.common.loading}</div>
      ) : query.isError ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <AlertCircle size={28} style={{ color: 'var(--danger)', marginBottom: 12 }} />
          <p style={{ marginBottom: 16, color: 'var(--ink-2)' }}>{t.common.error}</p>
          <button className="btn btn-primary" onClick={() => query.refetch()}>
            <RefreshCw size={13} /> {t.common.retry}
          </button>
        </div>
      ) : all.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 16 }}>
            — No attempts yet
          </div>
          <Link href="/reading" className="btn btn-primary">
            <BookOpen size={13} /> Try a reading test
          </Link>
        </div>
      ) : (
        <>
          {/* Score trend */}
          {trendData.length >= 2 && (
            <div className="card card-pad" style={{ marginBottom: 16 }}>
              <div className="row-between" style={{ marginBottom: 8 }}>
                <div className="section-label">— Score trend, last {trendData.length} attempts</div>
                <span className="italic-serif" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  — chronological
                </span>
              </div>
              <ScoreTrend data={trendData} />
            </div>
          )}

          <div className="grid g-16" style={{ gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)' }}>
            <div>
              <div className="tabs" style={{ marginBottom: 10 }}>
                {FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={`tab ${filter === f.key ? 'is-active' : ''}`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="stack g-8">
                {filtered.length === 0 ? (
                  <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 12, padding: 16 }}>
                    No items in this filter.
                  </div>
                ) : (
                  filtered.map(a => {
                    const isOpen = effectiveOpenId === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        className="card"
                        onClick={() => setOpenId(a.id)}
                        style={{
                          padding: 14, cursor: 'pointer',
                          borderLeft: isOpen ? '3px solid var(--primary)' : '1px solid var(--border)',
                          background: isOpen ? 'var(--primary-softer)' : 'var(--bg-raised)',
                          textAlign: 'left', width: '100%',
                        }}
                      >
                        <div className="row-between" style={{ marginBottom: 6 }}>
                          <span className={`badge ${a.test_mode === 'simulation' ? 'badge-warn' : 'badge-primary'}`}>
                            {a.test_mode}
                          </span>
                          <span
                            className="mono"
                            style={{ fontSize: 13, fontWeight: 700, color: scoreTone(a.score_pct) }}
                          >
                            {a.score_pct.toFixed(0)}%
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 14, fontWeight: 500, color: 'var(--ink)',
                            marginBottom: 4, lineHeight: 1.3,
                          }}
                        >
                          {a.passage?.title ?? '—'}
                        </div>
                        <div className="row-between" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                          <span className="italic-serif">
                            — {relativeTime(a.completed_at)} · {a.correct_count}/{a.total_questions}
                          </span>
                          {a.timed_out && <span className="badge badge-warn">Timed out</span>}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 16, fontSize: 12, color: 'var(--ink-3)',
                }}
              >
                <span className="italic-serif">Page {page} of {totalPages}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => { setPage(p => p - 1); setOpenId(null); }}
                    className="btn btn-sm"
                  >
                    {t.common.previous}
                  </button>
                  <button
                    disabled={page * 20 >= (query.data?.total || 0)}
                    onClick={() => { setPage(p => p + 1); setOpenId(null); }}
                    className="btn btn-sm"
                  >
                    {t.common.next}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: detail */}
            {open ? (
              <DetailPanel
                attempt={open}
                onOpenReview={() => router.push(`/reading/attempts/${open.id}`)}
                onRetry={() => open.passage && router.push(`/reading/${open.passage.id}`)}
              />
            ) : (
              <div className="card card-pad" style={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
                <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                  Select an attempt to see details.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ScoreTrend({ data }: { data: Array<{ id: string; pct: number; mode: string }> }) {
  const width = 600;
  const height = 140;
  const xs = data.map((_, i) => 40 + (i * (width - 80)) / Math.max(data.length - 1, 1));
  const yFor = (p: number) => 110 - (p / 100) * 90;
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${yFor(d.pct)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }}>
      {[0, 25, 50, 75, 100].map(p => (
        <g key={p}>
          <line
            x1="40" x2={width - 20} y1={yFor(p)} y2={yFor(p)}
            stroke="var(--border)" strokeDasharray="2 4"
          />
          <text x="34" y={yFor(p) + 4} textAnchor="end" fontSize="10" fill="var(--ink-4)" fontFamily="var(--ff-mono)">
            {p}
          </text>
        </g>
      ))}
      <path d={path} stroke="var(--primary)" strokeWidth="2.5" fill="none" />
      {data.map((d, i) => (
        <g key={d.id}>
          <circle cx={xs[i]} cy={yFor(d.pct)} r="5" fill="var(--primary)" stroke="var(--bg-raised)" strokeWidth="2" />
          <text
            x={xs[i]} y={yFor(d.pct) - 12} textAnchor="middle"
            fontSize="10" fill="var(--ink)" fontFamily="var(--ff-mono)" fontWeight="600"
          >
            {d.pct.toFixed(0)}%
          </text>
          <text x={xs[i]} y={height - 4} textAnchor="middle" fontSize="9" fill="var(--ink-3)">
            {d.mode}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DetailPanel({
  attempt, onOpenReview, onRetry,
}: {
  attempt: Attempt;
  onOpenReview: () => void;
  onRetry: () => void;
}) {
  const wrong = attempt.total_questions - attempt.correct_count;
  return (
    <div className="card card-pad">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div>
          <div className="eyebrow">
            — {attempt.test_mode} · {new Date(attempt.completed_at).toLocaleDateString()}
          </div>
          <h2
            style={{
              fontFamily: 'var(--ff-display)', fontSize: 20, marginTop: 4,
              color: 'var(--ink)', fontWeight: 500, lineHeight: 1.25,
            }}
          >
            {attempt.passage?.title ?? '—'}
          </h2>
          <div className="row" style={{ gap: 6, marginTop: 4 }}>
            {attempt.passage?.level && (
              <span className={`badge level-${attempt.passage.level}`}>
                <span className={`level-dot level-${attempt.passage.level}`} />
                {attempt.passage.level}
              </span>
            )}
            {attempt.timed_out && <span className="badge badge-warn">Timed out</span>}
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {attempt.passage && (
            <button type="button" className="btn btn-sm" onClick={onRetry}>
              <RefreshCw size={12} /> Re-run this passage
            </button>
          )}
          <button type="button" className="btn btn-sm btn-primary" onClick={onOpenReview}>
            Open detailed review →
          </button>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid g-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: 16 }}>
        <div
          style={{
            padding: 16, background: 'var(--bg)', borderRadius: 6,
            border: '1px solid var(--border)', textAlign: 'center',
          }}
        >
          <div className="section-label" style={{ display: 'flex', justifyContent: 'center' }}>
            — Score
          </div>
          <div
            style={{
              fontFamily: 'var(--ff-display)', fontSize: 32, fontWeight: 400, marginTop: 4,
              color: scoreTone(attempt.score_pct), letterSpacing: '-0.02em',
            }}
          >
            {attempt.score_pct.toFixed(0)}<span style={{ fontSize: 16, color: 'var(--ink-3)' }}>%</span>
          </div>
        </div>
        <div
          style={{
            padding: 16, background: 'var(--bg)', borderRadius: 6,
            border: '1px solid var(--border)', textAlign: 'center',
          }}
        >
          <div className="section-label" style={{ display: 'flex', justifyContent: 'center' }}>
            — Correct
          </div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: 'var(--success)' }}>
            {attempt.correct_count}<span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>/{attempt.total_questions}</span>
          </div>
        </div>
        <div
          style={{
            padding: 16, background: 'var(--bg)', borderRadius: 6,
            border: '1px solid var(--border)', textAlign: 'center',
          }}
        >
          <div className="section-label" style={{ display: 'flex', justifyContent: 'center' }}>
            — Wrong
          </div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: wrong > 0 ? 'var(--danger)' : 'var(--ink-3)' }}>
            {wrong}
          </div>
        </div>
        <div
          style={{
            padding: 16, background: 'var(--bg)', borderRadius: 6,
            border: '1px solid var(--border)', textAlign: 'center',
          }}
        >
          <div className="section-label" style={{ display: 'flex', justifyContent: 'center' }}>
            — Time
          </div>
          <div className="mono row" style={{ fontSize: 18, fontWeight: 600, marginTop: 4, justifyContent: 'center', gap: 4, color: 'var(--ink)' }}>
            <Clock size={14} style={{ color: 'var(--ink-3)' }} />
            {formatDuration(attempt.duration_sec)}
          </div>
        </div>
      </div>

      <div
        className="italic-serif"
        style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', padding: '8px 0' }}
      >
        Open detailed review to see Q-by-Q breakdown with explanations
        {/* TODO #24-related: detailed review only renders if sessionStorage from same session
            has reading-result-${id}. Backend needs GET /reading/attempts/:id endpoint to
            persist across sessions. */}
      </div>
    </div>
  );
}
