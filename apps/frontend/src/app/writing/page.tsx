'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function WritingPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState('');
  const [taskType, setTaskType] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['writing-prompts', page, level, taskType, collectionFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (level) params.set('level', level);
      if (taskType) params.set('task_type', taskType);
      if (collectionFilter) params.set('collection', collectionFilter);
      return apiClient.get(`/writing/prompts?${params}`).then(r => r.data);
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
  const mockCollections = ['IELTS Mock Test 2025', 'IELTS Mock Test 2024', 'IELTS Mock Test 2023'];

  return (
    <div>
      <h1 className="page-title">{t.writing.title}</h1>

      <div className="filters-row">
        <select value={collectionFilter} onChange={e => { setCollectionFilter(e.target.value); setPage(1); }} className="filter-select">
          <option value="">{t.common.filter} - Collection</option>
          {mockCollections.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={taskType} onChange={e => { setTaskType(e.target.value); setPage(1); }} className="filter-select">
          <option value="">{t.common.filter} - Task</option>
          <option value="task1">Task 1</option>
          <option value="task2">Task 2</option>
        </select>
        <select value={level} onChange={e => { setLevel(e.target.value); setPage(1); }} className="filter-select">
          <option value="">{t.common.filter} - {t.common.level}</option>
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <Link href="/writing/history" className="btn btn-secondary">{t.writing.history}</Link>
      </div>

      {isLoading ? (
        <p>{t.common.loading}</p>
      ) : Object.keys(groups).length === 0 ? (
        <div className="empty-state">{t.writing.no_prompts}</div>
      ) : (
        <>
          {Object.entries(groups).map(([collectionName, items]) => (
            <div key={collectionName} style={{ marginBottom: '3rem' }}>
              <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                {collectionName}
              </h2>
              <div className="card-grid">
                {items.map((p: any) => (
                  <Link key={p.id} href={`/writing/${p.id}`} className="content-card">
                    <div className="content-card-header">
                      <span className={`badge badge-${p.level}`}>{p.level}</span>
                      <span className="badge">{p.task_type}</span>
                    </div>
                    <h3 className="content-card-title">{p.title}</h3>
                    <p className="content-card-meta">{t.writing.min_words}: {p.min_words}</p>
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
