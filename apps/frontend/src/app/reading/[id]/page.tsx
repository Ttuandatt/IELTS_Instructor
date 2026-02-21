'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function ReadingPracticePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [startTime] = useState(Date.now());

  const { data: passage, isLoading } = useQuery({
    queryKey: ['reading-passage', id],
    queryFn: () => apiClient.get(`/reading/passages/${id}`).then(r => r.data),
  });

  const submitMut = useMutation({
    mutationFn: (body: any) => apiClient.post(`/reading/passages/${id}/submit`, body).then(r => r.data),
    onSuccess: (data) => setResult(data),
  });

  const handleSubmit = () => {
    const duration_sec = Math.round((Date.now() - startTime) / 1000);
    const answerList = Object.entries(answers).map(([question_id, value]) => ({ question_id, value }));
    submitMut.mutate({ answers: answerList, duration_sec });
  };

  if (isLoading) return <p>{t.common.loading}</p>;
  if (!passage) return <p>{t.common.error}</p>;

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>{t.common.back}</button>

      <h1 className="page-title">{passage.title}</h1>
      <div className="reading-layout">
        <div className="reading-passage">
          <div className="passage-text" dangerouslySetInnerHTML={{ __html: passage.body?.replace(/\n/g, '<br/>') }} />
        </div>

        <div className="reading-questions">
          {result ? (
            <div className="result-card">
              <h2>{t.reading.score}: {result.score_pct?.toFixed(1)}%</h2>
              <p>{t.reading.correct}: {result.correct_count} / {result.total_questions}</p>
              <button className="btn btn-primary" onClick={() => router.push('/reading')}>{t.common.back}</button>
            </div>
          ) : (
            <>
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
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitMut.isPending}>
                {t.reading.submit_answers}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
