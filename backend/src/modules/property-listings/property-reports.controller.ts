import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserId, RequireAuth } from '../../common/auth';
import { CreatePropertyReportDto } from './dto/create-property-report.dto';
import { PropertyListingsService } from './property-listings.service';

@ApiTags('Property Reports')
@Controller('property-reports')
@RequireAuth()
export class PropertyReportsController {
  constructor(
    private readonly propertyListingsService: PropertyListingsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Report a property listing' })
  create(@CurrentUserId() userId: string, @Body() dto: CreatePropertyReportDto) {
    return this.propertyListingsService.createReport(userId, dto);
  }
}
