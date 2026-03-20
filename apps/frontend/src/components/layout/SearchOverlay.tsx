'use client';

import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-overlay-content" onClick={e => e.stopPropagation()}>
        <div className="search-overlay-input-wrap">
          <Search size={20} className="search-overlay-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-overlay-input"
            placeholder="Search courses, lessons..."
          />
          <button className="search-overlay-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="search-overlay-hint">
          Press <kbd>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
