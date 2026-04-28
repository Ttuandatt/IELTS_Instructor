'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Section } from './QuestionNav';

interface Props {
  open: boolean;
  title: string;
  message: string;
  sectionLabel: string;
  noAnswerLabel: string;
  closeLabel: string;
  submitLabel: string;
  sections: Section[];
  answers: Record<string, string>;
  onClose: () => void;
  onSubmit: () => void;
  onJumpToQuestion: (qId: string) => void;
}

export default function ReviewDialog({
  open, title, message, sectionLabel, noAnswerLabel, closeLabel, submitLabel,
  sections, answers, onClose, onSubmit, onJumpToQuestion,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cd-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cd-modal cd-modal--lg" onClick={e => e.stopPropagation()}>
        <div className="cd-modal-header">
          <h3 className="cd-modal-title">{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="cd-modal-body">
          <p className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 0 }}>
            {message}
          </p>
          {sections.map((s, sIdx) => (
            <div key={s.key} className="review-section">
              <div className="review-section-title">{sectionLabel} {sIdx + 1}</div>
              {s.questionIds.map((qid, qIdx) => {
                const ans = answers[qid]?.trim();
                const num = s.startIndex + qIdx + 1;
                return (
                  <div
                    key={qid}
                    className="review-row"
                    onClick={() => {
                      onJumpToQuestion(qid);
                      onClose();
                    }}
                  >
                    <span className="review-row-num">Q{num}</span>
                    <span className={`review-row-answer ${ans ? '' : 'review-row-answer--blank'}`}>
                      {ans || noAnswerLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cd-modal-footer">
          <button className="cd-btn cd-btn-ghost" onClick={onClose}>{closeLabel}</button>
          <button className="cd-btn cd-btn-primary" onClick={onSubmit}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}
