import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { PropertyListingsService } from './property-listings.service';

@ApiTags('Amenities')
@Controller('amenities')
export class AmenitiesController {
  constructor(
    private readonly propertyListingsService: PropertyListingsService,
  ) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'List active amenities for filters and forms' })
  list() {
    return this.propertyListingsService.listAmenities();
  }
}
