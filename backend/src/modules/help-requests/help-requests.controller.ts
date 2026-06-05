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
  Session,
  AllowAnonymous,
  OptionalAuth,
} from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { CurrentUserId, RequireAuth } from '../../common/auth';
import { createImageUploadInterceptor } from '../../storage/multer/create-image-upload.interceptor';
import { MAX_PROOF_IMAGES } from '../uploads/uploads.constants';
import { FulfillmentAdjustmentDto } from './dto/fulfillment-adjustment.dto';
import { HelpRequestSortQueryDto } from './dto/help-request-sort-query.dto';
import { ListHelpRequestsQueryDto } from './dto/list-help-requests-query.dto';
import { RejectHelpRequestDto } from './dto/reject-help-request.dto';
import { HelpRequestsService } from './help-requests.service';

const multipartInterceptor = createImageUploadInterceptor(MAX_PROOF_IMAGES);

@ApiTags('Help Requests')
@Controller('help-requests')
export class HelpRequestsController {
  constructor(private readonly helpRequestsService: HelpRequestsService) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'List approved help requests (public feed)' })
  list(@Query() query: ListHelpRequestsQueryDto) {
    return this.helpRequestsService.listPublic(query);
  }

  @Get('mine')
  @RequireAuth()
  @ApiOperation({ summary: 'List current user help requests' })
  listMine(
    @CurrentUserId() userId: string,
    @Query() query: HelpRequestSortQueryDto,
  ) {
    return this.helpRequestsService.listMine(userId, query);
  }

  @Get('moderation/pending')
  @RequireAuth()
  @ApiOperation({ summary: 'List pending help requests (admin)' })
  listPending(@CurrentUserId() userId: string) {
    return this.helpRequestsService.listPendingModeration(userId);
  }

  @Get(':id')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get help request by id' })
  findOne(@Param('id') id: string, @Session() session: UserSession | null) {
    return this.helpRequestsService.findById(id, session?.user?.id);
  }

  @Post()
  @RequireAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a help request' })
  @UseInterceptors(multipartInterceptor)
  async create(
    @CurrentUserId() userId: string,
    @Body('payload') payload: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const dto = this.helpRequestsService.parsePayloadJson(payload);
    const uploadedMedia =
      await this.helpRequestsService.mapUploadedFiles(files);
    return this.helpRequestsService.create(userId, dto, uploadedMedia);
  }

  @Patch(':id')
  @RequireAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a help request' })
  @UseInterceptors(multipartInterceptor)
  async update(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body('payload') payload: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const dto = this.helpRequestsService.parsePayloadJson(payload);
    const uploadedMedia =
      await this.helpRequestsService.mapUploadedFiles(files);
    return this.helpRequestsService.update(id, userId, dto, uploadedMedia);
  }

  @Delete(':id')
  @RequireAuth()
  @ApiOperation({ summary: 'Soft-delete a help request' })
  async remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.helpRequestsService.remove(id, userId);
    return { message: 'Help request deleted' };
  }

  @Patch(':id/needs/:lineId/fulfillment')
  @RequireAuth()
  @ApiOperation({ summary: 'Adjust fulfillment for a need line' })
  adjustFulfillment(
    @Param('id') id: string,
    @Param('lineId') lineId: string,
    @CurrentUserId() userId: string,
    @Body() dto: FulfillmentAdjustmentDto,
  ) {
    return this.helpRequestsService.adjustFulfillment(id, lineId, userId, dto);
  }

  @Patch(':id/hide')
  @RequireAuth()
  @ApiOperation({ summary: 'Hide a help request from the active feed (owner)' })
  hide(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.helpRequestsService.hide(id, userId);
  }

  @Patch(':id/restore')
  @RequireAuth()
  @ApiOperation({ summary: 'Restore a hidden help request (owner)' })
  restore(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.helpRequestsService.restore(id, userId);
  }

  @Patch(':id/approve-edit')
  @RequireAuth()
  @ApiOperation({ summary: 'Approve a pending help request edit (admin)' })
  approveEdit(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.helpRequestsService.approveEdit(id, userId);
  }

  @Patch(':id/reject-edit')
  @RequireAuth()
  @ApiOperation({ summary: 'Reject a pending help request edit (admin)' })
  rejectEdit(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body() dto: RejectHelpRequestDto,
  ) {
    return this.helpRequestsService.rejectEdit(id, userId, dto);
  }

  @Patch(':id/approve')
  @RequireAuth()
  @ApiOperation({ summary: 'Approve a pending help request (admin)' })
  approve(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.helpRequestsService.approve(id, userId);
  }

  @Patch(':id/reject')
  @RequireAuth()
  @ApiOperation({ summary: 'Reject a pending help request (admin)' })
  reject(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body() dto: RejectHelpRequestDto,
  ) {
    return this.helpRequestsService.reject(id, userId, dto);
  }
}
