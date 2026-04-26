'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

function statusBadge(status: string): string {
  if (status === 'done') return 'cd-badge cd-badge-success';
  if (status === 'pending') return 'cd-badge cd-badge-warn';
  if (status === 'failed') return 'cd-badge cd-badge-danger';
  return 'cd-badge';
}

function bandTone(band: number | null | undefined): string {
  if (band == null) return 'cd-badge';
  if (band >= 7) return 'cd-badge cd-badge-success';
  if (band >= 6) return 'cd-badge cd-badge-primary';
  if (band >= 5) return 'cd-badge cd-badge-warn';
  return 'cd-badge cd-badge-danger';
}

export default function WritingHistoryPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['writing-history', page],
    queryFn: () => apiClient.get(`/writing/history?page=${page}&limit=20`).then(r => r.data),
  });

  const totalPages = Math.max(1, Math.ceil((data?.total || 1) / 20));

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">Writing</div>
        <h1 className="page-title">
          Your <em>history</em>
        </h1>
        <p className="page-subtitle">Every essay you've submitted, with scores and timing.</p>
      </div>

      {isLoading ? (
        <div className="card card-pad" style={{ color: 'var(--ink-3)' }}>{t.common.loading}</div>
      ) : !data?.data?.length ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>
          {t.common.no_data}
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="cd-table">
              <thead>
                <tr>
                  <th>{t.instructor.prompt_title}</th>
                  <th>{t.common.level}</th>
                  <th>Band</th>
                  <th>{t.writing.word_count}</th>
                  <th>{t.common.status}</th>
                  <th>{t.common.date}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((s: any) => {
                  const band = s.scores?.overall ?? null;
                  return (
                    <tr key={s.id}>
                      <td>
                        <Link
                          href={`/writing/submissions/${s.id}`}
                          style={{ color: 'var(--ink)', fontWeight: 500 }}
                        >
                          {s.prompt?.title ?? '—'}
                        </Link>
                      </td>
                      <td>
                        <span className="cd-badge cd-badge-outline">
                          <span className={`level-dot level-${s.prompt?.level}`} />
                          {s.prompt?.level ?? '—'}
                        </span>
                      </td>
                      <td>
                        <span className={bandTone(band)}>
                          {band != null ? band.toFixed(1) : '—'}
                        </span>
                      </td>
                      <td className="mono" style={{ color: 'var(--ink-2)' }}>{s.word_count}</td>
                      <td>
                        <span className={statusBadge(s.processing_status)}>
                          {s.processing_status}
                        </span>
                      </td>
                      <td className="italic-serif" style={{ color: 'var(--ink-3)' }}>
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                onClick={() => setPage(p => p - 1)}
                className="cd-btn cd-btn-sm"
              >
                {t.common.previous}
              </button>
              <button
                disabled={page * 20 >= (data.total || 0)}
                onClick={() => setPage(p => p + 1)}
                className="cd-btn cd-btn-sm"
              >
                {t.common.next}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
