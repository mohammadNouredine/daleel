import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  AreaUnit,
  Currency,
  FurnishingStatus,
  ListingType,
  PropertyType,
} from '../../../common/enums';
import {
  DEFAULT_LISTING_PAGE_SIZE,
  MAX_LISTING_PAGE_SIZE,
} from '../property-listings.constants';

function parseOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  return undefined;
}

function parseAmenityIds(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.map(String);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }
  return undefined;
}

export class ListPropertyListingsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  lastId?: string;

  @ApiPropertyOptional({ default: DEFAULT_LISTING_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(MAX_LISTING_PAGE_SIZE)
  limit?: number;

  @ApiPropertyOptional({ enum: ListingType })
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @ApiPropertyOptional({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  governorate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  areaMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  areaMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsOptional()
  @IsEnum(FurnishingStatus)
  furnishingStatus?: FurnishingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  isEmergencyShelter?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  acceptFamilies?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  acceptChildren?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  acceptPets?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  womenOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  menOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description:
      'Comma-separated amenity document ids or repeated query params',
  })
  @IsOptional()
  @Transform(({ value }) => parseAmenityIds(value))
  @IsArray()
  @IsMongoId({ each: true })
  amenityIds?: string[];
}
