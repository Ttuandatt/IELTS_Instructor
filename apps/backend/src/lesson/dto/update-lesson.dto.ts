import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto';
import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { ContentStatus } from '@prisma/client';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
    @IsOptional()
    @IsEnum(ContentStatus)
    status?: ContentStatus;

    @IsOptional()
    @IsInt()
    order_index?: number;
}
