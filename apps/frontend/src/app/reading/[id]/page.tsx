'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import { useAutoSave } from '@/hooks/useAutoSave';
import {
  ArrowLeft, Clock, Send, NotebookPen, Target, Eye, NotebookText, Save,
} from 'lucide-react';
import ConfirmDialog from '@/components/reading/test-controls/ConfirmDialog';
import NotepadDialog from '@/components/reading/test-controls/NotepadDialog';
import ReviewDialog from '@/components/reading/test-controls/ReviewDialog';
import TextSizeControl, { type TextSize, TEXT_SIZE_PX } from '@/components/reading/test-controls/TextSizeControl';
import MobileTabs, { type MobileTab } from '@/components/reading/test-controls/MobileTabs';
import QuestionNav, { type Section } from '@/components/reading/test-controls/QuestionNav';
import PassagePopover from '@/components/reading/test-controls/PassagePopover';

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

function findBlockAncestor(node: Node): Element | null {
  let n: Node | null = node;
  while (n) {
    if (n.nodeType === 1) {
      const display = window.getComputedStyle(n as Element).display;
      if (display === 'block' || display === 'list-item' || display === 'flex' || display === 'grid') {
        return n as Element;
      }
    }
    n = n.parentNode;
  }
  return null;
}

function isHighlightable(range: Range): boolean {
  const startBlock = findBlockAncestor(range.startContainer);
  const endBlock = findBlockAncestor(range.endContainer);
  return !!startBlock && startBlock === endBlock;
}

/** Group questions into sections by group_id; fallback to even thirds if only 1 group. */
function buildSections(questions: any[]): Section[] {
  if (!questions.length) return [];
  const distinctGroups = new Set(questions.map(q => q.group_id ?? '__default__'));
  if (distinctGroups.size > 1) {
    const map = new Map<string, string[]>();
    const order: string[] = [];
    for (const q of questions) {
      const key = q.group_id ?? '__default__';
      if (!map.has(key)) { map.set(key, []); order.push(key); }
      map.get(key)!.push(q.id);
    }
    let cumulative = 0;
    return order.map((key, i) => {
      const ids = map.get(key)!;
      const section: Section = {
        key,
        label: `Section ${i + 1}`,
        questionIds: ids,
        startIndex: cumulative,
      };
      cumulative += ids.length;
      return section;
    });
  }
  // Fallback: split into thirds
  const ids = questions.map(q => q.id);
  const partSize = Math.ceil(ids.length / 3);
  const sections: Section[] = [];
  let cumulative = 0;
  for (let i = 0; i < 3; i++) {
    const slice = ids.slice(i * partSize, (i + 1) * partSize);
    if (!slice.length) break;
    sections.push({
      key: `part-${i + 1}`,
      label: `Part ${i + 1}`,
      questionIds: slice,
      startIndex: cumulative,
    });
    cumulative += slice.length;
  }
  return sections;
}

export default function ReadingPracticePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [showModeModal, setShowModeModal] = useState(true);
  const [testMode, setTestMode] = useState<'practice' | 'simulation' | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(SIM_DURATION);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [currentQid, setCurrentQid] = useState<string | null>(null);

  // Top bar features
  const [textSize, setTextSize] = useState<TextSize>('md');
  const [notepadOpen, setNotepadOpen] = useState(false);
  const [notepadText, setNotepadText] = useState('');

  // Dialogs
  const [reviewOpen, setReviewOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [timeUpOpen, setTimeUpOpen] = useState(false);

  // Mobile
  const [mobileTab, setMobileTab] = useState<MobileTab>('questions');

  // Active part (section) — drives bottom nav + question filter
  const [activePart, setActivePart] = useState(0);
  const questionsPanelRef = useRef<HTMLDivElement | null>(null);

  // Highlight popover
  const [popover, setPopover] = useState<{ x: number; y: number; showClear: boolean } | null>(null);
  const passageScrollRef = useRef<HTMLDivElement | null>(null);

  // Autosave: answers
  const { restored: restoredAnswers, clear: clearSavedAnswers } = useAutoSave(
    `reading-answers-${id}`,
    answers,
  );
  // Autosave: notepad
  const { restored: restoredNotepad, clear: clearSavedNotepad } = useAutoSave(
    `reading-notepad-${id}`,
    notepadText,
  );

  useEffect(() => { if (restoredAnswers) setAnswers(restoredAnswers); }, [restoredAnswers]);
  useEffect(() => { if (typeof restoredNotepad === 'string') setNotepadText(restoredNotepad); }, [restoredNotepad]);

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: passage, isLoading } = useQuery({
    queryKey: ['reading-passage', id],
    queryFn: () => apiClient.get(`/reading/passages/${id}`).then(r => r.data),
  });

  const submitMut = useMutation({
    mutationFn: (body: any) => apiClient.post(`/reading/passages/${id}/submit`, body).then(r => r.data),
    onSuccess: (data) => {
      clearSavedAnswers();
      clearSavedNotepad();
      setNotepadText('');
      setSubmitConfirmOpen(false);
      setTimeUpOpen(false);
      setReviewOpen(false);
      // Persist result + render context for /reading/attempts/[id]
      try {
        const payload = {
          ...data,
          passage_title: passage?.title,
          questions_meta: (passage?.questions ?? []).map((q: any, idx: number) => ({
            id: q.id,
            type: q.type,
            prompt: q.prompt,
            options: q.options,
            order: idx + 1,
          })),
          completed_at: new Date().toISOString(),
        };
        sessionStorage.setItem(`reading-result-${data.submission_id}`, JSON.stringify(payload));
      } catch {
        // ignore quota / serialization errors — page handles missing data
      }
      router.push(`/reading/attempts/${data.submission_id}`);
    },
  });

  const handleSubmit = useCallback((isAutoSubmit = false) => {
    if (!startTime || !testMode) return;
    const duration_sec = Math.round((Date.now() - startTime) / 1000);
    const answerList = Object.entries(answers).map(([question_id, value]) => ({ question_id, value: String(value) }));
    submitMut.mutate({ answers: answerList, duration_sec, test_mode: testMode, timed_out: isAutoSubmit });
  }, [startTime, testMode, answers, submitMut]);

  const handleModeSelect = (mode: 'practice' | 'simulation') => {
    setTestMode(mode);
    setStartTime(Date.now());
    setShowModeModal(false);
  };

  // Timer ticker — both modes
  useEffect(() => {
    if (!startTime || submitMut.isPending) return;
    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setElapsedSec(elapsed);
      if (testMode === 'simulation') {
        const remaining = Math.max(0, SIM_DURATION - elapsed);
        setTimeLeft(remaining);
        if (remaining === 0) {
          clearInterval(interval);
          setTimeUpOpen(true);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [testMode, startTime, submitMut.isPending]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const scrollToQuestion = useCallback((qId: string) => {
    questionRefs.current[qId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setCurrentQid(qId);
    setMobileTab('questions');
  }, []);

  // Reset questions panel scroll when switching active part
  useEffect(() => {
    questionsPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePart]);

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(`reading-answers-${id}`, JSON.stringify(answers));
      localStorage.setItem(`reading-notepad-${id}`, JSON.stringify(notepadText));
      toast.success(t.test.draft_saved);
    } catch {
      toast.error('Save failed');
    }
  };

  // Highlight: handle text selection in passage
  const onPassageMouseUp = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || !sel) {
      setPopover(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = passageScrollRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    const scrollTop = passageScrollRef.current?.scrollTop ?? 0;
    const scrollLeft = passageScrollRef.current?.scrollLeft ?? 0;
    setPopover({
      x: rect.left - containerRect.left + scrollLeft + rect.width / 2 - 80,
      y: rect.top - containerRect.top + scrollTop - 40,
      showClear: !!(range.startContainer.parentElement?.closest('.user-highlight')
                 || range.endContainer.parentElement?.closest('.user-highlight')),
    });
  }, []);

  const applyHighlight = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!isHighlightable(range)) {
      toast.error(t.test.highlight_single_block);
      sel.removeAllRanges();
      setPopover(null);
      return;
    }
    const mark = document.createElement('mark');
    mark.className = 'user-highlight';
    mark.dataset.id = `${Date.now()}`;
    try {
      range.surroundContents(mark);
    } catch {
      // Same-block selection but spanning inline elements: extract + wrap
      const contents = range.extractContents();
      mark.appendChild(contents);
      range.insertNode(mark);
    }
    sel.removeAllRanges();
    setPopover(null);
  }, [t.test.highlight_single_block]);

  const clearHighlight = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { setPopover(null); return; }
    const range = sel.getRangeAt(0);
    const node = range.startContainer.parentElement?.closest('.user-highlight') as HTMLElement | null;
    if (node && node.parentNode) {
      const parent = node.parentNode;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
    }
    sel.removeAllRanges();
    setPopover(null);
  }, []);

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
  const sections = buildSections(questions);
  const isTimerDanger = testMode === 'simulation' && timeLeft < 300;
  const isPdf = passage.body?.includes('data-source-pdf');
  const pdfSrc = isPdf ? `${BACKEND_ORIGIN}${passage.body.match(/data-source-pdf="([^"]+)"/)?.[1] || ''}` : '';
  const passageFontPx = TEXT_SIZE_PX[textSize];
  const sectionLabel = sections[0]?.label?.startsWith('Part') ? 'Part' : t.test.section;

  /* ─────────── Test-taking view ─────────── */
  const timerDisplay = testMode === 'simulation' ? formatTime(timeLeft) : formatTime(elapsedSec);

  return (
    <div className="test-fullscreen">
      <header className="test-head">
        <button className="icon-btn" onClick={() => setExitConfirmOpen(true)} title="Exit">
          <ArrowLeft size={16} />
        </button>
        <div style={{ fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>
          {passage.title}
        </div>
        <span className={`cd-badge ${testMode === 'simulation' ? 'cd-badge-warn' : 'cd-badge-primary'}`}>
          {testMode === 'simulation' ? 'Simulation' : 'Practice'}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TextSizeControl value={textSize} onChange={setTextSize} ariaLabel={t.test.text_size} />

          <button
            className="cd-btn cd-btn-sm"
            onClick={() => setNotepadOpen(true)}
            title={t.test.notepad}
          >
            <NotebookText size={13} /> {t.test.notepad}
          </button>

          <button
            className="cd-btn cd-btn-sm"
            onClick={handleSaveDraft}
            title={t.test.save_draft}
          >
            <Save size={13} /> {t.test.save_draft}
          </button>

          <div
            className="mono"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 999,
              background: testMode === 'simulation'
                ? (isTimerDanger ? 'var(--danger-soft)' : 'var(--primary-soft)')
                : 'transparent',
              color: testMode === 'simulation'
                ? (isTimerDanger ? 'var(--danger)' : 'var(--primary)')
                : 'var(--ink-2)',
              fontWeight: 500, fontSize: 12,
            }}
          >
            <Clock size={13} />
            {timerDisplay}
          </div>

          <button
            className="cd-btn cd-btn-sm"
            onClick={() => setReviewOpen(true)}
            title={t.test.review}
          >
            <Eye size={13} /> {t.test.review}
          </button>

          <button
            className="cd-btn cd-btn-primary"
            onClick={() => setSubmitConfirmOpen(true)}
            disabled={submitMut.isPending}
          >
            <Send size={13} />
            {submitMut.isPending ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </header>

      <MobileTabs
        active={mobileTab}
        onChange={setMobileTab}
        passageLabel={t.test.passage_tab}
        questionsLabel={t.test.questions_tab}
      />

      <div className="test-body">
        <div
          className={`test-passage ${mobileTab === 'passage' ? 'is-mobile-active' : ''}`}
          ref={passageScrollRef}
          onMouseUp={!isPdf ? onPassageMouseUp : undefined}
          style={{ position: 'relative' }}
        >
          {isPdf ? (
            <iframe src={`${pdfSrc}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} style={{ width: '100%', height: '100%', border: 0, background: 'var(--bg-raised)' }} title={passage.title} />
          ) : (
            <div
              className="passage-body"
              style={{ fontSize: passageFontPx }}
              dangerouslySetInnerHTML={{ __html: passage.body?.replace(/\n/g, '<br/>') || '' }}
            />
          )}
          {popover && !isPdf && (
            <PassagePopover
              x={popover.x}
              y={popover.y}
              onHighlight={applyHighlight}
              onClear={clearHighlight}
              highlightLabel={t.test.highlight}
              clearLabel={t.test.clear}
              showClear={popover.showClear}
            />
          )}
        </div>

        <div
          className={`test-questions ${mobileTab === 'questions' ? 'is-mobile-active' : ''}`}
          ref={questionsPanelRef}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {(() => {
              const activeIds = new Set(sections[activePart]?.questionIds ?? []);
              const filtered = sections[activePart]
                ? questions.filter((q: any) => activeIds.has(q.id))
                : questions;
              return filtered.map((q: any) => {
              const globalIdx = questions.findIndex((qq: any) => qq.id === q.id);
              const idx = globalIdx >= 0 ? globalIdx : 0;
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
              });
            })()}
          </div>
        </div>
      </div>

      <footer className="test-footer">
        <QuestionNav
          sections={sections}
          answers={answers}
          currentQid={currentQid}
          activePart={activePart}
          onActivePartChange={setActivePart}
          onJump={scrollToQuestion}
          sectionLabel={sectionLabel}
        />
      </footer>

      {/* Notepad drawer */}
      <NotepadDialog
        open={notepadOpen}
        value={notepadText}
        placeholder={t.test.notepad_placeholder}
        title={t.test.notepad}
        onChange={setNotepadText}
        onClose={() => setNotepadOpen(false)}
      />

      {/* Review dialog */}
      <ReviewDialog
        open={reviewOpen}
        title={t.test.review_title}
        message={t.test.review_msg}
        sectionLabel={sectionLabel}
        noAnswerLabel={t.test.no_answer}
        closeLabel={t.test.close}
        submitLabel={t.test.submit_confirm_yes}
        sections={sections}
        answers={answers}
        onClose={() => setReviewOpen(false)}
        onSubmit={() => { setReviewOpen(false); setSubmitConfirmOpen(true); }}
        onJumpToQuestion={scrollToQuestion}
      />

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={exitConfirmOpen}
        title={t.test.exit_confirm_title}
        message={t.test.exit_confirm_msg}
        confirmLabel={t.test.exit_confirm_yes}
        cancelLabel={t.common.cancel}
        danger
        onConfirm={() => { setExitConfirmOpen(false); router.back(); }}
        onCancel={() => setExitConfirmOpen(false)}
      />

      <ConfirmDialog
        open={submitConfirmOpen}
        title={t.test.submit_confirm_title}
        message={t.test.submit_confirm_msg}
        confirmLabel={t.test.submit_confirm_yes}
        cancelLabel={t.common.cancel}
        onConfirm={() => handleSubmit(false)}
        onCancel={() => setSubmitConfirmOpen(false)}
      />

      <ConfirmDialog
        open={timeUpOpen}
        title={t.test.time_up_title}
        message={t.test.time_up_msg}
        confirmLabel={t.test.time_up_yes}
        onConfirm={() => handleSubmit(true)}
      />
    </div>
  );
}
