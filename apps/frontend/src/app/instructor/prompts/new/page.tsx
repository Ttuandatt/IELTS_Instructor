'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function NewPromptPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', prompt_text: '', task_type: 'task2', level: 'B1', status: 'draft', topic_tags: '', min_words: 250 });

  const createMut = useMutation({
    mutationFn: (data: any) => apiClient.post('/instructor/prompts', data),
    onSuccess: () => router.push('/instructor/prompts'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({
      ...form,
      min_words: Number(form.min_words),
      topic_tags: form.topic_tags.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div>
      <h1 className="page-title">{t.admin.create_prompt}</h1>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t.admin.passage_title}</label>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>{t.admin.prompt_text}</label>
          <textarea rows={8} value={form.prompt_text} onChange={e => setForm(f => ({ ...f, prompt_text: e.target.value }))} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>{t.admin.task_type}</label>
            <select value={form.task_type} onChange={e => setForm(f => ({ ...f, task_type: e.target.value }))}>
              <option value="task1">Task 1</option>
              <option value="task2">Task 2</option>
            </select>
          </div>
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
        <div className="form-row">
          <div className="form-group">
            <label>{t.writing.min_words}</label>
            <input type="number" value={form.min_words} onChange={e => setForm(f => ({ ...f, min_words: +e.target.value }))} min={50} />
          </div>
          <div className="form-group">
            <label>{t.admin.topic_tags}</label>
            <input type="text" placeholder="tag1, tag2" value={form.topic_tags} onChange={e => setForm(f => ({ ...f, topic_tags: e.target.value }))} />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>{t.common.cancel}</button>
          <button type="submit" className="btn btn-primary" disabled={createMut.isPending}>{t.common.save}</button>
        </div>
      </form>
    </div>
  );
}
