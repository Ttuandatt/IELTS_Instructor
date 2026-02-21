'use client';

import { useState } from 'react';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function WritingHistoryPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['writing-history', page],
    queryFn: () => apiClient.get(`/writing/history?page=${page}&limit=20`).then(r => r.data),
  });

  return (
    <div>
      <h1 className="page-title">{t.writing.history}</h1>

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
                  <th>{t.instructor.prompt_title}</th>
                  <th>{t.common.level}</th>
                  <th>{t.writing.word_count}</th>
                  <th>{t.common.status}</th>
                  <th>{t.common.date}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((s: any) => (
                  <tr key={s.id}>
                    <td>{s.prompt?.title ?? '—'}</td>
                    <td><span className={`badge badge-${s.prompt?.level}`}>{s.prompt?.level}</span></td>
                    <td>{s.word_count}</td>
                    <td><span className={`badge badge-${s.processing_status}`}>{s.processing_status}</span></td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
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
