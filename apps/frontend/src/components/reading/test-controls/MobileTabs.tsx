'use client';

export type MobileTab = 'passage' | 'questions';

interface Props {
  active: MobileTab;
  onChange: (t: MobileTab) => void;
  passageLabel: string;
  questionsLabel: string;
}

export default function MobileTabs({ active, onChange, passageLabel, questionsLabel }: Props) {
  return (
    <div className="test-mobile-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'passage'}
        className={`test-mobile-tab ${active === 'passage' ? 'is-active' : ''}`}
        onClick={() => onChange('passage')}
      >
        {passageLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'questions'}
        className={`test-mobile-tab ${active === 'questions' ? 'is-active' : ''}`}
        onClick={() => onChange('questions')}
      >
        {questionsLabel}
      </button>
    </div>
  );
}
