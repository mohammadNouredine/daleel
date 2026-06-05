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
  Session,
  AllowAnonymous,
  OptionalAuth,
} from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { createImageUploadInterceptor } from '../../storage/multer/create-image-upload.interceptor';
import { MAX_PROOF_IMAGES } from '../uploads/uploads.constants';
import { FulfillmentAdjustmentDto } from './dto/fulfillment-adjustment.dto';
import { HelpRequestSortQueryDto } from './dto/help-request-sort-query.dto';
import { ListHelpRequestsQueryDto } from './dto/list-help-requests-query.dto';
import { RejectHelpRequestDto } from './dto/reject-help-request.dto';
import { HelpRequestsService } from './help-requests.service';

function requireUserId(session: UserSession | null): string {
  if (!session?.user?.id) {
    throw new UnauthorizedException('Authentication required');
  }
  return session.user.id;
}

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
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List current user help requests' })
  listMine(
    @Session() session: UserSession | null,
    @Query() query: HelpRequestSortQueryDto,
  ) {
    const userId = requireUserId(session);
    return this.helpRequestsService.listMine(userId, query);
  }

  @Get('moderation/pending')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List pending help requests (admin)' })
  listPending(@Session() session: UserSession | null) {
    const userId = requireUserId(session);
    return this.helpRequestsService.listPendingModeration(userId);
  }

  @Get(':id')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get help request by id' })
  findOne(@Param('id') id: string, @Session() session: UserSession | null) {
    return this.helpRequestsService.findById(id, session?.user?.id);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a help request' })
  @UseInterceptors(multipartInterceptor)
  async create(
    @Session() session: UserSession | null,
    @Body('payload') payload: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = requireUserId(session);
    const dto = this.helpRequestsService.parsePayloadJson(payload);
    const uploadedMedia =
      await this.helpRequestsService.mapUploadedFiles(files);
    return this.helpRequestsService.create(userId, dto, uploadedMedia);
  }

  @Patch(':id')
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a help request' })
  @UseInterceptors(multipartInterceptor)
  async update(
    @Param('id') id: string,
    @Session() session: UserSession | null,
    @Body('payload') payload: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = requireUserId(session);
    const dto = this.helpRequestsService.parsePayloadJson(payload);
    const uploadedMedia =
      await this.helpRequestsService.mapUploadedFiles(files);
    return this.helpRequestsService.update(id, userId, dto, uploadedMedia);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Soft-delete a help request' })
  async remove(
    @Param('id') id: string,
    @Session() session: UserSession | null,
  ) {
    const userId = requireUserId(session);
    await this.helpRequestsService.remove(id, userId);
    return { message: 'Help request deleted' };
  }

  @Patch(':id/needs/:lineId/fulfillment')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Adjust fulfillment for a need line' })
  adjustFulfillment(
    @Param('id') id: string,
    @Param('lineId') lineId: string,
    @Session() session: UserSession | null,
    @Body() dto: FulfillmentAdjustmentDto,
  ) {
    const userId = requireUserId(session);
    return this.helpRequestsService.adjustFulfillment(id, lineId, userId, dto);
  }

  @Patch(':id/hide')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Hide a help request from the active feed (owner)' })
  hide(@Param('id') id: string, @Session() session: UserSession | null) {
    const userId = requireUserId(session);
    return this.helpRequestsService.hide(id, userId);
  }

  @Patch(':id/restore')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Restore a hidden help request (owner)' })
  restore(@Param('id') id: string, @Session() session: UserSession | null) {
    const userId = requireUserId(session);
    return this.helpRequestsService.restore(id, userId);
  }

  @Patch(':id/approve-edit')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Approve a pending help request edit (admin)' })
  approveEdit(
    @Param('id') id: string,
    @Session() session: UserSession | null,
  ) {
    const userId = requireUserId(session);
    return this.helpRequestsService.approveEdit(id, userId);
  }

  @Patch(':id/reject-edit')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Reject a pending help request edit (admin)' })
  rejectEdit(
    @Param('id') id: string,
    @Session() session: UserSession | null,
    @Body() dto: RejectHelpRequestDto,
  ) {
    const userId = requireUserId(session);
    return this.helpRequestsService.rejectEdit(id, userId, dto);
  }

  @Patch(':id/approve')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Approve a pending help request (admin)' })
  approve(@Param('id') id: string, @Session() session: UserSession | null) {
    const userId = requireUserId(session);
    return this.helpRequestsService.approve(id, userId);
  }

  @Patch(':id/reject')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Reject a pending help request (admin)' })
  reject(
    @Param('id') id: string,
    @Session() session: UserSession | null,
    @Body() dto: RejectHelpRequestDto,
  ) {
    const userId = requireUserId(session);
    return this.helpRequestsService.reject(id, userId, dto);
  }
}
