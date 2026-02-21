import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { InstructorModule } from './instructor/instructor.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReadingModule } from './reading/reading.module';
import { WritingModule } from './writing/writing.module';

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
