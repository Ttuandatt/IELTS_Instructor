/**
 * Answer key type definitions for IELTS Reading question types.
 *
 * Groups the 13 QuestionType values into 3 grading families based on
 * how their answer_key is structured and compared.
 */
import type { QuestionType } from '@prisma/client';

/* ------------------------------------------------------------------ */
/*  Group 1 — Single Select                                           */
/*  Types: mcq, true_false_notgiven, yes_no_notgiven                  */
/*  answer_key: string  (e.g. "B", "TRUE", "NOT GIVEN")               */
/*  Grading: case-insensitive exact match after trim                   */
/* ------------------------------------------------------------------ */

export const SINGLE_SELECT_TYPES: readonly QuestionType[] = [
  'mcq',
  'true_false_notgiven',
  'yes_no_notgiven',
] as const;

/* ------------------------------------------------------------------ */
/*  Group 2 — Matching                                                */
/*  Types: matching_headings, matching_information,                    */
/*         matching_features, matching_sentence_endings                */
/*  answer_key: string  (e.g. "C", "ii", "B")                         */
/*  Each question has one correct answer chosen from group_options.    */
/*  Grading: case-insensitive exact match after trim                   */
/*  Note: matching_headings uses Roman numerals (i, ii, iii…),         */
/*        other matching types use letters (A, B, C…)                  */
/* ------------------------------------------------------------------ */

export const MATCHING_TYPES: readonly QuestionType[] = [
  'matching_headings',
  'matching_information',
  'matching_features',
  'matching_sentence_endings',
] as const;

/* ------------------------------------------------------------------ */
/*  Group 3 — Fill-in                                                 */
/*  Types: sentence_completion, summary_completion, table_completion,  */
/*         flowchart_completion, diagram_label_completion, short        */
/*  answer_key: string | string[]                                      */
/*    - string  → exact match (case-insensitive, trimmed)              */
/*    - array   → match any element (alternative acceptable answers)   */
/*  Grading: normalize(user) === normalize(any_key)                    */
/*  normalize = trim + lowercase + collapse multiple spaces            */
/*  NEVER use includes() — "carbon" must NOT match "carbon dioxide"    */
/* ------------------------------------------------------------------ */

export const FILL_IN_TYPES: readonly QuestionType[] = [
  'sentence_completion',
  'summary_completion',
  'table_completion',
  'flowchart_completion',
  'diagram_label_completion',
  'short',
] as const;
