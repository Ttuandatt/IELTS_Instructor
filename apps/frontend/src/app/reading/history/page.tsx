'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

function scoreTone(pct: number | null | undefined): string {
  if (pct == null) return 'cd-badge';
  if (pct >= 80) return 'cd-badge cd-badge-success';
  if (pct >= 60) return 'cd-badge cd-badge-primary';
  if (pct >= 40) return 'cd-badge cd-badge-warn';
  return 'cd-badge cd-badge-danger';
}

export default function ReadingHistoryPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['reading-history', page],
    queryFn: () => apiClient.get(`/reading/history?page=${page}&limit=20`).then(r => r.data),
  });

  const totalPages = Math.ceil((data?.total || 1) / 20);

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Reading</div>
        <h1 className="page-title">
          Your <em>history</em>
        </h1>
        <p className="page-subtitle">Every passage you've submitted, with scores and timing.</p>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--ink-3)' }}>{t.common.loading}</p>
      ) : !data?.data?.length ? (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>
          {t.common.no_data}
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="cd-table">
              <thead>
                <tr>
                  <th>{t.instructor.passage_title}</th>
                  <th>{t.common.level}</th>
                  <th>{t.reading.score}</th>
                  <th>{t.reading.correct}/{t.common.total}</th>
                  <th>{t.common.date}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((s: any) => (
                  <tr key={s.id}>
                    <td>
                      {s.passage?.id ? (
                        <Link href={`/reading/${s.passage.id}`} style={{ color: 'var(--ink)', fontWeight: 500 }}>
                          {s.passage?.title ?? '—'}
                        </Link>
                      ) : (
                        s.passage?.title ?? '—'
                      )}
                    </td>
                    <td>
                      <span className="cd-badge cd-badge-outline">
                        <span className={`level-dot level-${s.passage?.level}`} />
                        {s.passage?.level ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className={scoreTone(s.score_pct)}>
                        {s.score_pct != null ? `${s.score_pct.toFixed(1)}%` : '—'}
                      </span>
                    </td>
                    <td className="mono" style={{ color: 'var(--ink-2)' }}>
                      {s.correct_count}/{s.total_questions}
                    </td>
                    <td className="italic-serif" style={{ color: 'var(--ink-3)' }}>
                      {new Date(s.completed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
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
