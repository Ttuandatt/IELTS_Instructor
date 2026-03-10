import { Controller, Get, Param, Post, Body, Query, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReadingService } from './reading.service';
import { ParsingService } from './parsing.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reading')
@UseGuards(JwtAuthGuard)
export class ReadingController {
  constructor(
    private readonly readingService: ReadingService,
    private readonly parsingService: ParsingService
  ) { }

  @Post('parse-docx')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  async parseDocx(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!['docx', 'pdf'].includes(ext || '')) {
      throw new BadRequestException('Only .docx and .pdf files are allowed');
    }

    if (ext === 'pdf') {
      return this.parsingService.parsePdf(file.buffer);
    }
    return this.parsingService.parseDocx(file.buffer);
  }

  @Get('passages')
  listPassages(@Query('level') level?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.readingService.listPassages({ level, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get('passages/:id')
  getPassage(@Param('id') id: string) {
    return this.readingService.getPassage(id);
  }

  @Post('passages/:id/submit')
  submitAnswers(@Request() req: any, @Param('id') passageId: string, @Body() body: { answers: Array<{ question_id: string; value: string }>; duration_sec?: number; timed_out?: boolean }) {
    return this.readingService.submitAnswers(req.user.sub, passageId, body);
  }

  @Get('history')
  getHistory(@Request() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.readingService.getHistory(req.user.sub, { page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }
}
