import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  ListingType,
  PropertyListingStatus,
} from '../../../common/enums';
import {
  DEFAULT_LISTING_PAGE_SIZE,
  MAX_LISTING_PAGE_SIZE,
} from '../property-listings.constants';

export class ListAdminPropertyListingsQueryDto {
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

  @ApiPropertyOptional({ enum: PropertyListingStatus })
  @IsOptional()
  @IsEnum(PropertyListingStatus)
  status?: PropertyListingStatus;

  @ApiPropertyOptional({ enum: ListingType })
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @ApiPropertyOptional({ description: 'Search title or city' })
  @IsOptional()
  @IsString()
  q?: string;
}
