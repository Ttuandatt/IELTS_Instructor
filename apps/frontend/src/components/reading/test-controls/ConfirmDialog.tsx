'use client';

import { useEffect, type ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel, cancelLabel, danger, onConfirm, onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="cd-modal-backdrop"
      onClick={cancelLabel && onCancel ? onCancel : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div className="cd-modal" onClick={e => e.stopPropagation()}>
        <div className="cd-modal-header">
          <h3 className="cd-modal-title">{title}</h3>
        </div>
        <div className="cd-modal-body">{message}</div>
        <div className="cd-modal-footer">
          {cancelLabel && onCancel && (
            <button className="cd-btn cd-btn-ghost" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            className={`cd-btn ${danger ? '' : 'cd-btn-primary'}`}
            style={danger ? { background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' } : undefined}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
