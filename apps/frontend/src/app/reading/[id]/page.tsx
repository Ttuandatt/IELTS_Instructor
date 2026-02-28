'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ModeSelectorModal } from '@/components/ModeSelectorModal';

export default function ReadingPracticePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();

  // State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);

  // Mode Selection State
  const [showModeModal, setShowModeModal] = useState(true);
  const [testMode, setTestMode] = useState<'practice' | 'simulation' | null>(null);

  // Timer State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60); // 60 minutes in seconds

  const { data: passage, isLoading } = useQuery({
    queryKey: ['reading-passage', id],
    queryFn: () => apiClient.get(`/reading/passages/${id}`).then(r => r.data),
  });

  const submitMut = useMutation({
    mutationFn: (body: any) => apiClient.post(`/reading/passages/${id}/submit`, body).then(r => r.data),
    onSuccess: (data) => setResult(data),
  });

  const handleSubmit = (isAutoSubmit = false) => {
    if (!startTime || !testMode) return;

    let duration_sec = Math.round((Date.now() - startTime) / 1000);
    // Format answers array
    const answerList = Object.entries(answers).map(([question_id, value]) => ({ question_id, value: String(value) }));

    // In simulation mode, if we auto-submit, mark timed_out
    const timed_out = isAutoSubmit;

    submitMut.mutate({
      answers: answerList,
      duration_sec,
      test_mode: testMode,
      timed_out
    });
  };

  const handleModeSelect = (mode: 'practice' | 'simulation') => {
    setTestMode(mode);
    setStartTime(Date.now());
    setShowModeModal(false);
  };

  // Timer Effect
  useEffect(() => {
    if (testMode !== 'simulation' || !startTime || result || submitMut.isPending) return;

    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, 60 * 60 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        handleSubmit(true); // Auto submit!
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [testMode, startTime, result, submitMut.isPending]);

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading) return <p>{t.common.loading}</p>;
  if (!passage) return <p>{t.common.error}</p>;

  // If modal is open, just show backend-loading container (but modal will overlay)
  if (showModeModal) {
    return (
      <div>
        <h1 className="page-title">{passage.title}</h1>
        <ModeSelectorModal
          isOpen={showModeModal}
          onClose={() => router.back()}
          onSelectMode={handleModeSelect}
        />
      </div>
    );
  }

  // Calculate progress
  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim() !== '').length;
  const isReadyToSubmit = testMode === 'simulation' ? true : answeredCount >= Math.floor((passage.questions?.length || 0) * 0.8);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => router.back()}>{t.common.back}</button>

        {/* Timer UI specifically for Simulation Mode */}
        {testMode === 'simulation' && !result && (
          <div style={{
            padding: '0.5rem 1rem',
            background: timeLeft < 300 ? 'var(--color-accent-danger)' : 'var(--color-bg-card)',
            color: timeLeft < 300 ? 'white' : 'inherit',
            borderRadius: 'var(--radius-full)',
            fontWeight: 'bold',
            border: '2px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <h1 className="page-title">{passage.title}</h1>
      <div className="reading-layout">
        <div className="reading-passage">
          <div className="passage-text" dangerouslySetInnerHTML={{ __html: passage.body?.replace(/\n/g, '<br/>') }} />
        </div>

        <div className="reading-questions">
          {result ? (
            <div className="result-card">
              <div style={{ marginBottom: '1rem' }}>
                <span className="badge" style={{ background: result.test_mode === 'simulation' ? 'var(--color-accent-warning)' : 'var(--color-accent-primary)' }}>
                  {result.test_mode === 'simulation' ? 'Simulation Mode' : 'Practice Mode'}
                </span>
                {result.timed_out && <span className="badge badge-A2" style={{ marginLeft: '0.5rem' }}>Timed Out</span>}
              </div>

              <h2>{t.reading.score}: {result.score_pct?.toFixed(1)}%</h2>
              <p>{t.reading.correct}: {result.correct_count} / {result.total_questions}</p>
              <button className="btn btn-primary" onClick={() => router.push('/reading')} style={{ marginTop: '1rem' }}>
                {t.common.back}
              </button>

              <div style={{ marginTop: '2rem' }}>
                <h3>Review Answers:</h3>
                {result.details?.map((detail: any, idx: number) => (
                  <div key={detail.question_id} style={{
                    padding: '1rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '1rem',
                    background: detail.correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                  }}>
                    <p><strong>Q{idx + 1}.</strong> Your Answer: <span style={{ color: detail.correct ? 'var(--color-accent-success)' : 'var(--color-accent-danger)' }}>{detail.your_answer || '(blank)'}</span></p>
                    {!detail.correct && (
                      <p>Correct Answer: <strong>{typeof detail.correct_answer === 'object' ? JSON.stringify(detail.correct_answer) : detail.correct_answer}</strong></p>
                    )}
                    {detail.explanation && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg-primary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        <strong>Explanation:</strong> {detail.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge" style={{ background: testMode === 'simulation' ? 'var(--color-accent-warning)' : 'var(--color-accent-primary)' }}>
                  {testMode === 'simulation' ? 'Simulation Mode' : 'Practice Mode'}
                </span>
                <span style={{ fontSize: '0.875rem', color: answeredCount >= Math.floor((passage.questions?.length || 0) * 0.8) ? 'var(--color-accent-success)' : 'var(--color-text-secondary)' }}>
                  {answeredCount}/{passage.questions?.length} answered
                </span>
              </div>

              {passage.questions?.map((q: any, idx: number) => (
                <div key={q.id} className="question-card">
                  <p className="question-prompt"><strong>Q{idx + 1}.</strong> {q.prompt}</p>
                  {q.options?.length > 0 ? (
                    <div className="question-options">
                      {q.options.map((opt: string, oi: number) => (
                        <label key={oi} className="option-label">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="question-input"
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                      placeholder="Your answer..."
                    />
                  )}
                </div>
              ))}
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSubmit(false)}
                  disabled={submitMut.isPending || !isReadyToSubmit}
                  style={{ width: '100%' }}
                >
                  {submitMut.isPending ? 'Submitting...' : t.reading.submit_answers}
                </button>
                {testMode === 'practice' && !isReadyToSubmit && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-accent-danger)', textAlign: 'center', marginTop: '0.5rem' }}>
                    * In Practice Mode, please answer at least 80% of questions before submitting.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
