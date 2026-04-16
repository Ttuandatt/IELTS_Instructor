import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    UseGuards,
    Query,
    Logger,
    Get,
    Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { v4 as uuid } from 'uuid';
import * as mammoth from 'mammoth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocxParserService } from './docx-parser.service';
import { FileConversionProducerService } from './conversion.producer';
import { FileConversionStatusService } from './conversion-status.service';
import { MammothParserService } from '../reading/mammoth-parser.service';
import { ParsingService } from '../reading/parsing.service';
import { adaptLegacyGeminiResult, MAMMOTH_CONFIDENCE_THRESHOLD } from '../reading/parse-adapter';
import { HybridParseResult } from '../reading/hybrid-parser.types';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = [
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
];

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadController {
    private readonly logger = new Logger(UploadController.name);

    constructor(
        private readonly docxParser: DocxParserService,
        private readonly conversionProducer: FileConversionProducerService,
        private readonly conversionStatus: FileConversionStatusService,
        private readonly mammothParser: MammothParserService,
        private readonly parsingService: ParsingService,
    ) { }

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: UPLOAD_DIR,
                filename: (_req, file, cb) => {
                    const ext = extname(file.originalname).toLowerCase();
                    cb(null, `${uuid()}${ext}`);
                },
            }),
            limits: { fileSize: MAX_FILE_SIZE },
            fileFilter: (_req, file, cb) => {
                const ext = extname(file.originalname).toLowerCase();
                if (ALLOWED_EXTENSIONS.includes(ext)) {
                    cb(null, true);
                } else {
                    cb(
                        new BadRequestException(
                            `File type ${ext} not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
                        ),
                        false,
                    );
                }
            },
        }),
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('parse') parseMode?: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const ext = extname(file.originalname).toLowerCase();
        const isDocx = ext === '.docx';
        const isPdf = ext === '.pdf';
        const isTxt = ext === '.txt';
        const shouldParseReading = parseMode === 'reading' && (isDocx || isPdf || isTxt);
        let extractedHtml: string | null = null;

        let parsedReading: HybridParseResult | null = null;

        try {
            if (isDocx) {
                const result = await mammoth.convertToHtml({ path: file.path });
                extractedHtml = result.value;
            } else if (ext === '.doc') {
                try {
                    const result = await mammoth.convertToHtml({ path: file.path });
                    extractedHtml = result.value;
                } catch {
                    extractedHtml = null;
                }
            } else if (isTxt) {
                const raw = readFileSync(file.path, 'utf-8');
                extractedHtml = raw
                    .split(/\n\s*\n/)
                    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
                    .join('\n');
            } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
                const backendUrl = `http://localhost:${process.env.PORT || 3001}`;
                extractedHtml = `<img src="${backendUrl}/uploads/${file.filename}" alt="${file.originalname}" style="max-width:100%;height:auto;border-radius:8px;" />`;
            }

            if (shouldParseReading) {
                parsedReading = await this.runHybridParse(file.path, ext);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.error(`Reading parse failed: ${errorMessage}`);
        }

        const backendBaseUrl = `http://localhost:${process.env.PORT || 3001}`;
        const conversionJobId = await this.conversionProducer.enqueue({
            filePath: file.path,
            originalName: file.originalname,
            mimeType: file.mimetype,
        });

        return {
            url: `${backendBaseUrl}/uploads/${file.filename}`,
            originalName: file.originalname,
            size: file.size,
            extractedHtml,
            parsedReading,
            conversionJobId,
        };
    }

    /** Run the hybrid parser on an uploaded file (DOCX → Mammoth + Gemini fallback,
     *  PDF → Gemini multimodal). Returns a unified HybridParseResult, or null on failure. */
    private async runHybridParse(filePath: string, ext: string): Promise<HybridParseResult | null> {
        const { readFile } = await import('node:fs/promises');
        const buffer = await readFile(filePath);
        const started = Date.now();

        if (ext === '.pdf') {
            try {
                const raw = await this.parsingService.parsePdf(buffer);
                const adapted = adaptLegacyGeminiResult(raw, [], Date.now() - started);
                adapted.passage.source_pdf_url = this.toPublicUrl(filePath);
                return adapted;
            } catch (err) {
                this.logger.error(`PDF parse failed: ${err instanceof Error ? err.message : err}`);
                return null;
            }
        }

        if (ext === '.docx') {
            try {
                const mammothResult = await this.mammothParser.parse(buffer);
                if (mammothResult.confidence >= MAMMOTH_CONFIDENCE_THRESHOLD) return mammothResult;
                const raw = await this.parsingService.parseDocx(buffer);
                return adaptLegacyGeminiResult(
                    raw,
                    [...mammothResult.warnings, `mammoth confidence ${mammothResult.confidence.toFixed(2)} < ${MAMMOTH_CONFIDENCE_THRESHOLD}, fell back to Gemini`],
                    Date.now() - started,
                );
            } catch {
                try {
                    const raw = await this.parsingService.parseDocx(buffer);
                    return adaptLegacyGeminiResult(raw, ['mammoth failed, used Gemini'], Date.now() - started);
                } catch (err) {
                    this.logger.error(`DOCX parse failed: ${err instanceof Error ? err.message : err}`);
                    return null;
                }
            }
        }

        return null;
    }

    private toPublicUrl(absolutePath: string): string {
        const rel = absolutePath.replace(UPLOAD_DIR, '').replaceAll('\\', '/');
        return `/uploads${rel.startsWith('/') ? rel : '/' + rel}`;
    }

    @Get('conversions/:jobId')
    async getConversionStatus(@Param('jobId') jobId: string) {
        return this.conversionStatus.getStatus(jobId);
    }
}
