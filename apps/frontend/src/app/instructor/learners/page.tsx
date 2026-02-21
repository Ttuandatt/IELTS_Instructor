'use client';

import { useState } from 'react';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function InstructorLearnersPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-learners', page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      return apiClient.get(`/instructor/learners?${params}`).then(r => r.data);
    },
  });

  return (
    <div>
      <h1 className="page-title">{t.instructor.my_learners}</h1>

      <div className="filters-row">
        <input
          type="text"
          placeholder={t.common.search}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="filter-input"
        />
      </div>

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
                  <th>{t.auth.display_name}</th>
                  <th>{t.auth.email}</th>
                  <th>{t.instructor.reading_submissions}</th>
                  <th>{t.instructor.writing_submissions}</th>
                  <th>{t.common.date}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((u: any) => (
                  <tr key={u.id}>
                    <td>{u.display_name}</td>
                    <td>{u.email}</td>
                    <td>{u._count?.reading_submissions ?? 0}</td>
                    <td>{u._count?.writing_submissions ?? 0}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
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
