import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AllowAnonymous,
  OptionalAuth,
  Session,
} from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { CurrentUserId, RequireAuth } from '../../common/auth';
import { createImageUploadInterceptor } from '../../storage/multer/create-image-upload.interceptor';
import { ListAdminPropertyListingsQueryDto } from './dto/list-admin-property-listings-query.dto';
import { ListPropertyListingsQueryDto } from './dto/list-property-listings-query.dto';
import { RejectPropertyListingDto } from './dto/reject-property-listing.dto';
import { MAX_PROPERTY_IMAGES } from './property-listings.constants';
import { PropertyListingsService } from './property-listings.service';

const propertyImagesInterceptor =
  createImageUploadInterceptor(MAX_PROPERTY_IMAGES);

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
  @RequireAuth()
  @ApiOperation({
    summary:
      'List current user property listings (cursor pagination via lastId)',
  })
  listMine(
    @CurrentUserId() userId: string,
    @Query() query: ListPropertyListingsQueryDto,
  ) {
    return this.propertyListingsService.listMine(userId, query);
  }

  @Get('admin')
  @RequireAuth()
  @ApiOperation({
    summary:
      'List all property listings for dashboard (cursor pagination + summary)',
  })
  listForAdmin(
    @CurrentUserId() userId: string,
    @Query() query: ListAdminPropertyListingsQueryDto,
  ) {
    return this.propertyListingsService.listForAdmin(userId, query);
  }

  @Get('moderation/pending')
  @RequireAuth()
  @ApiOperation({
    summary: 'List pending property listings (admin dashboard)',
  })
  listPending(@CurrentUserId() userId: string) {
    return this.propertyListingsService.listPendingModeration(userId);
  }

  @Get('moderation/hidden')
  @RequireAuth()
  @ApiOperation({
    summary: 'List hidden and deleted property listings (admin only)',
  })
  listHiddenForAdmin(@CurrentUserId() userId: string) {
    return this.propertyListingsService.listHiddenForAdmin(userId);
  }

  @Get(':id')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get property listing by id' })
  findOne(@Param('id') id: string, @Session() session: UserSession | null) {
    return this.propertyListingsService.findById(id, session?.user?.id);
  }

  @Post()
  @RequireAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a property listing' })
  @UseInterceptors(propertyImagesInterceptor)
  async create(
    @CurrentUserId() userId: string,
    @Body('payload') payload: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const dto = this.propertyListingsService.parsePayloadJson(payload);
    const uploadedUrls =
      await this.propertyListingsService.mapUploadedFiles(files);
    return this.propertyListingsService.create(userId, dto, uploadedUrls);
  }

  @Patch(':id')
  @RequireAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a property listing' })
  @UseInterceptors(propertyImagesInterceptor)
  async update(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body('payload') payload: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const dto = this.propertyListingsService.parsePayloadJson(payload);
    const uploadedUrls =
      await this.propertyListingsService.mapUploadedFiles(files);
    return this.propertyListingsService.update(id, userId, dto, uploadedUrls);
  }

  @Patch(':id/hide')
  @RequireAuth()
  @ApiOperation({
    summary:
      'Hide a property listing from the public (owner only, no approval)',
  })
  hide(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.propertyListingsService.hide(id, userId);
  }

  @Patch(':id/unhide')
  @RequireAuth()
  @ApiOperation({
    summary: 'Restore a hidden property listing (owner only, no approval)',
  })
  unhide(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.propertyListingsService.unhide(id, userId);
  }

  @Delete(':id/permanent')
  @RequireAuth()
  @ApiOperation({
    summary:
      'Permanently delete a property listing (owner or users with permanent-delete permission)',
  })
  permanentRemove(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.propertyListingsService.permanentRemove(id, userId);
  }

  @Delete(':id')
  @RequireAuth()
  @ApiOperation({
    summary:
      'Soft-delete a property listing (owner only, no approval; admin can still view)',
  })
  async remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.propertyListingsService.remove(id, userId);
    return { message: 'Property listing deleted' };
  }

  @Post(':id/favorite')
  @RequireAuth()
  @ApiOperation({ summary: 'Favorite a property listing' })
  addFavorite(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.propertyListingsService.addFavorite(userId, id);
  }

  @Delete(':id/favorite')
  @RequireAuth()
  @ApiOperation({ summary: 'Remove property listing from favorites' })
  removeFavorite(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.propertyListingsService.removeFavorite(userId, id);
  }

  @Patch(':id/approve')
  @RequireAuth()
  @ApiOperation({
    summary: 'Approve a pending property listing (admin dashboard)',
  })
  approve(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.propertyListingsService.approve(id, userId);
  }

  @Patch(':id/reject')
  @RequireAuth()
  @ApiOperation({
    summary: 'Reject a pending property listing (admin dashboard)',
  })
  reject(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body() dto: RejectPropertyListingDto,
  ) {
    return this.propertyListingsService.reject(id, userId, dto);
  }
}
