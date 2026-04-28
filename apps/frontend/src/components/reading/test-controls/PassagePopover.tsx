'use client';

import { Highlighter, Eraser } from 'lucide-react';

interface Props {
  x: number;
  y: number;
  onHighlight: () => void;
  onClear: () => void;
  highlightLabel: string;
  clearLabel: string;
  showClear: boolean;
}

export default function PassagePopover({
  x, y, onHighlight, onClear, highlightLabel, clearLabel, showClear,
}: Props) {
  return (
    <div
      className="passage-popover"
      style={{ top: y, left: x }}
      onMouseDown={e => e.preventDefault()}
    >
      <button type="button" onClick={onHighlight}>
        <Highlighter size={13} /> {highlightLabel}
      </button>
      {showClear && (
        <button type="button" onClick={onClear}>
          <Eraser size={13} /> {clearLabel}
        </button>
      )}
    </div>
  );
}
