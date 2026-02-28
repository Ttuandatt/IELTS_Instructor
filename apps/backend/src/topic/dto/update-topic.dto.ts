import { PartialType } from '@nestjs/mapped-types';
import { CreateTopicDto } from './create-topic.dto';
import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { ContentStatus } from '@prisma/client';

export class UpdateTopicDto extends PartialType(CreateTopicDto) {
    @IsOptional()
    @IsEnum(ContentStatus)
    status?: ContentStatus;

    @IsOptional()
    @IsInt()
    order_index?: number;
}
