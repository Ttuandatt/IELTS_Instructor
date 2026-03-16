'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';

export default function InstructorPassagesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-passages', page],
    queryFn: () => apiClient.get(`/instructor/passages?page=${page}&limit=20`).then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/instructor/passages/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-passages'] }),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete passage'),
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>{t.admin.manage_passages}</h1>
        <div className="flex gap-3">
          <Link href="/instructor/passages/upload" className="btn btn-secondary flex items-center gap-2">
            Import DOCX
          </Link>
          <Link href="/instructor/passages/new" className="btn btn-primary">{t.admin.create_passage}</Link>
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
                  <th>Creator</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((p: any) => (
                  <tr key={p.id}>
                    <td><Link href={`/instructor/passages/${p.id}`}>{p.title}</Link></td>
                    <td><span className={`badge badge-${p.level}`}>{p.level}</span></td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>{p._count?.questions ?? 0}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td><span className="text-sm text-gray-500">{p.creator?.display_name || '—'}</span></td>
                    <td>
                      {(user?.role === 'admin' || p.created_by === user?.id) && (
                        <>
                          <Link href={`/instructor/passages/${p.id}/edit`} className="btn-icon" title={t.common.edit}>✏️</Link>
                          <button className="btn-icon" title={t.common.delete} onClick={() => { if (confirm(t.common.confirm_delete)) deleteMut.mutate(p.id); }}>🗑️</button>
                        </>
                      )}
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
