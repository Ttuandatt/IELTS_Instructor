import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UploadController } from './upload.controller';
import { DocxParserService } from './docx-parser.service';
import { FILE_CONVERSION_QUEUE } from './conversion.types';
import { FileConversionProducerService } from './conversion.producer';
import { FileConversionStatusService } from './conversion-status.service';
import { FileConversionProcessor } from './conversion.processor';

@Module({
    imports: [
        BullModule.registerQueue({
            name: FILE_CONVERSION_QUEUE,
        }),
    ],
    controllers: [UploadController],
    providers: [DocxParserService, FileConversionProducerService, FileConversionStatusService, FileConversionProcessor],
})
export class UploadModule { }
