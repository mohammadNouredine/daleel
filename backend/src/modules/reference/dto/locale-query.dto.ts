import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';
import type { SupportedLocale } from '../data/help-request-options.data';

export class LocaleQueryDto {
  @ApiPropertyOptional({
    enum: ['en', 'ar'],
    default: 'en',
    description: 'Language for option labels',
  })
  @IsOptional()
  @IsIn(['en', 'ar'])
  @Transform(({ value }: { value?: string }) => (value === 'ar' ? 'ar' : 'en'))
  locale?: SupportedLocale;
}
