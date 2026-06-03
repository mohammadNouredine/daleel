import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AllowAnonymous,
  OptionalAuth,
  Session,
} from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { createImageUploadInterceptor } from '../../storage/multer/create-image-upload.interceptor';
import { ListPropertyListingsQueryDto } from './dto/list-property-listings-query.dto';
import { RejectPropertyListingDto } from './dto/reject-property-listing.dto';
import { MAX_PROPERTY_IMAGES } from './property-listings.constants';
import { PropertyListingsService } from './property-listings.service';

function requireUserId(session: UserSession | null): string {
  if (!session?.user?.id) {
    throw new UnauthorizedException('Authentication required');
  }
  return session.user.id;
}

const propertyImagesInterceptor = createImageUploadInterceptor(
  MAX_PROPERTY_IMAGES,
);

@ApiTags('Property Listings')
@Controller('property-listings')
export class PropertyListingsController {
  constructor(
    private readonly propertyListingsService: PropertyListingsService,
  ) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({
    summary:
      'List approved property listings (public feed, cursor pagination via lastId)',
  })
  list(@Query() query: ListPropertyListingsQueryDto) {
    return this.propertyListingsService.listPublic(query);
  }

  @Get('location-facets')
  @AllowAnonymous()
  @ApiOperation({
    summary:
      'Governorate and city filter options derived from approved listings',
  })
  getLocationFacets() {
    return this.propertyListingsService.getLocationFacets();
  }

  @Get('mine')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'List current user property listings (cursor pagination via lastId)',
  })
  listMine(
    @Session() session: UserSession | null,
    @Query() query: ListPropertyListingsQueryDto,
  ) {
    const userId = requireUserId(session);
    return this.propertyListingsService.listMine(userId, query);
  }

  @Get('moderation/pending')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'List pending property listings (admin dashboard)',
  })
  listPending(@Session() session: UserSession | null) {
    const userId = requireUserId(session);
    return this.propertyListingsService.listPendingModeration(userId);
  }

  @Get(':id')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get property listing by id' })
  findOne(
    @Param('id') id: string,
    @Session() session: UserSession | null,
  ) {
    return this.propertyListingsService.findById(id, session?.user?.id);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a property listing' })
  @UseInterceptors(propertyImagesInterceptor)
  async create(
    @Session() session: UserSession | null,
    @Body('payload') payload: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = requireUserId(session);
    const dto = this.propertyListingsService.parsePayloadJson(payload);
    const uploadedUrls =
      await this.propertyListingsService.mapUploadedFiles(files);
    return this.propertyListingsService.create(userId, dto, uploadedUrls);
  }

  @Patch(':id')
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a property listing' })
  @UseInterceptors(propertyImagesInterceptor)
  async update(
    @Param('id') id: string,
    @Session() session: UserSession | null,
    @Body('payload') payload: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = requireUserId(session);
    const dto = this.propertyListingsService.parsePayloadJson(payload);
    const uploadedUrls =
      await this.propertyListingsService.mapUploadedFiles(files);
    return this.propertyListingsService.update(id, userId, dto, uploadedUrls);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Soft-delete a property listing' })
  async remove(
    @Param('id') id: string,
    @Session() session: UserSession | null,
  ) {
    const userId = requireUserId(session);
    await this.propertyListingsService.remove(id, userId);
    return { message: 'Property listing deleted' };
  }

  @Post(':id/favorite')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Favorite a property listing' })
  addFavorite(
    @Param('id') id: string,
    @Session() session: UserSession | null,
  ) {
    const userId = requireUserId(session);
    return this.propertyListingsService.addFavorite(userId, id);
  }

  @Delete(':id/favorite')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Remove property listing from favorites' })
  removeFavorite(
    @Param('id') id: string,
    @Session() session: UserSession | null,
  ) {
    const userId = requireUserId(session);
    return this.propertyListingsService.removeFavorite(userId, id);
  }

  @Patch(':id/approve')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Approve a pending property listing (admin dashboard)',
  })
  approve(
    @Param('id') id: string,
    @Session() session: UserSession | null,
  ) {
    const userId = requireUserId(session);
    return this.propertyListingsService.approve(id, userId);
  }

  @Patch(':id/reject')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Reject a pending property listing (admin dashboard)',
  })
  reject(
    @Param('id') id: string,
    @Session() session: UserSession | null,
    @Body() dto: RejectPropertyListingDto,
  ) {
    const userId = requireUserId(session);
    return this.propertyListingsService.reject(id, userId, dto);
  }
}
