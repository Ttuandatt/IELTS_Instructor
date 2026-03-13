import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { promises as fs } from 'fs';
import { basename, extname, join } from 'path';
import { spawn } from 'child_process';
import * as mammoth from 'mammoth';
import { FILE_CONVERSION_QUEUE, FileConversionJobData, FileConversionResult } from './conversion.types';

@Processor(FILE_CONVERSION_QUEUE, { concurrency: 2 })
export class FileConversionProcessor extends WorkerHost {
    private readonly logger = new Logger(FileConversionProcessor.name);
    private readonly uploadsRoot = join(process.cwd(), 'uploads');
    private readonly convertedRoot = join(this.uploadsRoot, 'converted');

    async process(job: Job<FileConversionJobData>): Promise<FileConversionResult> {
        const jobDir = await this.ensureJobDir(job.id!.toString());
        const ext = extname(job.data.originalName).toLowerCase();

        let pdfPath: string | null = null;
        let htmlPath: string | null = null;
        let textPath: string | null = null;

        try {
            if (ext === '.pdf') {
                pdfPath = await this.copyInto(job.data.filePath, jobDir, 'source.pdf');
            } else if (ext === '.docx' || ext === '.doc') {
                pdfPath = await this.convertWithLibreOffice(job.data.filePath, jobDir, job.data.originalName);
                if (ext === '.docx') {
                    htmlPath = await this.renderDocxToHtml(job.data.filePath, jobDir);
                    textPath = await this.renderDocxToText(job.data.filePath, jobDir);
                }
            } else if (ext === '.txt') {
                textPath = await this.copyInto(job.data.filePath, jobDir, 'source.txt');
                htmlPath = await this.wrapTextAsHtml(job.data.filePath, jobDir);
            } else {
                // Unknown format — just keep original copy for download
                await this.copyInto(job.data.filePath, jobDir, basename(job.data.filePath));
            }
        } catch (err) {
            const error = err as Error;
            this.logger.error(`Conversion failed for ${job.data.originalName}: ${error.message}`);
            throw error;
        }

        return {
            pdfUrl: pdfPath ? this.toPublicUrl(pdfPath) : null,
            htmlUrl: htmlPath ? this.toPublicUrl(htmlPath) : null,
            textUrl: textPath ? this.toPublicUrl(textPath) : null,
            completedAt: new Date().toISOString(),
        };
    }

    private async ensureJobDir(jobId: string): Promise<string> {
        await fs.mkdir(this.convertedRoot, { recursive: true });
        const dir = join(this.convertedRoot, jobId);
        await fs.mkdir(dir, { recursive: true });
        return dir;
    }

    private async copyInto(src: string, destDir: string, filename: string): Promise<string> {
        const destination = join(destDir, filename);
        await fs.copyFile(src, destination);
        return destination;
    }

    private async convertWithLibreOffice(inputPath: string, destDir: string, originalName: string): Promise<string | null> {
        const sofficeBin = process.env.SOFFICE_BIN || 'soffice';
        const args = ['--headless', '--convert-to', 'pdf', '--outdir', destDir, inputPath];

        try {
            await new Promise<void>((resolve, reject) => {
                const proc = spawn(sofficeBin, args, { stdio: 'ignore' });
                let errored = false;
                proc.on('error', (err) => {
                    errored = true;
                    reject(err);
                });
                proc.on('close', (code) => {
                    if (!errored) {
                        if (code === 0) {
                            resolve();
                        } else {
                            reject(new Error(`LibreOffice exited with code ${code}`));
                        }
                    }
                });
            });
        } catch (err) {
            const error = err as Error;
            this.logger.warn(`LibreOffice conversion failed (${originalName}): ${error.message}`);
            return null;
        }

        const expectedName = `${basename(originalName, extname(originalName))}.pdf`;
        const expectedPath = join(destDir, expectedName);
        try {
            await fs.access(expectedPath);
            return expectedPath;
        } catch {
            return null;
        }
    }

    private async renderDocxToHtml(inputPath: string, destDir: string): Promise<string> {
        const result = await mammoth.convertToHtml({ path: inputPath });
        const htmlPath = join(destDir, 'preview.html');
        await fs.writeFile(htmlPath, result.value, 'utf-8');
        return htmlPath;
    }

    private async renderDocxToText(inputPath: string, destDir: string): Promise<string> {
        const result = await mammoth.extractRawText({ path: inputPath });
        const textPath = join(destDir, 'content.txt');
        await fs.writeFile(textPath, result.value, 'utf-8');
        return textPath;
    }

    private async wrapTextAsHtml(inputPath: string, destDir: string): Promise<string> {
        const raw = await fs.readFile(inputPath, 'utf-8');
        const paragraphs = raw
            .split(/\r?\n\s*\r?\n/)
            .map((p) => `<p>${p.replace(/\r?\n/g, '<br />')}</p>`) 
            .join('\n');
        const htmlPath = join(destDir, 'preview.html');
        await fs.writeFile(htmlPath, paragraphs, 'utf-8');
        return htmlPath;
    }

    private toPublicUrl(absPath: string): string {
        const relative = absPath.replace(this.uploadsRoot, '').replace(/\\/g, '/');
        return `/uploads${relative}`;
    }
}