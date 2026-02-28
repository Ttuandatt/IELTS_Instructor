'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function ReadingPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reading-passages', page, level, collectionFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (level) params.set('level', level);
      if (collectionFilter) params.set('collection', collectionFilter);
      return apiClient.get(`/reading/passages?${params}`).then(r => r.data);
    },
  });

  // Group items by collection
  const groups = useMemo(() => {
    if (!data?.data) return {};
    const result: Record<string, any[]> = {};
    for (const item of data.data) {
      const key = item.collection || 'Other Tests';
      if (!result[key]) result[key] = [];
      result[key].push(item);
    }
    return result;
  }, [data?.data, t]);

  // Extract unique collections from all data to populate dropdown (ideally this comes from an API)
  // For MVP, we'll just allow free text or a predefined list, but for now we'll just use a few common ones
  const mockCollections = ['IELTS Mock Test 2025', 'IELTS Mock Test 2024', 'IELTS Mock Test 2023'];

  return (
    <div>
      <h1 className="page-title">{t.reading.title}</h1>

      <div className="filters-row">
        <select value={collectionFilter} onChange={e => { setCollectionFilter(e.target.value); setPage(1); }} className="filter-select">
          <option value="">{t.common.filter} - Collection</option>
          {mockCollections.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={level} onChange={e => { setLevel(e.target.value); setPage(1); }} className="filter-select">
          <option value="">{t.common.filter} - {t.common.level}</option>
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <Link href="/reading/history" className="btn btn-secondary">{t.reading.history}</Link>
      </div>

      {isLoading ? (
        <p>{t.common.loading}</p>
      ) : Object.keys(groups).length === 0 ? (
        <div className="empty-state">{t.reading.no_passages}</div>
      ) : (
        <>
          {Object.entries(groups).map(([collectionName, items]) => (
            <div key={collectionName} style={{ marginBottom: '3rem' }}>
              <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                {collectionName}
              </h2>
              <div className="card-grid">
                {items.map((p: any) => (
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
            </div>
          ))}
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-sm">{t.common.previous}</button>
            <span>Page {page} / {Math.ceil((data?.total || 1) / 12)}</span>
            <button disabled={page * 12 >= (data?.total || 0)} onClick={() => setPage(p => p + 1)} className="btn btn-sm">{t.common.next}</button>
          </div>
        </>
      )}
    </div>
  );
}
