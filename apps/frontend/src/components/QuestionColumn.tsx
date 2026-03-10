import React from 'react';

interface QuestionItem {
  type: 'instruction' | 'question';
  number?: number;
  html: string;
  text: string;
}

interface QuestionColumnProps {
  questions: QuestionItem[];
  selected: number;
}

const QuestionColumn: React.FC<QuestionColumnProps> = ({ questions, selected }) => {
  return (
    <div style={{ padding: '32px', color: '#e4e7ec' }}>
      {questions.map((item, idx) => {
        const isActive = idx === selected;
        return (
          <section
            key={`${item.number ?? 'instr'}-${idx}`}
            style={{
              marginBottom: '24px',
              padding: '18px',
              borderRadius: '16px',
              border: isActive ? '1px solid #5b8def' : '1px solid rgba(255,255,255,0.08)',
              background: isActive ? 'rgba(91, 141, 239, 0.08)' : 'rgba(8, 13, 23, 0.4)',
              boxShadow: isActive ? '0 10px 40px rgba(2,12,33,0.35)' : 'none',
            }}
          >
            {item.number && (
              <p style={{
                fontSize: '0.85rem',
                letterSpacing: '0.18em',
                color: '#a5b4fc',
                marginBottom: '8px',
              }}>
                QUESTION {item.number}
              </p>
            )}
            <div dangerouslySetInnerHTML={{ __html: item.html }} />
          </section>
        );
      })}
    </div>
  );
};

export default QuestionColumn;
