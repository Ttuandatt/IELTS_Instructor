import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { ReadingModule } from '../reading/reading.module';
import { WritingModule } from '../writing/writing.module';

@Module({
  imports: [PrismaModule, NotificationModule, ReadingModule, WritingModule],
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule { }
