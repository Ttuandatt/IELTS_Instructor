'use client';

import React from 'react';
import type { ParsedQuestion, ParsedQuestionGroup } from '@/types/hybrid-parser';

interface Props {
  group: ParsedQuestionGroup;
  answers: Record<number, string>;
  onAnswer: (qNum: number, value: string) => void;
  showCorrect?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  mcq: 'Multiple Choice',
  true_false_notgiven: 'True / False / Not Given',
  yes_no_notgiven: 'Yes / No / Not Given',
  matching_headings: 'Matching Headings',
  matching_information: 'Matching Information',
  matching_features: 'Matching Features',
  matching_sentence_endings: 'Matching Sentence Endings',
  sentence_completion: 'Sentence Completion',
  summary_completion: 'Summary Completion',
  table_completion: 'Table Completion',
  flowchart_completion: 'Flow-chart Completion',
  diagram_label_completion: 'Diagram Label Completion',
  short: 'Short Answer',
};

export default function QuestionGroup({ group, answers, onAnswer, showCorrect }: Props) {
  const first = group.questions[0]?.number;
  const last = group.questions[group.questions.length - 1]?.number;
  return (
    <section className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <header className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            Questions {first}–{last}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{group.instruction}</div>
        </div>
        <span className="shrink-0 text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded uppercase tracking-wide">
          {TYPE_LABEL[group.type] ?? group.type}
        </span>
      </header>
      <div className="p-5 space-y-4">
        {group.questions.map((q) => (
          <QuestionItem
            key={q.number}
            q={q}
            value={answers[q.number] ?? ''}
            onChange={(v) => onAnswer(q.number, v)}
            showCorrect={showCorrect}
          />
        ))}
      </div>
    </section>
  );
}

function QuestionItem({
  q,
  value,
  onChange,
  showCorrect,
}: {
  q: ParsedQuestion;
  value: string;
  onChange: (v: string) => void;
  showCorrect?: boolean;
}) {
  const isCorrect = showCorrect && q.correct_answer && value.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
  const showingWrong = showCorrect && q.correct_answer && value && !isCorrect;

  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
        {q.number}
      </div>
      <div className="flex-1 min-w-0">
        {q.stem && <div className="text-sm text-gray-800 mb-2">{q.stem}</div>}
        {renderInput(q, value, onChange)}
        {showCorrect && q.correct_answer && (
          <div className={`mt-1.5 text-xs font-medium ${isCorrect ? 'text-emerald-600' : showingWrong ? 'text-red-600' : 'text-gray-500'}`}>
            Answer: <span className="font-bold">{q.correct_answer}</span>
            {showingWrong && <span className="ml-2 text-red-500">(your answer: {value})</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function renderInput(q: ParsedQuestion, value: string, onChange: (v: string) => void) {
  if (q.type === 'mcq' || q.type === 'matching_features' || q.type === 'matching_headings' || q.type === 'matching_sentence_endings' || q.type === 'matching_information') {
    const opts = q.options ?? [];
    return (
      <div className="space-y-1.5">
        {opts.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          return (
            <label
              key={idx}
              className={`flex items-start gap-2 text-sm cursor-pointer p-2 rounded-lg border ${value === letter ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <input
                type="radio"
                name={`q${q.number}`}
                value={letter}
                checked={value === letter}
                onChange={(e) => onChange(e.target.value)}
                className="mt-0.5"
              />
              <span className="text-gray-700">
                <span className="font-semibold text-gray-900 mr-1">{letter}.</span>
                {opt}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  if (q.type === 'true_false_notgiven') {
    const opts = ['TRUE', 'FALSE', 'NOT GIVEN'];
    return (
      <div className="flex flex-wrap gap-2">
        {opts.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${value === opt ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 text-gray-700 hover:border-blue-300'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (q.type === 'yes_no_notgiven') {
    const opts = ['YES', 'NO', 'NOT GIVEN'];
    return (
      <div className="flex flex-wrap gap-2">
        {opts.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${value === opt ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 text-gray-700 hover:border-emerald-300'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  // sentence_completion, summary_completion, table_completion, flowchart_completion,
  // diagram_label_completion, short → text input
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Your answer"
      className="w-full max-w-xs px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
    />
  );
}
