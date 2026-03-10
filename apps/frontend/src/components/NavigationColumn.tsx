import React from 'react';

interface NavigationColumnProps {
  totalQuestions: number;
  selected: number;
  onSelect: (idx: number) => void;
}

const NavigationColumn: React.FC<NavigationColumnProps> = ({ totalQuestions, selected, onSelect }) => {
  return (
    <aside style={{ padding: '32px', background: '#050d1c', color: '#d7e3ff', minWidth: 220 }}>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '0.85rem', letterSpacing: '0.2em', color: '#7dd3fc' }}>REMAINING TIME</p>
        <p style={{ fontSize: '2rem', fontWeight: 600 }}>51:54</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isActive = idx === selected;
          return (
            <button
              key={`q-${idx}`}
              onClick={() => onSelect(idx)}
              style={{
                border: '1px solid',
                borderColor: isActive ? '#60a5fa' : 'rgba(255,255,255,0.15)',
                background: isActive ? 'rgba(96,165,250,0.15)' : 'transparent',
                color: '#fff',
                borderRadius: 12,
                fontWeight: 600,
                padding: '8px 0',
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default NavigationColumn;
