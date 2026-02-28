import { IsArray, IsUUID } from 'class-validator';

export class ReorderLessonsDto {
    @IsArray()
    @IsUUID('4', { each: true })
    lesson_ids: string[];
}
