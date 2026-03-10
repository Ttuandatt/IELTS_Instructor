import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Queue } from 'bull';
import { FILE_CONVERSION_QUEUE, FileConversionResult, FileConversionStatusResponse } from './conversion.types';

@Injectable()
export class FileConversionStatusService {
    constructor(
        @InjectQueue(FILE_CONVERSION_QUEUE) private readonly queue: Queue,
    ) { }

    async getStatus(jobId: string): Promise<FileConversionStatusResponse> {
        const job = await this.queue.getJob(jobId);
        if (!job) {
            throw new NotFoundException('Conversion job not found');
        }

        const state = await job.getState();
        const progress = job.progress();
        let result: FileConversionResult | null = null;
        if (state === 'completed') {
            result = (job.returnvalue as FileConversionResult) ?? null;
        }

        return {
            id: job.id.toString(),
            state,
            progress,
            attemptsMade: job.attemptsMade,
            result,
            failedReason: state === 'failed' ? job.failedReason : undefined,
        };
    }
}