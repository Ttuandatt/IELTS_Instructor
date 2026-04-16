import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UploadController } from './upload.controller';
import { DocxParserService } from './docx-parser.service';
import { FILE_CONVERSION_QUEUE } from './conversion.types';
import { FileConversionProducerService } from './conversion.producer';
import { FileConversionStatusService } from './conversion-status.service';
import { FileConversionProcessor } from './conversion.processor';
import { ReadingModule } from '../reading/reading.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: FILE_CONVERSION_QUEUE,
        }),
        ReadingModule,
    ],
    controllers: [UploadController],
    providers: [DocxParserService, FileConversionProducerService, FileConversionStatusService, FileConversionProcessor],
})
export class UploadModule { }
