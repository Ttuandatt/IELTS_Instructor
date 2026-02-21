'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function NewPassagePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', body: '', level: 'B1', status: 'draft', topic_tags: '' });

  const createMut = useMutation({
    mutationFn: (data: any) => apiClient.post('/admin/passages', data),
    onSuccess: () => router.push('/admin/passages'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({
      ...form,
      topic_tags: form.topic_tags.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div>
      <h1 className="page-title">{t.admin.create_passage}</h1>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t.admin.passage_title}</label>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>{t.admin.passage_body}</label>
          <textarea rows={12} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>{t.common.level}</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
              {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>{t.common.status}</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="draft">{t.admin.draft}</option>
              <option value="published">{t.admin.published}</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>{t.admin.topic_tags}</label>
          <input type="text" placeholder="tag1, tag2, tag3" value={form.topic_tags} onChange={e => setForm(f => ({ ...f, topic_tags: e.target.value }))} />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>{t.common.cancel}</button>
          <button type="submit" className="btn btn-primary" disabled={createMut.isPending}>{t.common.save}</button>
        </div>
      </form>
    </div>
  );
}
