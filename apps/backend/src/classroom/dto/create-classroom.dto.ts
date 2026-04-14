import { IsString, IsOptional, IsUrl, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClassroomDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsOptional()
    @IsUrl()
    cover_image_url?: string;

    @IsOptional()
    @IsInt()
    @Min(2)
    @Max(200)
    max_members?: number;
}
