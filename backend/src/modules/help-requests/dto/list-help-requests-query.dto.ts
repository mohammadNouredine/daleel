import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { HelpType, PriorityLevel } from '../../../common/enums';
import { HelpRequestSortQueryDto } from './help-request-sort-query.dto';

export class ListHelpRequestsQueryDto extends HelpRequestSortQueryDto {
  @ApiPropertyOptional({ enum: HelpType })
  @IsOptional()
  @IsEnum(HelpType)
  helpType?: HelpType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  governorate?: string;

  @ApiPropertyOptional({ enum: PriorityLevel })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiPropertyOptional({ enum: ['active', 'archive'] })
  @IsOptional()
  @IsIn(['active', 'archive'])
  view?: 'active' | 'archive';
}
