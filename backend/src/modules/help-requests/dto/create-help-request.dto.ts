import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  HelpType,
  PriorityLevel,
  SubCategory,
  Visibility,
} from '../../../common/enums';

export class CoordinatesDto {
  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lng: number;
}

export class LocationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  governorate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ type: CoordinatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}

export class NeedLineInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  label: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  required: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  kind: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateHelpRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ enum: HelpType })
  @IsEnum(HelpType)
  helpType: HelpType;

  @ApiProperty({ enum: SubCategory })
  @IsEnum(SubCategory)
  subCategory: SubCategory;

  @ApiProperty({ enum: PriorityLevel })
  @IsEnum(PriorityLevel)
  priorityLevel: PriorityLevel;

  @ApiProperty({ type: [NeedLineInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NeedLineInputDto)
  needs: NeedLineInputDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  beneficiariesCount?: number;

  @ApiPropertyOptional({ type: LocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({ enum: Visibility })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  existingMedia?: string[];
}

export class UpdateHelpRequestDto extends CreateHelpRequestDto {}
