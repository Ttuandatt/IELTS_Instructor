import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { readFileSync } from 'fs';
import { v4 as uuid } from 'uuid';
import * as mammoth from 'mammoth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const ext = extname(file.originalname).toLowerCase();
        let extractedHtml: string | null = null;

        try {
            if (ext === '.docx') {
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
            } else if (ext === '.txt') {
                const raw = readFileSync(file.path, 'utf-8');
                // Wrap paragraphs in <p> tags
                extractedHtml = raw
                    .split(/\n\s*\n/)
                    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
                    .join('\n');
            }
        } catch {
            extractedHtml = null; // parsing failed — still return URL
        }

        return {
            url: `/uploads/${file.filename}`,
            originalName: file.originalname,
            size: file.size,
            extractedHtml,
        };
    }
}
