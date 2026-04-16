import { Injectable, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';
import sanitizeHtml from 'sanitize-html';
import {
  buildPassage,
  computeConfidence,
  detectExpectedQuestionCount,
  extractAnswerKey,
  extractSections,
  parseQuestions,
} from './ielts-post-processor';
import { HybridParseResult } from './hybrid-parser.types';

/** Loose sanitize: preserve Mammoth's layout faithfully. Source is a trusted
 *  admin/instructor DOCX, so we only strip scripts/iframes/forms. */
const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'blockquote',
    'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'small',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'col', 'colgroup',
    'span', 'div', 'sup', 'sub', 'a',
    'figure', 'figcaption',
  ],
  allowedAttributes: {
    '*': ['class', 'style', 'data-label', 'data-blank-id', 'id'],
    a: ['href', 'target', 'rel', 'class', 'style'],
    td: ['colspan', 'rowspan', 'class', 'style'],
    th: ['colspan', 'rowspan', 'class', 'style'],
    table: ['class', 'style', 'border', 'cellspacing', 'cellpadding'],
    col: ['span', 'width', 'style'],
    colgroup: ['span', 'width', 'style'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/.*/],
      'font-weight': [/.*/],
      'font-style': [/.*/],
      'text-decoration': [/.*/],
      'color': [/.*/],
      'background-color': [/.*/],
      'width': [/.*/],
      'padding': [/.*/],
      'padding-left': [/.*/],
      'margin': [/.*/],
      'border': [/.*/],
      'border-collapse': [/.*/],
    },
  },
};

@Injectable()
export class MammothParserService {
  private readonly logger = new Logger(MammothParserService.name);

  async parse(buffer: Buffer): Promise<HybridParseResult> {
    const started = Date.now();
    const warnings: string[] = [];

    const result = await mammoth.convertToHtml(
      { buffer },
      {
        convertImage: mammoth.images.imgElement(() => Promise.resolve({ src: '' })),
      },
    );
    const mammothMessages = result.messages.filter(
      (msg) => msg.type === 'warning' && !/paragraph style/i.test(msg.message),
    );
    if (mammothMessages.length > 0) {
      warnings.push(`mammoth: ${mammothMessages.length} structural warnings`);
    }

    const html = result.value.replaceAll(/<img[^>]*>/gi, '');

    const sections = extractSections(html);
    if (sections.length === 0) {
      throw new Error('No reading passage detected in document');
    }
    const first = sections[0];
    const answers = extractAnswerKey(first.answerKeyHtml || html);
    const passage = buildPassage(first.passageHtml);
    const expected = detectExpectedQuestionCount(first.passageHtml, first.questionsHtml);
    const questions = parseQuestions(first.questionsHtml, answers, warnings);

    passage.body_html = sanitizeHtml(passage.body_html, SANITIZE_OPTS);

    const confidence = computeConfidence({
      passage,
      questions,
      expectedQuestionCount: expected,
      warnings,
    });

    const duration = Date.now() - started;
    this.logger.log(
      `Mammoth parse: sections=${sections.length} questions=${questions.length}/${expected} confidence=${confidence.toFixed(2)} duration=${duration}ms`,
    );

    return {
      parser_used: 'mammoth',
      confidence,
      warnings,
      passage,
      questions,
      parse_duration_ms: duration,
    };
  }
}
