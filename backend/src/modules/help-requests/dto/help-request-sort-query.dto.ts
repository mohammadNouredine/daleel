import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { HelpRequestSort } from '../../../common/enums/help-request-sort.enum';

export class HelpRequestSortQueryDto {
  @ApiPropertyOptional({
    enum: HelpRequestSort,
    default: HelpRequestSort.LATEST,
  })
  @IsOptional()
  @IsEnum(HelpRequestSort)
  sort?: HelpRequestSort;

  @ApiPropertyOptional({ description: 'User latitude — required for nearest sort' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({ description: 'User longitude — required for nearest sort' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;
}
