'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function ReadingPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reading-passages', page, level],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (level) params.set('level', level);
      return apiClient.get(`/reading/passages?${params}`).then(r => r.data);
    },
  });

  return (
    <div>
      <h1 className="page-title">{t.reading.title}</h1>

      <div className="filters-row">
        <select value={level} onChange={e => { setLevel(e.target.value); setPage(1); }} className="filter-select">
          <option value="">{t.common.filter} - {t.common.level}</option>
          {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <Link href="/reading/history" className="btn btn-secondary">{t.reading.history}</Link>
      </div>

      {isLoading ? (
        <p>{t.common.loading}</p>
      ) : !data?.data?.length ? (
        <div className="empty-state">{t.reading.no_passages}</div>
      ) : (
        <>
          <div className="card-grid">
            {data.data.map((p: any) => (
              <Link key={p.id} href={`/reading/${p.id}`} className="content-card">
                <div className="content-card-header">
                  <span className={`badge badge-${p.level}`}>{p.level}</span>
                  <span className="content-card-count">{p._count?.questions ?? 0} {t.reading.questions}</span>
                </div>
                <h3 className="content-card-title">{p.title}</h3>
                {p.topic_tags?.length > 0 && (
                  <div className="content-card-tags">
                    {p.topic_tags.map((tag: string) => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                )}
              </Link>
            ))}
          </div>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-sm">{t.common.previous}</button>
            <span>Page {page} / {Math.ceil((data.total || 1) / 12)}</span>
            <button disabled={page * 12 >= (data.total || 0)} onClick={() => setPage(p => p + 1)} className="btn btn-sm">{t.common.next}</button>
          </div>
        </>
      )}
    </div>
  );
}
