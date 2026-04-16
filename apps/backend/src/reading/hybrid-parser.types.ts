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
  /** If set, frontend should render passage via an <iframe> instead of body_html (for PDF uploads). */
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
