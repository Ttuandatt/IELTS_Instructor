'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function AdminPassagesPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-passages', page],
    queryFn: () => apiClient.get(`/admin/passages?page=${page}&limit=20`).then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/passages/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-passages'] }),
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>{t.admin.manage_passages}</h1>
        <div className="flex gap-3">
          <Link href="/admin/passages/upload" className="btn btn-secondary flex items-center gap-2">
            Import DOCX
          </Link>
          <Link href="/admin/passages/new" className="btn btn-primary">{t.admin.create_passage}</Link>
        </div>
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
                  <th>{t.common.level}</th>
                  <th>{t.common.status}</th>
                  <th>{t.reading.questions}</th>
                  <th>{t.common.date}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((p: any) => (
                  <tr key={p.id}>
                    <td><Link href={`/admin/passages/${p.id}`}>{p.title}</Link></td>
                    <td><span className={`badge badge-${p.level}`}>{p.level}</span></td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>{p._count?.questions ?? 0}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/admin/passages/${p.id}/edit`} className="btn-icon" title={t.common.edit}>✏️</Link>
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
