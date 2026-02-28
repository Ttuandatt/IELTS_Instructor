import { IsArray, IsUUID } from 'class-validator';

export class ReorderTopicsDto {
    @IsArray()
    @IsUUID('4', { each: true })
    topic_ids: string[];
}
