'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import WordCounter from '@/components/WordCounter';

export default function WritingPracticePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();
  const [essay, setEssay] = useState('');
  const [startTime] = useState(Date.now());
  const [modelTier, setModelTier] = useState<'cheap' | 'premium'>('cheap');

  const { data: promptData, isLoading } = useQuery({
    queryKey: ['writing-prompt', id],
    queryFn: () => apiClient.get(`/writing/prompts/${id}`).then(r => r.data),
  });

  const prompt = promptData;

  const submitMut = useMutation({
    mutationFn: (body: any) =>
      apiClient.post(`/writing/prompts/${id}/submit`, body).then(r => r.data),
    onSuccess: (data: any) => {
      // Navigate to the submission polling/feedback page
      const submissionId = data?.id || data?.data?.id;
      if (submissionId) {
        router.push(`/writing/submissions/${submissionId}`);
      }
    },
  });

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const minWords = prompt?.min_words ?? 250;
  const canSubmit = wordCount >= minWords && !submitMut.isPending;

  const handleSubmit = () => {
    const duration_sec = Math.round((Date.now() - startTime) / 1000);
    submitMut.mutate({
      essay_text: essay,
      duration_sec,
      word_count: wordCount,
      model_tier: modelTier,
    });
  };

  if (isLoading) return <p>{t.common.loading}</p>;
  if (!prompt) return <p>{t.common.error}</p>;

  return (
    <div>
      <button
        className="btn btn-secondary"
        onClick={() => router.back()}
        style={{ marginBottom: '1rem' }}
      >
        {t.common.back}
      </button>

      <h1 className="page-title">{prompt.title}</h1>

      <div className="writing-layout">
        {/* Prompt Card */}
        <div className="writing-prompt-card">
          <div className="content-card-header">
            <span className={`badge badge-${prompt.level}`}>{prompt.level}</span>
            <span className="badge">{prompt.task_type}</span>
          </div>
          <div className="prompt-text">{prompt.prompt_text}</div>
          <p className="content-card-meta">{t.writing.min_words}: {prompt.min_words}</p>

          {/* Model Tier Selector */}
          <div className="model-tier-selector">
            <label className="model-tier-label">Scoring Model:</label>
            <div className="model-tier-options">
              <button
                className={`model-tier-btn ${modelTier === 'cheap' ? 'active' : ''}`}
                onClick={() => setModelTier('cheap')}
              >
                ⚡ Standard
              </button>
              <button
                className={`model-tier-btn ${modelTier === 'premium' ? 'active' : ''}`}
                onClick={() => setModelTier('premium')}
              >
                🌟 Premium
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="writing-editor">
          <textarea
            className="essay-textarea"
            rows={22}
            value={essay}
            onChange={e => setEssay(e.target.value)}
            placeholder={t.writing.write_here}
            disabled={submitMut.isPending}
          />
          <div className="writing-footer">
            <WordCounter text={essay} minWords={minWords} />
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {submitMut.isPending ? '⏳ Submitting...' : t.writing.submit_essay}
            </button>
          </div>
          {submitMut.isError && (
            <p className="error-text">
              {(submitMut.error as any)?.response?.data?.message || t.common.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
