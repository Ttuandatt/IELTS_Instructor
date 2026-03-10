import type { Job } from 'bull';

export const FILE_CONVERSION_QUEUE = 'file-conversion';

export interface FileConversionJobData {
    filePath: string;
    originalName: string;
    mimeType?: string;
}

export type FileConversionJob = Job<FileConversionJobData>;

export interface FileConversionResult {
    pdfUrl?: string | null;
    htmlUrl?: string | null;
    textUrl?: string | null;
    imageUrls?: string[];
    completedAt: string;
}

export interface FileConversionStatusResponse {
    id: string;
    state: string;
    progress: number | object;
    attemptsMade: number;
    result?: FileConversionResult | null;
    failedReason?: string;
}