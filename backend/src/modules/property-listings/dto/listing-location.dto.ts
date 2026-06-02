import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LocationVisibility } from '../../../common/enums';

export class ListingCoordinatesDto {
  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lng: number;
}

export class ListingLocationDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  country: string;

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
  @MinLength(1)
  formattedAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ type: ListingCoordinatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ListingCoordinatesDto)
  coordinates?: ListingCoordinatesDto;

  @ApiPropertyOptional({ enum: LocationVisibility })
  @IsOptional()
  @IsEnum(LocationVisibility)
  locationVisibility?: LocationVisibility;
}
