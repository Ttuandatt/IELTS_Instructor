'use client';

import React, { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { groupQuestions, type HybridParseResult } from '@/types/hybrid-parser';
import PassageViewer from './PassageViewer';
import QuestionGroup from './QuestionGroup';

interface Props {
  data: HybridParseResult;
  initialAnswers?: Record<number, string>;
  initialBlanks?: Record<string, string>;
  onSubmit?: (answers: Record<number, string>, blanks: Record<string, string>) => void;
  /** If true, shows the correct answers beneath each question. */
  reviewMode?: boolean;
  /** Optional header label (e.g. "Preview" vs "Practice test"). */
  titleOverride?: string;
}

export default function TestRunner({ data, initialAnswers, initialBlanks, onSubmit, reviewMode, titleOverride }: Props) {
  const groups = useMemo(() => groupQuestions(data.questions), [data.questions]);
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers ?? {});
  const [blanks, setBlanks] = useState<Record<string, string>>(initialBlanks ?? {});
  const [showResults, setShowResults] = useState(Boolean(reviewMode));

  const totalAnswered = Object.values(answers).filter(Boolean).length + Object.values(blanks).filter(Boolean).length;
  const totalQuestions = data.questions.length;
  const canSubmit = totalAnswered >= Math.ceil(totalQuestions * 0.8);

  const handleSubmit = () => {
    setShowResults(true);
    onSubmit?.(answers, blanks);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {(titleOverride || data.passage.title) && (
        <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-base font-bold text-gray-900">{titleOverride ?? data.passage.title}</h1>
            <div className="text-xs text-gray-500 mt-0.5">
              {totalQuestions} questions · parser: {data.parser_used} · confidence {(data.confidence * 100).toFixed(0)}%
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">{totalAnswered}/{totalQuestions} answered</span>
            {!reviewMode && (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${canSubmit ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {showResults ? 'Resubmit' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      )}

      {data.warnings.length > 0 && (
        <div className="px-5 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-800">
          <strong>Parser warnings:</strong> {data.warnings.join('; ')}
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className={`lg:w-1/2 border-r border-gray-200 bg-white flex flex-col ${data.passage.source_pdf_url ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className={`${data.passage.source_pdf_url ? 'p-4 flex-1 flex flex-col min-h-0' : 'p-6'}`}>
            <PassageViewer
              passage={data.passage}
              answers={blanks}
              onBlankChange={(id, v) => setBlanks((prev) => ({ ...prev, [id]: v }))}
              readOnly={showResults}
            />
          </div>
        </div>

        <div className="lg:w-1/2 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {groups.length === 0 ? (
              <div className="bg-white border border-amber-200 rounded-xl p-6 text-center">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">No questions parsed</h3>
                <p className="text-sm text-gray-600 mb-3">
                  The parser couldn&apos;t detect any questions in this file. This usually means the
                  question format isn&apos;t recognized, or the file only contains the passage.
                </p>
                <p className="text-xs text-gray-500">
                  Parser: <span className="font-semibold uppercase">{data.parser_used}</span>
                  {' · '}Confidence {(data.confidence * 100).toFixed(0)}%
                </p>
              </div>
            ) : (
              groups.map((g) => (
                <QuestionGroup
                  key={g.group_id}
                  group={g}
                  answers={answers}
                  onAnswer={(n, v) => setAnswers((prev) => ({ ...prev, [n]: v }))}
                  showCorrect={showResults}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
