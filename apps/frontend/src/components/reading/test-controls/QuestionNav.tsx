'use client';

export type Section = {
  key: string;
  label: string;
  questionIds: string[];
  startIndex: number;
};

interface Props {
  sections: Section[];
  answers: Record<string, string>;
  currentQid: string | null;
  activePart: number;
  onActivePartChange: (idx: number) => void;
  onJump: (qId: string) => void;
  sectionLabel?: string;
}

export default function QuestionNav({
  sections, answers, currentQid, activePart, onActivePartChange, onJump, sectionLabel,
}: Props) {
  return (
    <div className="q-nav">
      {sections.map((s, sIdx) => {
        const answeredCount = s.questionIds.filter(id => answers[id]?.trim()).length;
        const isActive = sIdx === activePart;
        const label = sectionLabel ? `${sectionLabel} ${sIdx + 1}` : s.label;
        const handleSelect = () => { if (!isActive) onActivePartChange(sIdx); };
        return (
          <div
            key={s.key}
            className={`q-nav-section ${isActive ? 'is-active' : ''}`}
            onClick={handleSelect}
            role={isActive ? undefined : 'button'}
            tabIndex={isActive ? -1 : 0}
            onKeyDown={(e) => {
              if (!isActive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleSelect();
              }
            }}
          >
            {isActive ? (
              <>
                <span className="q-nav-section-label">{label}</span>
                <div className="q-nav-cells">
                  {s.questionIds.map((qid, qIdx) => {
                    const answered = !!answers[qid]?.trim();
                    const current = currentQid === qid;
                    const num = s.startIndex + qIdx + 1;
                    return (
                      <button
                        key={qid}
                        type="button"
                        className={`q-pal-cell ${answered ? 'is-answered' : ''} ${current ? 'is-current' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onJump(qid); }}
                        title={`Q${num}${answered ? ' · answered' : ''}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <span className="q-nav-section-label">
                <strong>{label}</strong> : {answeredCount} of {s.questionIds.length} questions
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
