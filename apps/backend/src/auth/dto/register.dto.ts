import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  display_name: string;

  @IsOptional()
  @IsIn(['vi', 'en'])
  language?: string;

  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: string;
}
