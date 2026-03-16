'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { use } from 'react';

export default function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ['prompt', id],
    queryFn: () => apiClient.get(`/admin/prompts/${id}`).then(r => r.data),
  });

  const [form, setForm] = useState({
    title: '', prompt_text: '', task_type: 'task2', level: 'B1',
    status: 'draft', topic_tags: '', min_words: 250,
  });

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        prompt_text: data.prompt_text || '',
        task_type: data.task_type || 'task2',
        level: data.level || 'B1',
        status: data.status || 'draft',
        topic_tags: data.topic_tags?.join(', ') || '',
        min_words: data.min_words || 250,
      });
    }
  }, [data]);

  const updateMut = useMutation({
    mutationFn: (payload: any) => apiClient.patch(`/admin/prompts/${id}`, payload),
    onSuccess: () => {
      toast.success('Prompt updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompt', id] });
      router.push('/admin/prompts');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update prompt');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { task_type, ...rest } = form;
    updateMut.mutate({
      ...rest,
      min_words: Number(rest.min_words),
      topic_tags: rest.topic_tags.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load prompt details</div>;

  return (
    <div>
      <h1 className="page-title">{t.admin.edit_prompt}</h1>
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
            <select value={form.task_type} disabled title="Task type cannot be changed after creation">
              <option value="task1">Task 1</option>
              <option value="task2">Task 2</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t.common.level}</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
              {['A2','B1','B2','C1'].map(l => <option key={l} value={l}>{l}</option>)}
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
          <button type="submit" className="btn btn-primary" disabled={updateMut.isPending}>{updateMut.isPending ? 'Saving...' : t.common.save}</button>
        </div>
      </form>
    </div>
  );
}
