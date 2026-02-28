import { PartialType } from '@nestjs/mapped-types';
import { CreateClassroomDto } from './create-classroom.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ClassroomStatus } from '@prisma/client';

export class UpdateClassroomDto extends PartialType(CreateClassroomDto) {
    @IsOptional()
    @IsEnum(ClassroomStatus)
    status?: ClassroomStatus;
}
