import { IsString, IsOptional, MaxLength, IsEnum, IsUUID, IsBoolean, IsObject } from 'class-validator';
import { LessonContentType, ContentStatus, CefrLevel } from '@prisma/client';

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

    @IsOptional()
    @IsBoolean()
    allow_submit?: boolean;

    @IsOptional()
    @IsBoolean()
    allow_checkscore?: boolean;

    @IsOptional()
    @IsEnum(CefrLevel)
    target_level?: CefrLevel;

    @IsOptional()
    @IsObject()
    reading_payload?: Record<string, any>;
}
