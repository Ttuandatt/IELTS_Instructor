'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAutoSave } from '@/hooks/useAutoSave';
import {
  ArrowLeft, Clock, Send, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Highlighter, RotateCcw, NotebookPen, Target,
} from 'lucide-react';

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api$/, '');
const SIM_DURATION = 60 * 60;

function stripOptionPrefix(opt: string): string {
  return opt.replace(/^\s*[A-Ea-e]\s*[.)]\s*/, '');
}

function extractGroupInstruction(prompt: string): { instruction: string | null; body: string } {
  const match = prompt.match(/^<div\s+class="[^"]*border-l-4[^"]*">([\s\S]*?)<\/div>/);
  if (!match) return { instruction: null, body: prompt };
  return { instruction: match[1], body: prompt.slice(match[0].length).trimStart() };
}

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
  const [timeLeft, setTimeLeft] = useState<number>(SIM_DURATION);
  const [currentQid, setCurrentQid] = useState<string | null>(null);

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
      const remaining = Math.max(0, SIM_DURATION - elapsed);
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
    setCurrentQid(qId);
  };

  if (isLoading) return (
    <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
      <div className="app-loading-spinner" />
    </div>
  );
  if (!passage) return <p>{t.common.error}</p>;

  /* ─────────── Mode selector ─────────── */
  if (showModeModal) {
    return (
      <div className="test-mode-wrap">
        <div style={{ width: '100%', maxWidth: 720 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="eyebrow">IELTS Reading</div>
            <h1 className="page-title" style={{ fontSize: 32 }}>
              {passage.title}
            </h1>
            <p className="page-subtitle" style={{ margin: '8px auto 0' }}>
              Choose how you want to approach this passage.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <button type="button" onClick={() => handleModeSelect('practice')} className="test-mode-card">
              <div className="icon"><NotebookPen size={20} /></div>
              <h3>Practice mode</h3>
              <ul>
                <li>No time limit</li>
                <li>Pause and resume anytime</li>
                <li>Focus on accuracy</li>
              </ul>
              <div className="cd-btn" style={{ width: '100%', justifyContent: 'center' }}>
                Start practice
              </div>
            </button>

            <button type="button" onClick={() => handleModeSelect('simulation')} className="test-mode-card">
              <div className="icon"><Target size={20} /></div>
              <h3>Simulation mode</h3>
              <ul>
                <li>Strict 60-minute timer</li>
                <li>Auto-submits when time is up</li>
                <li>Simulates an actual IELTS sitting</li>
              </ul>
              <div className="cd-btn cd-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Start simulation
              </div>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button className="cd-btn cd-btn-ghost" onClick={() => router.back()}>
              <ArrowLeft size={14} /> Go back
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

  /* ─────────── Result view ─────────── */
  if (result) {
    return (
      <div className="test-fullscreen">
        <header className="test-head">
          <button className="icon-btn" onClick={() => router.push('/reading')} title="Back to catalog">
            <ArrowLeft size={16} />
          </button>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>
            {passage.title}
          </div>
          <span className="cd-badge cd-badge-primary">{testMode === 'simulation' ? 'Simulation' : 'Practice'}</span>
          {result.timed_out && <span className="cd-badge cd-badge-warn">Timed out</span>}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="cd-btn" onClick={() => { setResult(null); setAnswers({}); setStartTime(Date.now()); }}>
              <RotateCcw size={14} /> Retry
            </button>
            <button className="cd-btn cd-btn-primary" onClick={() => router.push('/reading')}>
              Back to catalog
            </button>
          </div>
        </header>

        <div className="test-body">
          <div className="test-passage">
            {isPdf ? (
              <iframe src={`${pdfSrc}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} style={{ width: '100%', height: '100%', border: 0, background: 'var(--bg-raised)' }} title={passage.title} />
            ) : (
              <div className="passage-body" dangerouslySetInnerHTML={{ __html: passage.body?.replace(/\n/g, '<br/>') || '' }} />
            )}
          </div>

          <div className="test-questions">
            <div className="eyebrow">Your result</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--ff-display)', fontSize: 56, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)' }}>
                {result.score_pct?.toFixed(0)}
              </span>
              <span className="mono" style={{ fontSize: 14, color: 'var(--ink-3)' }}>%</span>
              <span className="italic-serif" style={{ fontSize: 13, color: 'var(--ink-3)', marginLeft: 8 }}>
                {result.correct_count} of {result.total_questions} correct
              </span>
            </div>

            <div className="hr" />

            <button className="cd-btn cd-btn-ghost cd-btn-sm" onClick={() => setShowResultDetail(v => !v)}>
              {showResultDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showResultDetail ? 'Hide details' : 'Show details'}
            </button>

            {showResultDetail && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {result.details?.map((d: any, idx: number) => (
                  <div
                    key={d.question_id}
                    className="card card-tight"
                    style={{
                      borderLeft: `3px solid ${d.correct ? 'var(--success)' : 'var(--danger)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {d.correct
                        ? <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                        : <XCircle size={15} style={{ color: 'var(--danger)' }} />}
                      <strong style={{ fontSize: 13 }}>Q{idx + 1}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                      <p style={{ margin: '2px 0' }}>
                        Your answer:{' '}
                        <span style={{ color: d.correct ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                          {d.your_answer || '(blank)'}
                        </span>
                      </p>
                      {!d.correct && (
                        <p style={{ margin: '2px 0' }}>
                          Correct: <strong>{typeof d.correct_answer === 'object' ? JSON.stringify(d.correct_answer) : d.correct_answer}</strong>
                        </p>
                      )}
                      {d.explanation && (
                        <p className="italic-serif" style={{ margin: '6px 0 0', color: 'var(--ink-3)', fontSize: 12 }}>
                          {d.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="test-footer">
          <div className="q-pal">
            {questions.map((q: any, idx: number) => {
              const detail = result.details?.find((d: any) => d.question_id === q.id);
              const cls = detail?.correct ? 'is-answered' : '';
              return (
                <button
                  key={q.id}
                  className={`q-pal-cell ${cls}`}
                  onClick={() => scrollToQuestion(q.id)}
                  title={`Q${idx + 1}${detail ? (detail.correct ? ' · correct' : ' · wrong') : ''}`}
                  style={!detail?.correct && detail ? { borderColor: 'var(--danger)', color: 'var(--danger)' } : undefined}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    );
  }

  /* ─────────── Test-taking view ─────────── */
  return (
    <div className="test-fullscreen">
      <header className="test-head">
        <button className="icon-btn" onClick={() => router.back()} title="Exit">
          <ArrowLeft size={16} />
        </button>
        <div style={{ fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>
          {passage.title}
        </div>
        <span className={`cd-badge ${testMode === 'simulation' ? 'cd-badge-warn' : 'cd-badge-primary'}`}>
          {testMode === 'simulation' ? 'Simulation' : 'Practice'}
        </span>

        <label
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginLeft: 16, cursor: 'pointer',
            fontSize: 12, color: 'var(--ink-3)',
          }}
        >
          <input
            type="checkbox"
            checked={highlightEnabled}
            onChange={e => setHighlightEnabled(e.target.checked)}
            style={{ accentColor: 'var(--primary)' }}
          />
          <Highlighter size={13} />
          Highlight
        </label>

        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 12 }}>
          {answeredCount}/{questions.length} answered
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {testMode === 'simulation' && (
            <div
              className="mono"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 999,
                background: isTimerDanger ? 'var(--danger-soft)' : 'var(--primary-soft)',
                color: isTimerDanger ? 'var(--danger)' : 'var(--primary)',
                fontWeight: 500, fontSize: 12,
              }}
            >
              <Clock size={13} />
              {formatTime(timeLeft)}
            </div>
          )}
          <button
            className="cd-btn cd-btn-primary"
            onClick={() => handleSubmit(false)}
            disabled={submitMut.isPending || !isReadyToSubmit}
          >
            <Send size={13} />
            {submitMut.isPending ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </header>

      <div className="test-body">
        <div className="test-passage" style={{ userSelect: highlightEnabled ? 'text' : 'auto' }}>
          {isPdf ? (
            <iframe src={`${pdfSrc}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} style={{ width: '100%', height: '100%', border: 0, background: 'var(--bg-raised)' }} title={passage.title} />
          ) : (
            <div className="passage-body" dangerouslySetInnerHTML={{ __html: passage.body?.replace(/\n/g, '<br/>') || '' }} />
          )}
        </div>

        <div className="test-questions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {questions.map((q: any, idx: number) => {
              const { instruction, body } = extractGroupInstruction(q.prompt);
              return (
              <div
                key={q.id}
                ref={el => { questionRefs.current[q.id] = el; }}
                onFocus={() => setCurrentQid(q.id)}
                style={{ scrollMarginTop: 16 }}
              >
                {instruction && (
                  <div
                    style={{
                      borderLeft: '3px solid var(--primary)',
                      paddingLeft: 12,
                      margin: idx > 0 ? '20px 0 12px' : '0 0 12px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontStyle: 'italic',
                      color: 'var(--ink-2)',
                      lineHeight: 1.5,
                    }}
                    dangerouslySetInnerHTML={{ __html: instruction }}
                  />
                )}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span className="mono" style={{ color: 'var(--ink-4)', fontSize: 12, minWidth: 24 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>
                    <span dangerouslySetInnerHTML={{ __html: body }} />
                  </p>
                </div>

                {q.options?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 32 }}>
                    {q.options.map((opt: string, oi: number) => {
                      const selected = answers[q.id] === opt;
                      return (
                        <label
                          key={oi}
                          className={`mcq-option ${selected ? 'is-selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={selected}
                            onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                            style={{ display: 'none' }}
                          />
                          <span className="mcq-option-marker">{String.fromCharCode(65 + oi)}</span>
                          <span className="mcq-option-text">{stripOptionPrefix(opt)}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="cd-input"
                    style={{ marginLeft: 32, width: 'calc(100% - 32px)' }}
                    value={answers[q.id] || ''}
                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                    placeholder="Your answer…"
                  />
                )}
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="test-footer">
        <span className="section-label" style={{ marginRight: 12 }}>Questions</span>
        <div className="q-pal">
          {questions.map((q: any, idx: number) => {
            const answered = !!answers[q.id]?.trim();
            const current = currentQid === q.id;
            return (
              <button
                key={q.id}
                className={`q-pal-cell ${answered ? 'is-answered' : ''} ${current ? 'is-current' : ''}`}
                onClick={() => scrollToQuestion(q.id)}
                title={`Q${idx + 1}${answered ? ' · answered' : ''}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
