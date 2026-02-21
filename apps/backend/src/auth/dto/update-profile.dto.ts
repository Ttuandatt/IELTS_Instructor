import { IsString, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  display_name?: string;

  @IsOptional()
  @IsIn(['vi', 'en'])
  language?: string;

  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: string;
}
