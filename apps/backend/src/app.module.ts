import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { InstructorModule } from './instructor/instructor.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReadingModule } from './reading/reading.module';
import { WritingModule } from './writing/writing.module';
import { ClassroomModule } from './classroom/classroom.module';
import { TopicModule } from './topic/topic.module';
import { LessonModule } from './lesson/lesson.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // BullMQ — Redis connection (global so all queues share it)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
      }),
      inject: [ConfigService],
    }),

    // Database (Prisma)
    PrismaModule,

    // Auth
    AuthModule,

    // Feature modules
    AdminModule,
    InstructorModule,
    DashboardModule,
    ReadingModule,
    WritingModule,
    ClassroomModule,
    TopicModule,
    LessonModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
