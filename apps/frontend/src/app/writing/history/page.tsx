'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { PenLine, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

type Status = 'pending' | 'done' | 'failed';

type Submission = {
  id: string;
  processing_status: Status;
  word_count: number;
  scores?: { TR?: number; CC?: number; LR?: number; GRA?: number; overall?: number };
  prompt?: { id?: string; title?: string; task_type?: string; level?: string };
  created_at: string;
  content?: string;
  feedback?: { summary?: string };
};

function statusBadge(s: Status): { className: string; label: string } {
  if (s === 'done') return { className: 'badge badge-success', label: 'Reviewed' };
  if (s === 'pending') return { className: 'badge badge-warn', label: 'Pending' };
  return { className: 'badge badge-danger', label: 'Failed' };
}

function bandTone(b: number | null | undefined): string {
  if (b == null) return 'var(--ink-3)';
  if (b >= 7) return 'var(--success)';
  if (b >= 6) return 'var(--primary)';
  if (b >= 5) return 'var(--warn)';
  return 'var(--danger)';
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

const FILTERS = [
  { key: 'all' as const, label: 'All' },
  { key: 'reviewed' as const, label: 'Reviewed' },
  { key: 'pending' as const, label: 'Pending' },
];

const CRITERIA: Array<{ k: 'TR' | 'CC' | 'LR' | 'GRA'; label: string }> = [
  { k: 'TR', label: 'TR' },
  { k: 'CC', label: 'CC' },
  { k: 'LR', label: 'LR' },
  { k: 'GRA', label: 'GRA' },
];

export default function WritingHistoryPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'reviewed' | 'pending'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['writing-history', page],
    queryFn: () => apiClient.get(`/writing/history?page=${page}&limit=20`).then(r => r.data),
  });

  const all: Submission[] = query.data?.data ?? [];
  const filtered = useMemo(() => {
    if (filter === 'all') return all;
    if (filter === 'reviewed') return all.filter(s => s.processing_status === 'done');
    return all.filter(s => s.processing_status !== 'done');
  }, [all, filter]);

  // Auto-open first item on load
  const effectiveOpenId = openId ?? filtered[0]?.id ?? null;
  const open = filtered.find(s => s.id === effectiveOpenId) ?? all.find(s => s.id === effectiveOpenId);

  // Trend chart data — last 5 done submissions
  const trendData = useMemo(() => {
    return all
      .filter(s => s.processing_status === 'done' && typeof s.scores?.overall === 'number')
      .slice(0, 5)
      .reverse()
      .map(s => ({
        id: s.id,
        band: s.scores!.overall as number,
        task: s.prompt?.task_type ?? '—',
      }));
  }, [all]);

  const avgBand = useMemo(() => {
    const dones = all.filter(s => s.processing_status === 'done' && typeof s.scores?.overall === 'number');
    if (dones.length === 0) return null;
    return dones.reduce((sum, s) => sum + (s.scores!.overall as number), 0) / dones.length;
  }, [all]);

  const totalPages = Math.max(1, Math.ceil((query.data?.total || 1) / 20));

  return (
    <div className="fade-in">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— Your writing</div>
          <h1 className="page-title">
            Essay <em>history</em>
          </h1>
          <p className="page-subtitle">
            {all.length === 0
              ? 'Submitted essays land here with scores and feedback.'
              : `${all.length} essays submitted${avgBand != null ? `. Average band ${avgBand.toFixed(2)}.` : '.'}`}
          </p>
        </div>
        <Link href="/writing" className="btn btn-primary">
          <PenLine size={13} /> Write a new essay <ArrowRight size={12} />
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
            — No essays submitted yet
          </div>
          <Link href="/writing" className="btn btn-primary">
            <PenLine size={13} /> Try a writing prompt
          </Link>
        </div>
      ) : (
        <>
          {/* Band trend */}
          {trendData.length >= 2 && (
            <div className="card card-pad" style={{ marginBottom: 16 }}>
              <div className="row-between" style={{ marginBottom: 8 }}>
                <div className="section-label">— Band trend, last {trendData.length} essays</div>
                <span className="italic-serif" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  — chronological
                </span>
              </div>
              <BandTrend data={trendData} />
            </div>
          )}

          <div className="grid g-16" style={{ gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)' }}>
            {/* Left: list */}
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
                  filtered.map(s => {
                    const isOpen = effectiveOpenId === s.id;
                    const band = s.scores?.overall;
                    const sb = statusBadge(s.processing_status);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className="card"
                        onClick={() => setOpenId(s.id)}
                        style={{
                          padding: 14, cursor: 'pointer',
                          borderLeft: isOpen ? '3px solid var(--primary)' : '1px solid var(--border)',
                          background: isOpen ? 'var(--primary-softer)' : 'var(--bg-raised)',
                          textAlign: 'left', width: '100%',
                        }}
                      >
                        <div className="row-between" style={{ marginBottom: 6 }}>
                          <span className="badge badge-primary">{s.prompt?.task_type ?? '—'}</span>
                          <span
                            className="mono"
                            style={{ fontSize: 13, fontWeight: 700, color: bandTone(band) }}
                          >
                            {band != null ? band.toFixed(1) : '—'}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 14, fontWeight: 500, color: 'var(--ink)',
                            marginBottom: 4, lineHeight: 1.3,
                          }}
                        >
                          {s.prompt?.title ?? '—'}
                        </div>
                        <div className="row-between" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                          <span className="italic-serif">
                            — {relativeTime(s.created_at)} · {s.word_count} words
                          </span>
                          <span className={sb.className}>{sb.label}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
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
              <DetailPanel submission={open} onOpenFull={() => router.push(`/writing/submissions/${open.id}`)} />
            ) : (
              <div className="card card-pad" style={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
                <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                  Select an essay to see details.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BandTrend({ data }: { data: Array<{ id: string; band: number; task: string }> }) {
  const width = 600;
  const height = 140;
  const xs = data.map((_, i) => 40 + (i * (width - 80)) / Math.max(data.length - 1, 1));
  const yFor = (b: number) => 110 - ((b - 5) / 4) * 90; // band 5-9 mapped to y range
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${yFor(d.band)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }}>
      {[5, 6, 7, 8, 9].map((b, i) => (
        <g key={b}>
          <line
            x1="40" x2={width - 20} y1={yFor(b)} y2={yFor(b)}
            stroke="var(--border)" strokeDasharray="2 4"
          />
          <text x="34" y={yFor(b) + 4} textAnchor="end" fontSize="10" fill="var(--ink-4)" fontFamily="var(--ff-mono)">
            {b}
          </text>
        </g>
      ))}
      <path d={path} stroke="var(--primary)" strokeWidth="2.5" fill="none" />
      {data.map((d, i) => (
        <g key={d.id}>
          <circle cx={xs[i]} cy={yFor(d.band)} r="5" fill="var(--primary)" stroke="var(--bg-raised)" strokeWidth="2" />
          <text
            x={xs[i]} y={yFor(d.band) - 12} textAnchor="middle"
            fontSize="10" fill="var(--ink)" fontFamily="var(--ff-mono)" fontWeight="600"
          >
            {d.band.toFixed(1)}
          </text>
          <text x={xs[i]} y={height - 4} textAnchor="middle" fontSize="9" fill="var(--ink-3)">
            {d.task}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DetailPanel({ submission, onOpenFull }: { submission: Submission; onOpenFull: () => void }) {
  const { id, processing_status, prompt, scores, word_count, content, feedback, created_at } = submission;
  const promptId = prompt?.id;
  const isDone = processing_status === 'done';

  // Conditionally fetch full submission if list response missing content
  const detailQuery = useQuery({
    queryKey: ['writing-submission-detail', id],
    enabled: isDone && !content,
    queryFn: () => apiClient.get(`/writing/submissions/${id}`).then(r => r.data),
  });
  const fullContent = content ?? detailQuery.data?.content;
  const fullFeedback = feedback ?? detailQuery.data?.feedback;

  return (
    <div className="card card-pad">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div>
          <div className="eyebrow">
            — {prompt?.task_type ?? '—'} · {new Date(created_at).toLocaleDateString()}
          </div>
          <h2
            style={{
              fontFamily: 'var(--ff-display)', fontSize: 20, marginTop: 4,
              color: 'var(--ink)', fontWeight: 500, lineHeight: 1.25,
            }}
          >
            {prompt?.title ?? '—'}
          </h2>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {promptId && (
            <Link href={`/writing/${promptId}`} className="btn btn-sm">
              Rewrite →
            </Link>
          )}
          <button type="button" className="btn btn-sm btn-primary" onClick={onOpenFull}>
            Open full review →
          </button>
        </div>
      </div>

      {/* Criteria mini */}
      {isDone && scores && (
        <div className="grid g-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }}>
          {CRITERIA.map(c => {
            const v = scores[c.k];
            return (
              <div
                key={c.k}
                style={{
                  padding: 10, background: 'var(--bg)', borderRadius: 6,
                  border: '1px solid var(--border)', textAlign: 'center',
                }}
              >
                <div className="section-label" style={{ display: 'flex', justifyContent: 'center' }}>
                  — {c.k}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: bandTone(v) }}
                >
                  {v != null ? v.toFixed(1) : '—'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status row for non-done */}
      {!isDone && (
        <div
          className="card card-tight"
          style={{
            background: processing_status === 'failed' ? 'var(--danger-soft)' : 'var(--warn-soft)',
            border: `1px solid ${processing_status === 'failed' ? 'var(--danger)' : 'var(--warn)'}`,
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            {processing_status === 'pending'
              ? '⏳ Scoring in progress — refresh to update.'
              : '❌ Scoring failed for this submission.'}
          </div>
        </div>
      )}

      {/* Essay excerpt */}
      <div className="section-label" style={{ marginBottom: 8 }}>— Your essay (excerpt)</div>
      <div
        style={{
          padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
          fontFamily: 'var(--ff-display)', fontSize: 13.5, lineHeight: 1.7,
          color: 'var(--ink-2)', marginBottom: 12, maxHeight: 200, overflow: 'hidden',
          position: 'relative', whiteSpace: 'pre-wrap',
        }}
      >
        {fullContent ?? '(content unavailable)'}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
            background: 'linear-gradient(to bottom, transparent, var(--bg))',
            pointerEvents: 'none',
          }}
        />
      </div>
      <div className="row" style={{ gap: 12, fontSize: 11, color: 'var(--ink-3)', marginBottom: 12 }}>
        <span><span className="mono" style={{ color: 'var(--ink-2)' }}>{word_count}</span> words</span>
      </div>

      {/* Feedback summary */}
      {isDone && fullFeedback?.summary && (
        <div
          style={{
            padding: 14, background: 'var(--primary-softer)',
            border: '1px solid var(--primary-soft)', borderRadius: 6,
          }}
        >
          <div className="section-label" style={{ marginBottom: 6 }}>— AI feedback summary</div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
            {fullFeedback.summary}
          </p>
        </div>
      )}
    </div>
  );
}
