import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import {
  canAccessResource,
  getModerationQueueScope,
  getScope,
  hasPermission,
  shouldAutoApproveCreatedContent,
} from '../../common/permissions';
import {
  HelpRequestApprovalStatus,
  HelpRequestStatus,
  Visibility,
} from '../../common/enums';
import type { DaleelUser } from '../users/schemas/user.types';
import { toObjectId } from '../../common/utils/object-id.util';
import { StorageService } from '../../storage/storage.service';
import { UsersService } from '../users/users.service';
import type {
  CreateHelpRequestDto,
  LocationDto,
} from './dto/create-help-request.dto';
import type { FulfillmentAdjustmentDto } from './dto/fulfillment-adjustment.dto';
import type { HelpRequestSortQueryDto } from './dto/help-request-sort-query.dto';
import type { ListHelpRequestsQueryDto } from './dto/list-help-requests-query.dto';
import type { RejectHelpRequestDto } from './dto/reject-help-request.dto';
import { sortHelpRequestDocuments } from './utils/help-request-sort.util';
import {
  mapHelpRequestToResponse,
  type HelpRequestResponse,
} from './help-requests.mapper';
import {
  HelpRequest,
  type HelpRequestDocument,
  type NeedLine,
  type PendingHelpRequestEdit,
  type RequestLocation,
} from './schemas/help-request.schema';

@Injectable()
export class HelpRequestsService {
  constructor(
    @InjectModel(HelpRequest.name)
    private readonly helpRequestModel: Model<HelpRequestDocument>,
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  async listPublic(
    query: ListHelpRequestsQueryDto,
  ): Promise<HelpRequestResponse[]> {
    const filter = this.buildListFilter(query, {
      approvalStatus: HelpRequestApprovalStatus.APPROVED,
    });

    const docs = await this.helpRequestModel.find(filter).exec();

    return sortHelpRequestDocuments(docs, query).map(mapHelpRequestToResponse);
  }

  async listMine(
    userId: string,
    query: HelpRequestSortQueryDto = {},
  ): Promise<HelpRequestResponse[]> {
    const user = await this.getUserOrThrow(userId);
    if (!hasPermission(user, 'requests.read')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const docs = await this.helpRequestModel
      .find({
        createdBy: toObjectId(userId),
        deletedAt: null,
      })
      .exec();

    return sortHelpRequestDocuments(docs, query).map(mapHelpRequestToResponse);
  }

  async listPendingModeration(userId: string): Promise<HelpRequestResponse[]> {
    const user = await this.getUserOrThrow(userId);
    if (getModerationQueueScope(user, 'helpRequest') === 'none') {
      throw new ForbiddenException('Insufficient permissions');
    }

    const docs = await this.helpRequestModel
      .find({
        deletedAt: null,
        $or: [
          { approvalStatus: HelpRequestApprovalStatus.PENDING },
          { pendingEdit: { $ne: null } },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();

    return docs.map(mapHelpRequestToResponse);
  }

  async findById(id: string, viewerId?: string): Promise<HelpRequestResponse> {
    const doc = await this.findDocumentOrThrow(id);

    const isApproved =
      doc.approvalStatus === HelpRequestApprovalStatus.APPROVED;

    if (!viewerId) {
      if (!isApproved) {
        throw new NotFoundException('Help request not found');
      }
      return mapHelpRequestToResponse(doc);
    }

    const user = await this.getUserOrThrow(viewerId);
    if (!this.canViewHelpRequest(user, viewerId, doc)) {
      throw new NotFoundException('Help request not found');
    }

    return mapHelpRequestToResponse(doc);
  }

  async create(
    userId: string,
    dto: CreateHelpRequestDto,
    uploadedMedia: string[] = [],
  ): Promise<HelpRequestResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException('User profile not found');
    }

    if (!hasPermission(user, 'requests.write')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const autoApprove = shouldAutoApproveCreatedContent(user);

    const media = [...(dto.existingMedia ?? []), ...uploadedMedia].slice(0, 8);

    const doc = await this.helpRequestModel.create({
      createdBy: toObjectId(userId),
      title: dto.title.trim(),
      description: dto.description.trim(),
      helpType: dto.helpType,
      subCategory: dto.subCategory,
      priorityLevel: dto.priorityLevel,
      needs: this.buildNeedsFromInput(dto.needs),
      beneficiariesCount: dto.beneficiariesCount,
      location: this.resolveLocation(dto.location),
      contactPhone: dto.contactPhone?.trim(),
      visibility: dto.visibility ?? Visibility.PUBLIC,
      media,
      approvalStatus: autoApprove
        ? HelpRequestApprovalStatus.APPROVED
        : HelpRequestApprovalStatus.PENDING,
      deletedAt: null,
    });

    return mapHelpRequestToResponse(doc);
  }

  async update(
    id: string,
    userId: string,
    dto: CreateHelpRequestDto,
    uploadedMedia: string[] = [],
  ): Promise<HelpRequestResponse> {
    const doc = await this.findDocumentOrThrow(id);
    await this.assertCanEdit(doc, userId);

    const user = await this.getUserOrThrow(userId);
    const media = [...(dto.existingMedia ?? []), ...uploadedMedia].slice(0, 8);

    if (this.shouldStageOwnerEdit(user, userId, doc)) {
      if (doc.pendingEdit) {
        throw new BadRequestException(
          'An edit is already pending review for this request',
        );
      }

      const previousNeeds = new Map(
        (doc.needs ?? []).map((line) => [line.id, line.fulfilled]),
      );

      doc.pendingEdit = this.buildPendingEdit(dto, media, previousNeeds);
      await doc.save();
      return mapHelpRequestToResponse(doc);
    }

    await this.applyDirectUpdate(doc, dto, media, userId);
    await doc.save();
    return mapHelpRequestToResponse(doc);
  }

  async hide(id: string, userId: string): Promise<HelpRequestResponse> {
    const doc = await this.findDocumentOrThrow(id);
    await this.assertCanDelete(doc, userId);

    const hideableStatuses = [
      HelpRequestStatus.ACTIVE,
      HelpRequestStatus.PARTIALLY_FULFILLED,
    ];

    if (!hideableStatuses.includes(doc.status)) {
      throw new BadRequestException('Only active requests can be hidden');
    }

    await this.clearPendingEdit(doc);
    doc.status = HelpRequestStatus.CANCELLED;
    await doc.save();
    return mapHelpRequestToResponse(doc);
  }

  async restore(id: string, userId: string): Promise<HelpRequestResponse> {
    const doc = await this.findDocumentOrThrow(id);
    await this.assertCanDelete(doc, userId);

    if (doc.status !== HelpRequestStatus.CANCELLED) {
      throw new BadRequestException('Only hidden requests can be restored');
    }

    doc.status = HelpRequestStatus.ACTIVE;
    await doc.save();
    return mapHelpRequestToResponse(doc);
  }

  async remove(id: string, userId: string): Promise<void> {
    const doc = await this.findDocumentOrThrow(id);
    await this.assertCanDelete(doc, userId);
    await this.clearPendingEdit(doc);
    await this.storageService.deleteByUrls(doc.media ?? []);
    doc.deletedAt = new Date();
    await doc.save();
  }

  async adjustFulfillment(
    id: string,
    lineId: string,
    userId: string,
    dto: FulfillmentAdjustmentDto,
  ): Promise<HelpRequestResponse> {
    const doc = await this.findDocumentOrThrow(id);
    await this.assertCanManage(doc, userId);

    const needs = (doc.needs ?? []).map((line) => {
      const plain = this.toPlainNeedLine(line);
      if (plain.id !== lineId) return plain;

      let fulfilled = plain.fulfilled;
      if (dto.adjustmentType === 'add') {
        fulfilled += dto.amount;
      } else if (dto.adjustmentType === 'remove') {
        fulfilled -= dto.amount;
      } else {
        fulfilled = dto.amount;
      }

      return this.normalizeNeedLine({ ...plain, fulfilled });
    });

    const lineExists = needs.some((line) => line.id === lineId);
    if (!lineExists) {
      throw new NotFoundException('Need line not found');
    }

    doc.needs = needs;
    await doc.save();
    return mapHelpRequestToResponse(doc);
  }

  async approve(id: string, adminId: string): Promise<HelpRequestResponse> {
    await this.assertCanVerify(adminId);
    const doc = await this.findDocumentOrThrow(id);

    doc.approvalStatus = HelpRequestApprovalStatus.APPROVED;
    doc.rejectionReason = undefined;
    doc.reviewedBy = toObjectId(adminId);
    doc.reviewedAt = new Date();

    await doc.save();
    return mapHelpRequestToResponse(doc);
  }

  async reject(
    id: string,
    adminId: string,
    dto: RejectHelpRequestDto,
  ): Promise<HelpRequestResponse> {
    await this.assertCanVerify(adminId);
    const doc = await this.findDocumentOrThrow(id);

    doc.approvalStatus = HelpRequestApprovalStatus.REJECTED;
    doc.rejectionReason = dto.reason?.trim() || undefined;
    doc.reviewedBy = toObjectId(adminId);
    doc.reviewedAt = new Date();

    await doc.save();
    return mapHelpRequestToResponse(doc);
  }

  async approveEdit(id: string, adminId: string): Promise<HelpRequestResponse> {
    await this.assertCanVerify(adminId);
    const doc = await this.findDocumentOrThrow(id);

    if (!doc.pendingEdit) {
      throw new BadRequestException('No pending edit to approve');
    }

    const pending = doc.pendingEdit;
    const oldMedia = doc.media ?? [];
    const newMedia = pending.media ?? [];
    const newMediaSet = new Set(newMedia);
    const removedLiveMedia = oldMedia.filter((url) => !newMediaSet.has(url));

    doc.title = pending.title;
    doc.description = pending.description;
    doc.helpType = pending.helpType;
    doc.subCategory = pending.subCategory;
    doc.priorityLevel = pending.priorityLevel;
    doc.needs = pending.needs ?? [];
    doc.beneficiariesCount = pending.beneficiariesCount;
    doc.location = pending.location;
    doc.contactPhone = pending.contactPhone;
    doc.visibility = pending.visibility;
    doc.media = newMedia;
    doc.pendingEdit = null;
    doc.approvalStatus = HelpRequestApprovalStatus.APPROVED;
    doc.rejectionReason = undefined;
    doc.reviewedBy = toObjectId(adminId);
    doc.reviewedAt = new Date();

    await this.storageService.deleteByUrls(removedLiveMedia);
    await doc.save();
    return mapHelpRequestToResponse(doc);
  }

  async rejectEdit(
    id: string,
    adminId: string,
    _dto: RejectHelpRequestDto,
  ): Promise<HelpRequestResponse> {
    await this.assertCanVerify(adminId);
    const doc = await this.findDocumentOrThrow(id);

    if (!doc.pendingEdit) {
      throw new BadRequestException('No pending edit to reject');
    }

    await this.clearPendingEdit(doc);
    await doc.save();
    return mapHelpRequestToResponse(doc);
  }

  parsePayloadJson(raw: string): CreateHelpRequestDto {
    try {
      return JSON.parse(raw) as CreateHelpRequestDto;
    } catch {
      throw new BadRequestException('Invalid payload JSON');
    }
  }

  async mapUploadedFiles(
    files: Express.Multer.File[] | undefined,
  ): Promise<string[]> {
    return this.storageService.uploadFilesFromMulter(files, 'help-requests');
  }

  private buildListFilter(
    query: ListHelpRequestsQueryDto,
    base: Record<string, unknown>,
  ) {
    const filter: Record<string, unknown> = {
      deletedAt: null,
      ...base,
    };

    if (query.helpType) {
      filter.helpType = query.helpType;
    }

    if (query.governorate && query.governorate !== 'all') {
      filter['location.governorate'] = query.governorate;
    }

    if (query.priority) {
      filter.priorityLevel = query.priority;
    }

    if (query.view === 'archive') {
      filter.status = {
        $in: [
          HelpRequestStatus.FULFILLED,
          HelpRequestStatus.EXPIRED,
          HelpRequestStatus.CANCELLED,
        ],
      };
    } else if (query.view === 'active') {
      filter.status = {
        $in: [HelpRequestStatus.ACTIVE, HelpRequestStatus.PARTIALLY_FULFILLED],
      };
    }

    return filter;
  }

  private buildNeedsFromInput(
    inputs: CreateHelpRequestDto['needs'],
    previousFulfillment?: Map<string, number>,
  ): NeedLine[] {
    return inputs.map((input) => {
      const id = input.id?.trim() || `need_${randomUUID().slice(0, 8)}`;
      const required = Math.max(0, input.required);
      const previous = previousFulfillment?.get(id) ?? 0;

      return this.normalizeNeedLine({
        id,
        label: input.label,
        required,
        fulfilled: Math.min(previous, required),
        unit: input.unit,
        kind: input.kind,
        notes: input.notes,
      });
    });
  }

  private resolveLocation(location?: LocationDto): RequestLocation | undefined {
    if (!location) {
      return undefined;
    }

    const governorate = location.governorate?.trim();
    const district = location.district?.trim();
    const city = location.city?.trim();
    const street = location.street?.trim();
    const coordinates = location.coordinates;

    if (!governorate && !district && !city && !street && !coordinates) {
      return undefined;
    }

    return {
      governorate,
      district,
      city,
      street,
      coordinates,
    };
  }

  private toPlainNeedLine(line: NeedLine): NeedLine {
    return {
      id: line.id,
      label: line.label,
      required: line.required,
      fulfilled: line.fulfilled,
      unit: line.unit,
      kind: line.kind,
      notes: line.notes,
    };
  }

  private normalizeNeedLine(line: NeedLine): NeedLine {
    const required = Math.max(0, line.required);
    const fulfilled = Math.max(0, Math.min(required, line.fulfilled));
    return {
      ...line,
      label: line.label.trim(),
      required,
      fulfilled,
      unit: line.unit?.trim() || undefined,
      notes: line.notes?.trim() || undefined,
    };
  }

  private async findDocumentOrThrow(id: string): Promise<HelpRequestDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Help request not found');
    }

    const doc = await this.helpRequestModel.findOne({
      _id: toObjectId(id),
      deletedAt: null,
    });

    if (!doc) {
      throw new NotFoundException('Help request not found');
    }

    return doc;
  }

  private async getUserOrThrow(userId: string): Promise<DaleelUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException('User profile not found');
    }
    return user;
  }

  private canViewHelpRequest(
    user: DaleelUser,
    userId: string,
    doc: HelpRequestDocument,
  ): boolean {
    const isApproved =
      doc.approvalStatus === HelpRequestApprovalStatus.APPROVED;
    if (isApproved) {
      return true;
    }

    return canAccessResource(user, userId, 'helpRequest', 'requests.read', {
      resource: { createdBy: doc.createdBy.toHexString() },
      allowOwnerWithoutPermission: true,
    });
  }

  private async assertCanVerify(userId: string): Promise<void> {
    const user = await this.getUserOrThrow(userId);
    if (!hasPermission(user, 'requests.verify')) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  private async assertCanEdit(
    doc: HelpRequestDocument,
    userId: string,
  ): Promise<void> {
    const user = await this.getUserOrThrow(userId);
    if (
      !canAccessResource(user, userId, 'helpRequest', 'requests.edit', {
        resource: { createdBy: doc.createdBy.toHexString() },
        allowOwnerWithoutPermission: true,
      })
    ) {
      throw new ForbiddenException('Not allowed to edit this request');
    }
  }

  private async assertCanDelete(
    doc: HelpRequestDocument,
    userId: string,
  ): Promise<void> {
    const user = await this.getUserOrThrow(userId);
    if (
      !canAccessResource(user, userId, 'helpRequest', 'requests.delete', {
        resource: { createdBy: doc.createdBy.toHexString() },
        allowOwnerWithoutPermission: true,
      })
    ) {
      throw new ForbiddenException('Not allowed to delete this request');
    }
  }

  private async assertCanManage(
    doc: HelpRequestDocument,
    userId: string,
  ): Promise<void> {
    const user = await this.getUserOrThrow(userId);

    const manageableStatuses = [
      HelpRequestStatus.ACTIVE,
      HelpRequestStatus.PARTIALLY_FULFILLED,
    ];

    if (!manageableStatuses.includes(doc.status)) {
      throw new ForbiddenException('Request is not manageable in this status');
    }

    const manageScope = getScope(user, 'helpRequest', 'requests.manage');
    const isOwner = doc.createdBy.toHexString() === userId;

    if (manageScope === 'platform') {
      return;
    }

    if (isOwner) {
      return;
    }

    if (hasPermission(user, 'requests.manage')) {
      return;
    }

    throw new ForbiddenException('Not allowed to manage this request');
  }

  private shouldStageOwnerEdit(
    user: DaleelUser,
    userId: string,
    doc: HelpRequestDocument,
  ): boolean {
    const isOwner = doc.createdBy.toHexString() === userId;
    if (!isOwner) {
      return false;
    }

    if (doc.approvalStatus !== HelpRequestApprovalStatus.APPROVED) {
      return false;
    }

    if (shouldAutoApproveCreatedContent(user)) {
      return false;
    }

    const editScope = getScope(user, 'helpRequest', 'requests.edit');
    return editScope === 'none';
  }

  private buildPendingEdit(
    dto: CreateHelpRequestDto,
    media: string[],
    previousFulfillment: Map<string, number>,
  ): PendingHelpRequestEdit {
    return {
      title: dto.title.trim(),
      description: dto.description.trim(),
      helpType: dto.helpType,
      subCategory: dto.subCategory,
      priorityLevel: dto.priorityLevel,
      needs: this.buildNeedsFromInput(dto.needs, previousFulfillment),
      beneficiariesCount: dto.beneficiariesCount,
      location: this.resolveLocation(dto.location),
      contactPhone: dto.contactPhone?.trim(),
      visibility: dto.visibility ?? Visibility.PUBLIC,
      media,
      submittedAt: new Date(),
    };
  }

  private async applyDirectUpdate(
    doc: HelpRequestDocument,
    dto: CreateHelpRequestDto,
    media: string[],
    userId: string,
  ): Promise<void> {
    const oldMedia = doc.media ?? [];
    const newMediaSet = new Set(media);
    const removedMedia = oldMedia.filter((url) => !newMediaSet.has(url));
    await this.storageService.deleteByUrls(removedMedia);

    const previousNeeds = new Map(
      (doc.needs ?? []).map((line) => [line.id, line.fulfilled]),
    );

    doc.title = dto.title.trim();
    doc.description = dto.description.trim();
    doc.helpType = dto.helpType;
    doc.subCategory = dto.subCategory;
    doc.priorityLevel = dto.priorityLevel;
    doc.needs = this.buildNeedsFromInput(dto.needs, previousNeeds);
    doc.beneficiariesCount = dto.beneficiariesCount;
    doc.location = this.resolveLocation(dto.location);
    doc.contactPhone = dto.contactPhone?.trim();
    doc.visibility = dto.visibility ?? doc.visibility;
    doc.media = media;

    const isOwner = doc.createdBy.toHexString() === userId;
    if (
      isOwner &&
      doc.approvalStatus === HelpRequestApprovalStatus.REJECTED
    ) {
      doc.approvalStatus = HelpRequestApprovalStatus.PENDING;
      doc.rejectionReason = undefined;
    }
  }

  private async clearPendingEdit(doc: HelpRequestDocument): Promise<void> {
    if (!doc.pendingEdit) {
      return;
    }

    const liveMedia = new Set(doc.media ?? []);
    const stagedOnlyMedia = (doc.pendingEdit.media ?? []).filter(
      (url) => !liveMedia.has(url),
    );
    await this.storageService.deleteByUrls(stagedOnlyMedia);
    doc.pendingEdit = null;
  }
}
