export type IeltsQuestionType =
  | 'mcq'
  | 'true_false_notgiven'
  | 'yes_no_notgiven'
  | 'matching_headings'
  | 'matching_information'
  | 'matching_features'
  | 'matching_sentence_endings'
  | 'sentence_completion'
  | 'summary_completion'
  | 'table_completion'
  | 'flowchart_completion'
  | 'diagram_label_completion'
  | 'short';

export interface ParsedQuestion {
  type: IeltsQuestionType;
  group_id: string;
  group_instruction: string;
  number: number;
  stem: string;
  options?: string[];
  correct_answer?: string;
  blank_refs?: string[];
}

export interface ParsedParagraph {
  label: string | null;
  offset: number;
  html: string;
}

export interface ParsedPassage {
  title: string;
  body_html: string;
  paragraphs: ParsedParagraph[];
  suggested_level?: string;
  suggested_tags?: string[];
  /** Backend-relative URL like /uploads/parsed/xxx.pdf. If set, render via iframe. */
  source_pdf_url?: string;
}

export interface HybridParseResult {
  parser_used: 'mammoth' | 'gemini';
  confidence: number;
  warnings: string[];
  passage: ParsedPassage;
  questions: ParsedQuestion[];
  parse_duration_ms: number;
}

export interface ParsedQuestionGroup {
  group_id: string;
  type: IeltsQuestionType;
  instruction: string;
  questions: ParsedQuestion[];
}

export function groupQuestions(questions: ParsedQuestion[]): ParsedQuestionGroup[] {
  const map = new Map<string, ParsedQuestionGroup>();
  for (const q of questions) {
    const existing = map.get(q.group_id);
    if (existing) {
      existing.questions.push(q);
    } else {
      map.set(q.group_id, {
        group_id: q.group_id,
        type: q.type,
        instruction: q.group_instruction,
        questions: [q],
      });
    }
  }
  return Array.from(map.values()).map((g) => ({
    ...g,
    questions: [...g.questions].sort((a, b) => a.number - b.number),
  }));
}
