import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  AreaUnit,
  Currency,
  FurnishingStatus,
  ListingContactMethod,
  ListingType,
  PricePeriod,
  PropertyType,
} from '../../../common/enums';
import { ListingImageDto } from './listing-image.dto';
import { ListingLocationDto } from './listing-location.dto';

export class CreatePropertyListingDto {
  @ApiProperty({ enum: ListingType })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ type: ListingLocationDto })
  @ValidateNested()
  @Type(() => ListingLocationDto)
  location: ListingLocationDto;

  @ApiPropertyOptional({ type: [ListingImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListingImageDto)
  images?: ListingImageDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  existingImages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOccupancy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  livingRooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  parkingSpaces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  floorNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  buildingFloors?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @ApiPropertyOptional({ enum: AreaUnit })
  @IsOptional()
  @IsEnum(AreaUnit)
  areaUnit?: AreaUnit;

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsOptional()
  @IsEnum(FurnishingStatus)
  furnishingStatus?: FurnishingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({ enum: PricePeriod })
  @IsOptional()
  @IsEnum(PricePeriod)
  pricePeriod?: PricePeriod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredAdvanceMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  securityDeposit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  officeDeposit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPriceNegotiable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEmergencyShelter?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptFamilies?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptChildren?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptPets?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  womenOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  menOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableBeds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBeds?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenityIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  availableUntil?: string;

  @ApiPropertyOptional({ enum: ListingContactMethod })
  @IsOptional()
  @IsEnum(ListingContactMethod)
  contactMethod?: ListingContactMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactWhatsapp?: string;

  @ApiPropertyOptional({
    description:
      'When true, listing is saved as DRAFT instead of PENDING_APPROVAL',
  })
  @IsOptional()
  @IsBoolean()
  saveAsDraft?: boolean;
}
