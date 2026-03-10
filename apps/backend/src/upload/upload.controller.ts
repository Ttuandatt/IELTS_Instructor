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
import { extname, join } from 'path';
import { readFileSync } from 'fs';
import { v4 as uuid } from 'uuid';
import * as mammoth from 'mammoth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocxParserService } from './docx-parser.service';
import { buildReadingHtml } from '../reading/reading-html.util';
import { FileConversionProducerService } from './conversion.producer';
import { FileConversionStatusService } from './conversion-status.service';

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
        const isTxt = ext === '.txt';
        const shouldParseReading = parseMode === 'reading' && (isDocx || isTxt);
        let extractedHtml: string | null = null;

        let parsedReading: any = null;
        let lessonHtml: string | null = null;

        try {
            if (isDocx) {
                const result = await mammoth.convertToHtml({ path: file.path });
                extractedHtml = result.value;
            } else if (ext === '.doc') {
                // .doc is legacy binary format — mammoth may handle some
                try {
                    const result = await mammoth.convertToHtml({ path: file.path });
                    extractedHtml = result.value;
                } catch {
                    extractedHtml = null; // fallback: can't parse .doc
                }
            } else if (isTxt) {
                const raw = readFileSync(file.path, 'utf-8');
                // Wrap paragraphs in <p> tags
                extractedHtml = raw
                    .split(/\n\s*\n/)
                    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
                    .join('\n');
            } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
                // For images, generate an <img> tag with full backend URL
                const backendUrl = `http://localhost:${process.env.PORT || 3001}`;
                extractedHtml = `<img src="${backendUrl}/uploads/${file.filename}" alt="${file.originalname}" style="max-width:100%;height:auto;border-radius:8px;" />`;
            }

            if (shouldParseReading) {
                try {
                    parsedReading = await this.docxParser.parseDocx(file.path);
                    lessonHtml = buildReadingHtml(parsedReading);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    this.logger.error(`Reading parse failed: ${errorMessage}`);
                }
            }
        } catch {
            extractedHtml = null; // parsing failed — still return URL
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
            lessonHtml,
            conversionJobId,
        };
    }

    @Get('conversions/:jobId')
    async getConversionStatus(@Param('jobId') jobId: string) {
        return this.conversionStatus.getStatus(jobId);
    }
}
