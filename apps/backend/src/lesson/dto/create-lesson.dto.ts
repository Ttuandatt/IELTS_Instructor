import { IsString, IsOptional, MaxLength, IsEnum, IsUUID } from 'class-validator';
import { LessonContentType, ContentStatus } from '@prisma/client';

export class CreateLessonDto {
    @IsString()
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsEnum(LessonContentType)
    content_type?: LessonContentType;

    @IsOptional()
    @IsUUID('4')
    linked_entity_id?: string;

    @IsOptional()
    @IsEnum(ContentStatus)
    status?: ContentStatus;

    @IsOptional()
    @IsString()
    attachment_url?: string;
}
