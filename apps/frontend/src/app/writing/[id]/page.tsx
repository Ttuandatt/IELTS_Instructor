'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAutoSave } from '@/hooks/useAutoSave';
import { X, Clock, Sparkles, Zap, Loader2 } from 'lucide-react';

export default function WritingPracticePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();
  const [essay, setEssay] = useState('');
  const [startTime] = useState(Date.now());
  const [modelTier, setModelTier] = useState<'cheap' | 'premium'>('cheap');
  const [elapsedLabel, setElapsedLabel] = useState('0:00');

  const { restored: restoredEssay, clear: clearSavedEssay } = useAutoSave(
    `writing-draft-${id}`,
    essay,
  );

  useEffect(() => {
    if (restoredEssay) setEssay(restoredEssay);
  }, [restoredEssay]);

  useEffect(() => {
    const tick = () => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      const mm = Math.floor(seconds / 60);
      const ss = String(seconds % 60).padStart(2, '0');
      setElapsedLabel(`${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const { data: prompt, isLoading } = useQuery<any>({
    queryKey: ['writing-prompt', id],
    queryFn: () => apiClient.get(`/writing/prompts/${id}`).then(r => r.data),
  });

  const submitMut = useMutation({
    mutationFn: (body: any) =>
      apiClient.post(`/writing/prompts/${id}/submit`, body).then(r => r.data),
    onSuccess: (data: any) => {
      clearSavedEssay();
      const submissionId = data?.id || data?.data?.id;
      if (submissionId) {
        router.push(`/writing/submissions/${submissionId}`);
      }
    },
  });

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const minWords = prompt?.min_words ?? 250;
  const canSubmit = wordCount >= minWords && !submitMut.isPending;
  const pct = Math.min(100, (wordCount / minWords) * 100);

  const handleSubmit = () => {
    const duration_sec = Math.round((Date.now() - startTime) / 1000);
    submitMut.mutate({
      essay_text: essay,
      duration_sec,
      word_count: wordCount,
      model_tier: modelTier,
    });
  };

  if (isLoading) {
    return (
      <div className="test-fullscreen" style={{ placeItems: 'center', display: 'grid' }}>
        <div className="italic-serif" style={{ color: 'var(--ink-3)' }}>— {t.common.loading}</div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="test-fullscreen" style={{ placeItems: 'center', display: 'grid' }}>
        <div className="card card-pad">
          <div style={{ color: 'var(--danger)', marginBottom: 12 }}>{t.common.error}</div>
          <button className="cd-btn" onClick={() => router.push('/writing')}>{t.common.back}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-fullscreen">
      {/* Header bar */}
      <div className="test-head">
        <button className="cd-btn cd-btn-sm" onClick={() => router.push('/writing')}>
          <X size={12} /> Exit
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <div>
          <div style={{
            fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase',
            letterSpacing: '0.1em', fontWeight: 600,
          }}>
            {prompt.task_type} · {prompt.level}
          </div>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 500 }}>
            {prompt.title}
          </div>
        </div>

        <div className="ml-auto cd-row" style={{ gap: 10 }}>
          <div className="italic-serif" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            — autosaved
          </div>
          <div
            className="cd-row"
            style={{ gap: 6, padding: '5px 10px', background: 'var(--bg-sunk)', borderRadius: 6 }}
          >
            <Clock size={13} />
            <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{elapsedLabel}</span>
          </div>
          <div className="segmented" style={{ fontSize: 11 }}>
            <button
              className={modelTier === 'cheap' ? 'is-active' : ''}
              onClick={() => setModelTier('cheap')}
              title="Standard model"
            >
              <Zap size={11} /> Standard
            </button>
            <button
              className={modelTier === 'premium' ? 'is-active' : ''}
              onClick={() => setModelTier('premium')}
              title="Premium model"
            >
              <Sparkles size={11} /> Premium
            </button>
          </div>
          <button
            className="cd-btn cd-btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitMut.isPending ? (
              <><Loader2 size={12} className="animate-spin" /> {t.writing.scoring}</>
            ) : (
              <><Sparkles size={12} /> {t.writing.submit_essay}</>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          display: 'grid', gridTemplateRows: 'auto 1fr auto',
          flex: 1, minHeight: 0,
        }}
      >
        <div
          style={{
            padding: '20px 32px 16px',
            background: 'var(--bg-sunk)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="section-label" style={{ marginBottom: 4 }}>— The prompt</div>
          <div
            style={{
              fontFamily: 'var(--ff-display)', fontSize: 15, lineHeight: 1.55,
              color: 'var(--ink)', maxWidth: '80ch',
            }}
          >
            {prompt.prompt_text}
          </div>
          <div className="cd-row" style={{ gap: 12, marginTop: 10 }}>
            <span className="cd-badge cd-badge-outline">
              min {prompt.min_words} {t.writing.word_count.toLowerCase()}
            </span>
          </div>
        </div>

        <div style={{ overflow: 'auto', padding: '20px 40px' }}>
          <textarea
            value={essay}
            onChange={e => setEssay(e.target.value)}
            placeholder={t.writing.write_here}
            disabled={submitMut.isPending}
            style={{
              width: '100%', height: '100%', minHeight: 360,
              border: 'none', outline: 'none', background: 'transparent',
              resize: 'none',
              fontFamily: 'var(--ff-display)',
              fontSize: 15,
              lineHeight: 1.75,
              color: 'var(--ink)',
            }}
          />
        </div>

        <div className="test-footer" style={{ padding: '0 20px' }}>
          <div className="cd-row" style={{ gap: 16, fontSize: 12, color: 'var(--ink-3)' }}>
            <span>
              {t.writing.word_count}{' '}
              <span className="mono" style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 13 }}>{wordCount}</span>{' '}
              <span className="italic-serif">/ min {minWords}</span>
            </span>
            <div className="cd-progress" style={{ width: 120 }}>
              <div style={{ width: pct + '%', background: wordCount >= minWords ? 'var(--success)' : 'var(--primary)' }} />
            </div>
            <span>Characters <span className="mono">{essay.length}</span></span>
          </div>
        </div>
      </div>

      {submitMut.isError && (
        <div
          style={{
            position: 'absolute', bottom: 56, left: '50%', transform: 'translateX(-50%)',
            padding: '8px 12px', borderRadius: 'var(--r-md)',
            background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 12,
          }}
        >
          {(submitMut.error as any)?.response?.data?.message || t.common.error}
        </div>
      )}
    </div>
  );
}
