'use client';

import { useState } from 'react';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function AdminUsersPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      return apiClient.get(`/admin/users?${params}`).then(r => r.data);
    },
  });

  const roleChangeMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => apiClient.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div>
      <h1 className="page-title">{t.admin.manage_users}</h1>

      <div className="filters-row">
        <input
          type="text"
          placeholder={t.common.search}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="filter-input"
        />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="filter-select">
          <option value="">{t.common.filter} - {t.admin.user_role}</option>
          <option value="learner">{t.auth.role_learner}</option>
          <option value="instructor">{t.auth.role_instructor}</option>
          <option value="admin">{t.auth.role_admin}</option>
        </select>
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
                  <th>{t.admin.user_role}</th>
                  <th>{t.common.date}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((u: any) => (
                  <tr key={u.id}>
                    <td>{u.display_name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => roleChangeMut.mutate({ id: u.id, role: e.target.value })}
                        className="inline-select"
                      >
                        <option value="learner">{t.auth.role_learner}</option>
                        <option value="instructor">{t.auth.role_instructor}</option>
                        <option value="admin">{t.auth.role_admin}</option>
                      </select>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-icon" title={t.common.delete} onClick={() => { if (confirm(t.common.confirm_delete)) deleteMut.mutate(u.id); }}>🗑️</button>
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
