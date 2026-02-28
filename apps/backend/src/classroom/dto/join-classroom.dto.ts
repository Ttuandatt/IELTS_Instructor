import { IsString, Length } from 'class-validator';

export class JoinClassroomDto {
    @IsString()
    @Length(8, 8)
    invite_code: string;
}
