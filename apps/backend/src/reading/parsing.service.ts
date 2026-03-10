import { Injectable, Logger } from '@nestjs/common';
import { LlmClientService } from '../scoring/llm-client.service';
import * as mammoth from 'mammoth';

@Injectable()
export class ParsingService {
  private readonly logger = new Logger(ParsingService.name);

  constructor(private readonly llm: LlmClientService) { }

  private readonly SYSTEM_PROMPT = `You are an expert IELTS test parser. Extract the reading passage and the questions from the provided document, and output strictly valid JSON.

The JSON format must be EXACTLY:
{
  "passage": "Clean HTML string of the reading passage only. Use <p> for paragraphs, <strong> for bold, <em> for italic.",
  "question_groups": [
    {
      "type": "string (matching_headings | true_false_notgiven | yes_no_notgiven | mcq | matching_information | matching_features | matching_sentence_endings | sentence_completion | summary_completion | table_completion | flowchart_completion | diagram_label_completion | short)",
      "instruction": "string (e.g. 'Questions 1-5: Choose the correct letter A, B, C or D')",
      "group_options": ["A. Dr Broca", "B. Dr Brinkman", "C. Geschwind"] or null, // Use this for shared options applied to multiple matching questions
      "questions": [
        {
          "order_index": 1,
          "prompt": "string (the question text)",
          "options": ["A option", "B option"] or null, // Only for MCQ where options are specific to this question
          "answer_key": "string or null"
        }
      ]
    }
  ]
}

Rules:
1. "passage" = reading content ONLY, never questions.
2. For fill_in_blank, use '___' where the blank is.
3. Classify question type accurately.
4. Return valid JSON only, no markdown fences.`;

  /** Parse a PDF file by sending it directly to Gemini's multimodal API */
  async parsePdf(buffer: Buffer): Promise<any> {
    this.logger.log(`Parsing PDF file (${buffer.length} bytes) via Gemini multimodal...`);

    try {
      const { data, modelName } = await this.llm.generateJsonWithFile({
        systemPrompt: this.SYSTEM_PROMPT,
        fileBuffer: buffer,
        mimeType: 'application/pdf',
      });
      this.logger.log(`Parsed PDF successfully using ${modelName}`);
      return data;
    } catch (e) {
      this.logger.error('Failed to parse PDF via LLM', e);
      throw new Error('Could not parse PDF document. Please try again.');
    }
  }

  /** Parse a DOCX file — extracts text via mammoth, then sends to LLM */
  async parseDocx(buffer: Buffer): Promise<any> {
    // Convert DOCX to HTML, stripping images
    const result = await mammoth.convertToHtml(
      { buffer },
      {
        convertImage: mammoth.images.imgElement(() =>
          Promise.resolve({ src: '' }),
        ),
      },
    );
    let html = result.value;

    // Strip empty img tags and inline styles
    html = html.replace(/<img[^>]*>/gi, '');
    html = html.replace(/\s*style="[^"]*"/gi, '');

    const estimatedTokens = Math.ceil(html.length / 4);
    this.logger.log(`DOCX converted to HTML: ${html.length} chars (~${estimatedTokens} tokens)`);

    // If HTML is too small or too large, try raw text or send as file
    if (html.replace(/<[^>]*>/g, '').trim().length < 100) {
      this.logger.warn('DOCX appears to be image-based (very little text). Sending raw file to Gemini multimodal...');
      // Send the DOCX file directly to Gemini (it can read DOCX too)
      try {
        const { data, modelName } = await this.llm.generateJsonWithFile({
          systemPrompt: this.SYSTEM_PROMPT,
          fileBuffer: buffer,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        this.logger.log(`Parsed image-based DOCX via multimodal using ${modelName}`);
        return data;
      } catch (e) {
        this.logger.error('Multimodal DOCX parsing also failed', e);
        throw new Error('Could not parse document. The file may be image-based — please try uploading a PDF instead.');
      }
    }

    // If HTML has enough text content, fall back to raw text if too large
    if (estimatedTokens > 100000) {
      this.logger.warn('HTML too large, falling back to raw text extraction');
      const textResult = await mammoth.extractRawText({ buffer });
      html = textResult.value;
    }

    try {
      const { data, modelName } = await this.llm.generateJson({
        systemPrompt: this.SYSTEM_PROMPT,
        userPrompt: html,
        modelTier: 'premium',
      });
      this.logger.log(`Parsed DOCX successfully using ${modelName}`);
      return data;
    } catch (e) {
      this.logger.error('Failed to parse document via LLM', e);
      throw new Error('Could not parse document. Please check the file formatting.');
    }
  }
}
