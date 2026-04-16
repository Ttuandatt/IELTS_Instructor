import { HybridParseResult, IeltsQuestionType, ParsedQuestion } from './hybrid-parser.types';

export const MAMMOTH_CONFIDENCE_THRESHOLD = 0.6;

const LEGACY_TYPE_MAP: Record<string, IeltsQuestionType> = {
  mcq: 'mcq',
  multiple_choice: 'mcq',
  true_false_notgiven: 'true_false_notgiven',
  yes_no_notgiven: 'yes_no_notgiven',
  matching_headings: 'matching_headings',
  matching_information: 'matching_information',
  matching_features: 'matching_features',
  matching_sentence_endings: 'matching_sentence_endings',
  sentence_completion: 'sentence_completion',
  summary_completion: 'summary_completion',
  table_completion: 'table_completion',
  flowchart_completion: 'flowchart_completion',
  diagram_label_completion: 'diagram_label_completion',
  fill_in_blank: 'sentence_completion',
  short: 'short',
};

/** Adapt the legacy Gemini response { passage: string, question_groups: [...] }
 *  to the unified HybridParseResult schema. */
export function adaptLegacyGeminiResult(
  raw: unknown,
  warnings: string[],
  durationMs: number,
): HybridParseResult {
  const obj = (raw ?? {}) as { passage?: unknown; question_groups?: unknown };
  const bodyHtml = typeof obj.passage === 'string' ? obj.passage : '';
  const groups = Array.isArray(obj.question_groups) ? obj.question_groups : [];
  const questions: ParsedQuestion[] = [];
  for (const g of groups as Array<Record<string, unknown>>) {
    const rawType = typeof g.type === 'string' ? g.type : 'short';
    const type: IeltsQuestionType = LEGACY_TYPE_MAP[rawType] ?? 'short';
    const instruction = typeof g.instruction === 'string' ? g.instruction : '';
    const groupOptions = Array.isArray(g.group_options) ? (g.group_options as string[]) : undefined;
    const qs = Array.isArray(g.questions) ? (g.questions as Array<Record<string, unknown>>) : [];
    const minOrder = qs.reduce((m, q) => {
      const idx = Number(q.order_index);
      return Number.isFinite(idx) ? Math.min(m, idx) : m;
    }, Number.POSITIVE_INFINITY);
    const maxOrder = qs.reduce((m, q) => {
      const idx = Number(q.order_index);
      return Number.isFinite(idx) ? Math.max(m, idx) : m;
    }, 0);
    const groupId = `q${Number.isFinite(minOrder) ? minOrder : '?'}-${maxOrder}`;
    for (const q of qs) {
      const num = Number(q.order_index) || questions.length + 1;
      const perOpts = Array.isArray(q.options) ? (q.options as string[]) : undefined;
      const answer = q.answer_key;
      let correctAnswer: string | undefined;
      if (typeof answer === 'string') correctAnswer = answer;
      else if (Array.isArray(answer)) correctAnswer = answer.join(', ');
      questions.push({
        type,
        group_id: groupId,
        group_instruction: instruction,
        number: num,
        stem: typeof q.prompt === 'string' ? q.prompt : '',
        options: perOpts ?? groupOptions,
        correct_answer: correctAnswer,
      });
    }
  }
  return {
    parser_used: 'gemini',
    confidence: 0.8,
    warnings,
    passage: { title: '', body_html: bodyHtml, paragraphs: [] },
    questions,
    parse_duration_ms: durationMs,
  };
}
