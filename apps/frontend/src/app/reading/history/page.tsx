'use client';

import { useState } from 'react';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function ReadingHistoryPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['reading-history', page],
    queryFn: () => apiClient.get(`/reading/history?page=${page}&limit=20`).then(r => r.data),
  });

  return (
    <div>
      <h1 className="page-title">{t.reading.history}</h1>

      {isLoading ? (
        <p>{t.common.loading}</p>
      ) : !data?.data?.length ? (
        <div className="empty-state">{t.common.no_data}</div>
      ) : (
        <>
          <div className="data-table-wrapper">
            <table className="data-table">
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
                    <td>{s.passage?.title ?? '—'}</td>
                    <td><span className={`badge badge-${s.passage?.level}`}>{s.passage?.level}</span></td>
                    <td>{s.score_pct?.toFixed(1)}%</td>
                    <td>{s.correct_count}/{s.total_questions}</td>
                    <td>{new Date(s.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-sm">{t.common.previous}</button>
            <span>Page {page} / {Math.ceil((data.total || 1) / 20)}</span>
            <button disabled={page * 20 >= (data.total || 0)} onClick={() => setPage(p => p + 1)} className="btn btn-sm">{t.common.next}</button>
          </div>
        </>
      )}
    </div>
  );
}
