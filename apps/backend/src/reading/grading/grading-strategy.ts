/**
 * Grading strategies for IELTS Reading question types.
 *
 * Three concrete strategies cover all 13 QuestionType values:
 *   1. SingleSelectStrategy — mcq, true_false_notgiven, yes_no_notgiven
 *   2. MatchingStrategy     — matching_headings/information/features/sentence_endings
 *   3. FillInStrategy       — sentence/summary/table/flowchart/diagram_label completion, short
 */

/** Result returned by every grading strategy. */
export interface GradingResult {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: unknown;
  explanation: string | null;
}

/** Common interface every strategy must implement. */
export interface IGradingStrategy {
  grade(userAnswer: string, answerKey: unknown): GradingResult;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Trim + lowercase */
function normalizeBasic(s: string): string {
  return s.trim().toLowerCase();
}

/** Trim + lowercase + collapse whitespace */
function normalizeFillIn(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Canonical aliases for True/False/Not Given answers. */
const TF_NG_ALIASES: Record<string, string> = {
  t: 'true',
  true: 'true',
  f: 'false',
  false: 'false',
  ng: 'not given',
  'not given': 'not given',
  notgiven: 'not given',
};

/** Canonical aliases for Yes/No/Not Given answers. */
const YN_NG_ALIASES: Record<string, string> = {
  y: 'yes',
  yes: 'yes',
  n: 'no',
  no: 'no',
  ng: 'not given',
  'not given': 'not given',
  notgiven: 'not given',
};

/**
 * Resolve T/F/NG or Y/N/NG aliases.
 * Returns the canonical form if found, otherwise the original normalised value.
 */
function resolveAlias(
  value: string,
  aliases: Record<string, string>,
): string {
  const n = normalizeBasic(value);
  return aliases[n] ?? n;
}

/* ------------------------------------------------------------------ */
/*  Strategy 1 — Single Select (mcq, T/F/NG, Y/N/NG)                 */
/* ------------------------------------------------------------------ */

export class SingleSelectStrategy implements IGradingStrategy {
  grade(userAnswer: string, answerKey: unknown): GradingResult {
    const key = String(answerKey ?? '');

    // Detect T/F/NG or Y/N/NG by checking the answer key
    const keyNorm = normalizeBasic(key);
    let userNorm: string;
    let correctNorm: string;

    if (TF_NG_ALIASES[keyNorm] !== undefined) {
      userNorm = resolveAlias(userAnswer, TF_NG_ALIASES);
      correctNorm = TF_NG_ALIASES[keyNorm];
    } else if (YN_NG_ALIASES[keyNorm] !== undefined) {
      userNorm = resolveAlias(userAnswer, YN_NG_ALIASES);
      correctNorm = YN_NG_ALIASES[keyNorm];
    } else {
      // Plain MCQ — straight case-insensitive compare
      userNorm = normalizeBasic(userAnswer);
      correctNorm = keyNorm;
    }

    return {
      isCorrect: userNorm === correctNorm,
      userAnswer,
      correctAnswer: answerKey,
      explanation: null,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Strategy 2 — Matching                                             */
/* ------------------------------------------------------------------ */

export class MatchingStrategy implements IGradingStrategy {
  grade(userAnswer: string, answerKey: unknown): GradingResult {
    const key = String(answerKey ?? '');
    const isCorrect = normalizeBasic(userAnswer) === normalizeBasic(key);
    return {
      isCorrect,
      userAnswer,
      correctAnswer: answerKey,
      explanation: null,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Strategy 3 — Fill-in                                              */
/* ------------------------------------------------------------------ */

export class FillInStrategy implements IGradingStrategy {
  grade(userAnswer: string, answerKey: unknown): GradingResult {
    const userNorm = normalizeFillIn(userAnswer);

    // Empty answer is always incorrect
    if (userNorm === '') {
      return {
        isCorrect: false,
        userAnswer,
        correctAnswer: answerKey,
        explanation: null,
      };
    }

    let isCorrect = false;

    if (Array.isArray(answerKey)) {
      // Match any acceptable alternative — exact match, NOT includes
      isCorrect = answerKey.some(
        (k: unknown) => normalizeFillIn(String(k)) === userNorm,
      );
    } else {
      // Single correct answer — exact match after normalisation
      isCorrect = normalizeFillIn(String(answerKey ?? '')) === userNorm;
    }

    return {
      isCorrect,
      userAnswer,
      correctAnswer: answerKey,
      explanation: null,
    };
  }
}
