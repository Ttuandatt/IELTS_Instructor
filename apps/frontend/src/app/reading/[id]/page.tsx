'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAutoSave } from '@/hooks/useAutoSave';
import {
  ArrowLeft, Clock, Send, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Highlighter, RotateCcw,
} from 'lucide-react';

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api$/, '');

export default function ReadingPracticePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [showResultDetail, setShowResultDetail] = useState(true);

  const [showModeModal, setShowModeModal] = useState(true);
  const [testMode, setTestMode] = useState<'practice' | 'simulation' | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60);

  const { restored: restoredAnswers, clear: clearSavedAnswers } = useAutoSave(
    `reading-answers-${id}`,
    answers,
  );

  useEffect(() => {
    if (restoredAnswers) setAnswers(restoredAnswers);
  }, [restoredAnswers]);

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: passage, isLoading } = useQuery({
    queryKey: ['reading-passage', id],
    queryFn: () => apiClient.get(`/reading/passages/${id}`).then(r => r.data),
  });

  const submitMut = useMutation({
    mutationFn: (body: any) => apiClient.post(`/reading/passages/${id}/submit`, body).then(r => r.data),
    onSuccess: (data) => {
      clearSavedAnswers();
      setResult(data);
    },
  });

  const handleSubmit = (isAutoSubmit = false) => {
    if (!startTime || !testMode) return;
    const duration_sec = Math.round((Date.now() - startTime) / 1000);
    const answerList = Object.entries(answers).map(([question_id, value]) => ({ question_id, value: String(value) }));
    submitMut.mutate({ answers: answerList, duration_sec, test_mode: testMode, timed_out: isAutoSubmit });
  };

  const handleModeSelect = (mode: 'practice' | 'simulation') => {
    setTestMode(mode);
    setStartTime(Date.now());
    setShowModeModal(false);
  };

  useEffect(() => {
    if (testMode !== 'simulation' || !startTime || result || submitMut.isPending) return;
    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, 60 * 60 - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        handleSubmit(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [testMode, startTime, result, submitMut.isPending]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const scrollToQuestion = (qId: string) => {
    questionRefs.current[qId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="app-loading-spinner" />
    </div>
  );
  if (!passage) return <p>{t.common.error}</p>;

  /* ── Mode selector ── */
  if (showModeModal) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,64px))] bg-gray-50 px-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">{passage.title}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => handleModeSelect('practice')}
              className="bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg p-8 text-left transition-all group"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Practice Mode</h3>
              <ul className="text-sm text-gray-600 space-y-1.5 mb-6 list-disc pl-5">
                <li>No time limit</li>
                <li>Pause and resume anytime</li>
                <li>Focus on accuracy</li>
              </ul>
              <div className="w-full py-2.5 rounded-lg bg-gray-100 group-hover:bg-blue-600 group-hover:text-white text-center font-semibold text-sm transition-colors">
                Start Practice
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleModeSelect('simulation')}
              className="bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg p-8 text-left transition-all group"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Simulation Mode</h3>
              <ul className="text-sm text-gray-600 space-y-1.5 mb-6 list-disc pl-5">
                <li>Strict 60-minute timer</li>
                <li>Auto-submits when time is up</li>
                <li>Simulates actual IELTS test</li>
              </ul>
              <div className="w-full py-2.5 rounded-lg bg-purple-600 text-white group-hover:bg-purple-700 text-center font-semibold text-sm transition-colors">
                Start Simulation
              </div>
            </button>
          </div>
          <div className="text-center mt-6">
            <button className="text-gray-500 hover:text-gray-700 text-sm font-medium" onClick={() => router.back()}>
              ← Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions: any[] = passage.questions || [];
  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim() !== '').length;
  const isReadyToSubmit = testMode === 'simulation' ? true : answeredCount >= Math.floor(questions.length * 0.8);
  const isTimerDanger = testMode === 'simulation' && timeLeft < 300;
  const isPdf = passage.body?.includes('data-source-pdf');
  const pdfSrc = isPdf ? `${BACKEND_ORIGIN}${passage.body.match(/data-source-pdf="([^"]+)"/)?.[1] || ''}` : '';

  return (
    <div className="rp-fullscreen">
      {/* ── Header Bar ── */}
      <div className="rp-bar">
        <div className="rp-bar-left">
          <button onClick={() => router.back()} className="rp-bar-back">
            <ArrowLeft size={16} />
          </button>
          <h1 className="rp-bar-title">{passage.title}</h1>
          <span className={`rp-bar-badge ${testMode === 'simulation' ? 'rp-bar-badge--sim' : 'rp-bar-badge--prac'}`}>
            {testMode === 'simulation' ? 'Simulation' : 'Practice'}
          </span>
        </div>

        <div className="rp-bar-center">
          <label className="rp-bar-highlight">
            <input type="checkbox" checked={highlightEnabled} onChange={e => setHighlightEnabled(e.target.checked)} />
            <Highlighter size={14} />
            Highlight
          </label>
          <span className="rp-bar-progress">{answeredCount}/{questions.length} answered</span>
        </div>

        <div className="rp-bar-right">
          {testMode === 'simulation' && !result && (
            <div className={`rp-bar-timer ${isTimerDanger ? 'rp-bar-timer--danger' : ''}`}>
              <Clock size={14} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
          {!result && (
            <button
              className="rp-bar-submit"
              onClick={() => handleSubmit(false)}
              disabled={submitMut.isPending || !isReadyToSubmit}
            >
              <Send size={14} />
              {submitMut.isPending ? 'Submitting...' : 'Submit'}
            </button>
          )}
          {result && (
            <div className="rp-bar-score">
              {result.score_pct?.toFixed(0)}% · {result.correct_count}/{result.total_questions}
            </div>
          )}
        </div>
      </div>

      {/* ── 2-Panel Body ── */}
      <div className="rp-panels">
        {/* LEFT: Passage */}
        <div className={`rp-panel-passage ${highlightEnabled ? 'rp-panel-passage--highlight' : ''}`}>
          {isPdf ? (
            <iframe src={`${pdfSrc}#toolbar=0`} className="rp-pdf-iframe" title={passage.title} />
          ) : (
            <div className="rp-passage-content" dangerouslySetInnerHTML={{ __html: passage.body?.replace(/\n/g, '<br/>') || '' }} />
          )}
        </div>

        {/* RIGHT: Questions / Results */}
        <div className="rp-panel-questions">
          {result ? (
            <div className="rp-result-wrap">
              <div className="rp-result-header">
                <div className="rp-result-score">
                  <span className="rp-result-pct">{result.score_pct?.toFixed(0)}%</span>
                  <span className="rp-result-count">{result.correct_count}/{result.total_questions} correct</span>
                </div>
                {result.timed_out && <span className="rp-badge-timeout">Timed Out</span>}
              </div>

              <button className="rp-toggle-detail" onClick={() => setShowResultDetail(!showResultDetail)}>
                {showResultDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showResultDetail ? 'Hide Details' : 'Show Details'}
              </button>

              {showResultDetail && (
                <div className="rp-result-list">
                  {result.details?.map((d: any, idx: number) => (
                    <div key={d.question_id} className={`rp-result-item ${d.correct ? 'rp-result-correct' : 'rp-result-wrong'}`}>
                      <div className="rp-result-item-head">
                        {d.correct ? <CheckCircle2 size={16} className="rp-icon-correct" /> : <XCircle size={16} className="rp-icon-wrong" />}
                        <strong>Q{idx + 1}</strong>
                      </div>
                      <div className="rp-result-item-body">
                        <p>Your answer: <span className={d.correct ? 'rp-text-correct' : 'rp-text-wrong'}>{d.your_answer || '(blank)'}</span></p>
                        {!d.correct && <p>Correct: <strong>{typeof d.correct_answer === 'object' ? JSON.stringify(d.correct_answer) : d.correct_answer}</strong></p>}
                        {d.explanation && <p className="rp-explanation">{d.explanation}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rp-result-actions">
                <button className="rp-btn rp-btn-primary" onClick={() => { setResult(null); setAnswers({}); setStartTime(Date.now()); }}>
                  <RotateCcw size={16} /> Retry
                </button>
                <button className="rp-btn rp-btn-secondary" onClick={() => router.push('/reading')}>
                  Back to Catalog
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mini answer sheet */}
              <div className="rp-mini-sheet">
                {questions.map((q: any, idx: number) => {
                  const answered = !!answers[q.id]?.trim();
                  let status = answered ? 'answered' : '';
                  if (result) {
                    const detail = (result as any).details?.find((d: any) => d.question_id === q.id);
                    status = detail?.correct ? 'correct' : detail ? 'wrong' : '';
                  }
                  return (
                    <button
                      key={q.id}
                      className={`rp-mini-cell rp-mini-cell--${status}`}
                      onClick={() => scrollToQuestion(q.id)}
                      title={`Q${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Questions */}
              <div className="rp-qlist">
                {questions.map((q: any, idx: number) => (
                  <div
                    key={q.id}
                    className="rp-qcard"
                    ref={el => { questionRefs.current[q.id] = el; }}
                  >
                    <p className="rp-qprompt">
                      <strong>{idx + 1}.</strong>{' '}
                      <span dangerouslySetInnerHTML={{ __html: q.prompt }} />
                    </p>
                    {q.options?.length > 0 ? (
                      <div className="rp-opts">
                        {q.options.map((opt: string, oi: number) => (
                          <label key={oi} className={`rp-opt ${answers[q.id] === opt ? 'rp-opt--sel' : ''}`}>
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                            />
                            <span className="rp-opt-letter">{String.fromCharCode(65 + oi)}</span>
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="rp-qinput"
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                        placeholder="Your answer..."
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
