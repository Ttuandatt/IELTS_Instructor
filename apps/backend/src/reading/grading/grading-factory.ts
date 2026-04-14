/**
 * Factory that maps each QuestionType to the appropriate grading strategy.
 */
import type { QuestionType } from '@prisma/client';
import {
  type IGradingStrategy,
  SingleSelectStrategy,
  MatchingStrategy,
  FillInStrategy,
} from './grading-strategy.js';

const singleSelect = new SingleSelectStrategy();
const matching = new MatchingStrategy();
const fillIn = new FillInStrategy();

const STRATEGY_MAP: Record<QuestionType, IGradingStrategy> = {
  // Group 1 — Single Select
  mcq: singleSelect,
  true_false_notgiven: singleSelect,
  yes_no_notgiven: singleSelect,
  // Group 2 — Matching
  matching_headings: matching,
  matching_information: matching,
  matching_features: matching,
  matching_sentence_endings: matching,
  // Group 3 — Fill-in
  sentence_completion: fillIn,
  summary_completion: fillIn,
  table_completion: fillIn,
  flowchart_completion: fillIn,
  diagram_label_completion: fillIn,
  short: fillIn,
};

/** Return the grading strategy for the given question type. */
export function getGradingStrategy(type: QuestionType): IGradingStrategy {
  const strategy = STRATEGY_MAP[type];
  if (!strategy) {
    throw new Error(`No grading strategy for question type: ${type}`);
  }
  return strategy;
}
