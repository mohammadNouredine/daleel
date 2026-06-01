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

  @ApiProperty()
  @IsString()
  @MinLength(1)
  governorate: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  district: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  city: string;

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
