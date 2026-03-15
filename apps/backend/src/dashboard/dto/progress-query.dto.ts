import { IsOptional, IsIn } from 'class-validator';

export class TrendsQueryDto {
  @IsOptional()
  @IsIn(['4w', '3m'])
  period?: '4w' | '3m' = '4w';
}
