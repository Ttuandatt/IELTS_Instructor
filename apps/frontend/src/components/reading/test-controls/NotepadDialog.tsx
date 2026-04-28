'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  value: string;
  placeholder?: string;
  title?: string;
  onChange: (v: string) => void;
  onClose: () => void;
}

export default function NotepadDialog({ open, value, placeholder, title, onChange, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <aside className="notepad-drawer" role="complementary" aria-label={title || 'Notepad'}>
      <div className="notepad-drawer-header">
        <span className="eyebrow">— {title || 'Notepad'}</span>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <textarea
        className="notepad-drawer-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
      />
    </aside>
  );
}
