'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';

export default function AdminPromptsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-prompts', page],
    queryFn: () => apiClient.get(`/instructor/prompts?page=${page}&limit=20`).then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/instructor/prompts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-prompts'] }),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete prompt'),
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>{t.admin.manage_prompts}</h1>
        <Link href="/instructor/prompts/new" className="btn btn-primary">{t.admin.create_prompt}</Link>
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
                  <th>{t.admin.passage_title}</th>
                  <th>{t.admin.task_type}</th>
                  <th>{t.common.level}</th>
                  <th>{t.common.status}</th>
                  <th>{t.common.date}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((p: any) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td><span className="badge">{p.task_type}</span></td>
                    <td><span className={`badge badge-${p.level}`}>{p.level}</span></td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/instructor/prompts/${p.id}/edit`} className="btn-icon" title={t.common.edit}>✏️</Link>
                      <button className="btn-icon" title={t.common.delete} onClick={() => { if (confirm(t.common.confirm_delete)) deleteMut.mutate(p.id); }}>🗑️</button>
                    </td>
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
