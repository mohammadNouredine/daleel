import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePropertyReportDto {
  @ApiProperty()
  @IsMongoId()
  propertyId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
