import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { CreatePropertyReportDto } from './dto/create-property-report.dto';
import { PropertyListingsService } from './property-listings.service';

function requireUserId(session: UserSession | null): string {
  if (!session?.user?.id) {
    throw new UnauthorizedException('Authentication required');
  }
  return session.user.id;
}

@ApiTags('Property Reports')
@Controller('property-reports')
export class PropertyReportsController {
  constructor(
    private readonly propertyListingsService: PropertyListingsService,
  ) {}

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Report a property listing' })
  create(
    @Session() session: UserSession | null,
    @Body() dto: CreatePropertyReportDto,
  ) {
    const userId = requireUserId(session);
    return this.propertyListingsService.createReport(userId, dto);
  }
}
