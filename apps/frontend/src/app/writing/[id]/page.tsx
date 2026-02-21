'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function WritingPracticePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();
  const [essay, setEssay] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());

  const { data: prompt, isLoading } = useQuery({
    queryKey: ['writing-prompt', id],
    queryFn: () => apiClient.get(`/writing/prompts/${id}`).then(r => r.data),
  });

  const submitMut = useMutation({
    mutationFn: (body: any) => apiClient.post(`/writing/prompts/${id}/submit`, body).then(r => r.data),
    onSuccess: () => setSubmitted(true),
  });

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  const handleSubmit = () => {
    const duration_sec = Math.round((Date.now() - startTime) / 1000);
    submitMut.mutate({ essay_text: essay, duration_sec, word_count: wordCount });
  };

  if (isLoading) return <p>{t.common.loading}</p>;
  if (!prompt) return <p>{t.common.error}</p>;

  if (submitted) {
    return (
      <div className="result-card" style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
        <h2>✅ {t.writing.submit_essay}</h2>
        <p>{t.writing.scoring}</p>
        <button className="btn btn-primary" onClick={() => router.push('/writing')}>{t.common.back}</button>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>{t.common.back}</button>

      <h1 className="page-title">{prompt.title}</h1>

      <div className="writing-layout">
        <div className="writing-prompt-card">
          <div className="content-card-header">
            <span className={`badge badge-${prompt.level}`}>{prompt.level}</span>
            <span className="badge">{prompt.task_type}</span>
          </div>
          <div className="prompt-text">{prompt.prompt_text}</div>
          <p className="content-card-meta">{t.writing.min_words}: {prompt.min_words}</p>
        </div>

        <div className="writing-editor">
          <textarea
            className="essay-textarea"
            rows={20}
            value={essay}
            onChange={e => setEssay(e.target.value)}
            placeholder={t.writing.write_here}
          />
          <div className="writing-footer">
            <span className="word-counter">{t.writing.word_count}: {wordCount} / {prompt.min_words}</span>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitMut.isPending || wordCount < 10}
            >
              {t.writing.submit_essay}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
