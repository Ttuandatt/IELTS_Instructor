'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ModeSelectorModal } from '@/components/ModeSelectorModal';
import { useAutoSave } from '@/hooks/useAutoSave';
import {
  ArrowLeft, Clock, Send, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Highlighter, RotateCcw,
} from 'lucide-react';

export default function ReadingPracticePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();

  // State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [showResultDetail, setShowResultDetail] = useState(true);

  // Mode Selection State
  const [showModeModal, setShowModeModal] = useState(true);
  const [testMode, setTestMode] = useState<'practice' | 'simulation' | null>(null);

  // Timer State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60);

  // Auto-save reading answers
  const { restored: restoredAnswers, clear: clearSavedAnswers } = useAutoSave(
    `reading-answers-${id}`,
    answers,
  );

  // Restore saved answers on mount
  useEffect(() => {
    if (restoredAnswers) {
      setAnswers(restoredAnswers);
    }
  }, [restoredAnswers]);

  // Refs for scrolling question into view
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
    const timed_out = isAutoSubmit;
    submitMut.mutate({ answers: answerList, duration_sec, test_mode: testMode, timed_out });
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
    <div className="rp-loading">
      <div className="app-loading-spinner" />
    </div>
  );
  if (!passage) return <p>{t.common.error}</p>;

  if (showModeModal) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 className="page-title">{passage.title}</h1>
        <ModeSelectorModal
          isOpen={showModeModal}
          onClose={() => router.back()}
          onSelectMode={handleModeSelect}
        />
      </div>
    );
  }

  const questions: any[] = passage.questions || [];
  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim() !== '').length;
  const isReadyToSubmit = testMode === 'simulation' ? true : answeredCount >= Math.floor(questions.length * 0.8);
  const isTimerDanger = testMode === 'simulation' && timeLeft < 300;

  return (
    <div className="rp-wrapper">
      {/* ── Top Header Bar ── */}
      <div className="rp-header">
        <div className="rp-header-left">
          <button className="rp-exit-btn" onClick={() => router.back()}>
            <ArrowLeft size={16} />
            Thoát
          </button>
          <h1 className="rp-title">{passage.title}</h1>
          <span className={`rp-mode-badge ${testMode === 'simulation' ? 'rp-mode-sim' : 'rp-mode-prac'}`}>
            {testMode === 'simulation' ? 'Simulation' : 'Practice'}
          </span>
        </div>
      </div>

      {/* ── Toolbar: highlight toggle ── */}
      <div className="rp-toolbar">
        <label className="rp-highlight-toggle">
          <input
            type="checkbox"
            checked={highlightEnabled}
            onChange={e => setHighlightEnabled(e.target.checked)}
          />
          <Highlighter size={14} />
          Highlight nội dung
        </label>
        <span className="rp-answered-badge">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      {/* ── 3-panel Layout ── */}
      <div className="rp-body">
        {/* LEFT: Passage */}
        <div className={`rp-passage ${highlightEnabled ? 'rp-passage--highlight' : ''}`}>
          <div
            className="rp-passage-text"
            dangerouslySetInnerHTML={{ __html: passage.body?.replace(/\n/g, '<br/>') || '' }}
          />
        </div>

        {/* CENTER: Questions or Results */}
        <div className="rp-questions">
          {result ? (
            /* ── Results View ── */
            <div className="rp-result">
              <div className="rp-result-header">
                <div className="rp-result-score">
                  <span className="rp-result-pct">{result.score_pct?.toFixed(0)}%</span>
                  <span className="rp-result-count">{result.correct_count}/{result.total_questions} correct</span>
                </div>
                {result.timed_out && <span className="rp-badge-timeout">⏰ Timed Out</span>}
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
            /* ── Questions View ── */
            <div className="rp-question-list">
              {questions.map((q: any, idx: number) => (
                <div
                  key={q.id}
                  className="rp-question-card"
                  ref={el => { questionRefs.current[q.id] = el; }}
                >
                  <p className="rp-question-prompt"><strong>{idx + 1}.</strong> {q.prompt}</p>
                  {q.options?.length > 0 ? (
                    <div className="rp-options">
                      {q.options.map((opt: string, oi: number) => (
                        <label key={oi} className={`rp-option ${answers[q.id] === opt ? 'rp-option--selected' : ''}`}>
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                          />
                          <span className="rp-option-letter">{String.fromCharCode(65 + oi)}</span>
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="rp-answer-input"
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                      placeholder="Your answer..."
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Sidebar — Timer + Submit + Answer Sheet */}
        <div className="rp-sidebar">
          {/* Timer */}
          {testMode === 'simulation' && !result && (
            <div className={`rp-timer ${isTimerDanger ? 'rp-timer--danger' : ''}`}>
              <div className="rp-timer-label"><Clock size={14} /> Thời gian còn lại:</div>
              <div className="rp-timer-value">{formatTime(timeLeft)}</div>
            </div>
          )}

          {/* Submit */}
          {!result && (
            <button
              className="rp-submit-btn"
              onClick={() => handleSubmit(false)}
              disabled={submitMut.isPending || !isReadyToSubmit}
            >
              <Send size={16} />
              {submitMut.isPending ? 'Submitting...' : 'NỘP BÀI'}
            </button>
          )}

          {result && (
            <div className="rp-sidebar-score">
              <div className="rp-sidebar-score-pct">{result.score_pct?.toFixed(0)}%</div>
              <div className="rp-sidebar-score-label">{result.correct_count}/{result.total_questions} correct</div>
            </div>
          )}

          {/* Hint */}
          {!result && testMode === 'practice' && !isReadyToSubmit && (
            <p className="rp-submit-hint">
              Answer ≥80% to submit ({answeredCount}/{questions.length})
            </p>
          )}

          {/* Answer Sheet Grid */}
          <div className="rp-sheet">
            <div className="rp-sheet-title">Answer Sheet</div>
            <div className="rp-sheet-grid">
              {questions.map((q: any, idx: number) => {
                const answered = !!answers[q.id]?.trim();
                let status = answered ? 'answered' : '';
                if (result) {
                  const detail = result.details?.find((d: any) => d.question_id === q.id);
                  status = detail?.correct ? 'correct' : detail ? 'wrong' : '';
                }
                return (
                  <button
                    key={q.id}
                    className={`rp-sheet-cell rp-sheet-cell--${status}`}
                    onClick={() => scrollToQuestion(q.id)}
                    title={`Q${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
