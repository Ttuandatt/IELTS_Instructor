import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ContentVersionService } from './content-version.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, ContentVersionService],
  exports: [AdminService, ContentVersionService],
})
export class AdminModule {}
