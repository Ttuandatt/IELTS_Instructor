import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
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
        const progress = job.progress;
        let result: FileConversionResult | null = null;
        if (state === 'completed') {
            result = (job.returnvalue as FileConversionResult) ?? null;
        }

        return {
            id: job.id!.toString(),
            state,
            progress: progress as number | object,
            attemptsMade: job.attemptsMade,
            result,
            failedReason: state === 'failed' ? job.failedReason : undefined,
        };
    }
}