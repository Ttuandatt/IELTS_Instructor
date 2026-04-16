import { Controller, Get, Param, Post, Body, Query, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReadingService } from './reading.service';
import { ParsingService } from './parsing.service';
import { MammothParserService } from './mammoth-parser.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { adaptLegacyGeminiResult, MAMMOTH_CONFIDENCE_THRESHOLD } from './parse-adapter';

const PARSED_DIR = join(process.cwd(), 'uploads', 'parsed');

function persistParsedFile(buffer: Buffer, ext: string): string {
  if (!existsSync(PARSED_DIR)) mkdirSync(PARSED_DIR, { recursive: true });
  const id = randomUUID();
  const filename = `${id}.${ext}`;
  writeFileSync(join(PARSED_DIR, filename), buffer);
  return `/uploads/parsed/${filename}`;
}

@Controller('reading')
@UseGuards(JwtAuthGuard)
export class ReadingController {
  constructor(
    private readonly readingService: ReadingService,
    private readonly parsingService: ParsingService,
    private readonly mammothParser: MammothParserService,
  ) { }

  @Post('parse-docx')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  async parseDocx(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!['docx', 'pdf'].includes(ext || '')) {
      throw new BadRequestException('Only .docx and .pdf files are allowed');
    }

    const started = Date.now();
    const sourceUrl = persistParsedFile(file.buffer, ext!);

    if (ext === 'pdf') {
      const raw = await this.parsingService.parsePdf(file.buffer);
      const rawObj = (raw ?? {}) as { question_groups?: unknown[] };
      const groupCount = Array.isArray(rawObj.question_groups) ? rawObj.question_groups.length : 0;
      console.log(`[parse-docx] PDF -> Gemini returned ${groupCount} question_groups`);
      if (groupCount === 0) {
        console.log('[parse-docx] raw Gemini response (truncated):', JSON.stringify(raw).slice(0, 600));
      }
      const adapted = adaptLegacyGeminiResult(raw, [], Date.now() - started);
      adapted.passage.source_pdf_url = sourceUrl;
      return adapted;
    }

    try {
      const mammothResult = await this.mammothParser.parse(file.buffer);
      if (mammothResult.confidence >= MAMMOTH_CONFIDENCE_THRESHOLD) {
        return mammothResult;
      }
      const raw = await this.parsingService.parseDocx(file.buffer);
      return adaptLegacyGeminiResult(
        raw,
        [
          ...mammothResult.warnings,
          `mammoth confidence ${mammothResult.confidence.toFixed(2)} < ${MAMMOTH_CONFIDENCE_THRESHOLD}, fell back to Gemini`,
        ],
        Date.now() - started,
      );
    } catch (err) {
      const raw = await this.parsingService.parseDocx(file.buffer);
      const errorMsg = err instanceof Error ? err.message : String(err);
      return adaptLegacyGeminiResult(raw, [`mammoth failed: ${errorMsg}`], Date.now() - started);
    }
  }

  @Get('passages')
  listPassages(@Query('level') level?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.readingService.listPassages({ level, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get('passages/:id')
  getPassage(@Param('id') id: string) {
    return this.readingService.getPassage(id);
  }

  @Post('passages/:id/submit')
  submitAnswers(@Request() req: any, @Param('id') passageId: string, @Body() body: { answers: Array<{ question_id: string; value: string }>; duration_sec?: number; timed_out?: boolean; lesson_id?: string }) {
    return this.readingService.submitAnswers(req.user.sub, passageId, body);
  }

  @Get('history')
  getHistory(@Request() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.readingService.getHistory(req.user.sub, { page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }
}
