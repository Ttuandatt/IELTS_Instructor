'use client';

export type TextSize = 'sm' | 'md' | 'lg';

export const TEXT_SIZE_PX: Record<TextSize, number> = { sm: 12, md: 14, lg: 16 };

interface Props {
  value: TextSize;
  onChange: (v: TextSize) => void;
  ariaLabel?: string;
}

export default function TextSizeControl({ value, onChange, ariaLabel }: Props) {
  return (
    <div className="text-size-group" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className={`text-size-btn ${value === 'sm' ? 'is-active' : ''}`}
        style={{ fontSize: 11 }}
        onClick={() => onChange('sm')}
        aria-label="Small text"
      >Aa</button>
      <button
        type="button"
        className={`text-size-btn ${value === 'md' ? 'is-active' : ''}`}
        style={{ fontSize: 13 }}
        onClick={() => onChange('md')}
        aria-label="Medium text"
      >Aa</button>
      <button
        type="button"
        className={`text-size-btn ${value === 'lg' ? 'is-active' : ''}`}
        style={{ fontSize: 15 }}
        onClick={() => onChange('lg')}
        aria-label="Large text"
      >Aa</button>
    </div>
  );
}
