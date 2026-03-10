import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Queue } from 'bull';
import { FILE_CONVERSION_QUEUE, FileConversionJobData } from './conversion.types';

@Injectable()
export class FileConversionProducerService {
    private readonly logger = new Logger(FileConversionProducerService.name);

    constructor(
        @InjectQueue(FILE_CONVERSION_QUEUE) private readonly queue: Queue,
    ) { }

    async enqueue(data: FileConversionJobData): Promise<string> {
        const jobId = randomUUID();
        await this.queue.add('convert', data, {
            jobId,
            removeOnFail: 50,
            removeOnComplete: false, // keep result so frontend can poll
            attempts: 1,
        });
        this.logger.log(`Queued file conversion for ${data.originalName} (job ${jobId})`);
        return jobId;
    }
}