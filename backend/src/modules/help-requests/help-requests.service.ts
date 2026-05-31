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
  hasRequestPermission,
} from '../../common/permissions';
import {
  HelpRequestApprovalStatus,
  HelpRequestStatus,
  UserRole,
  Visibility,
} from '../../common/enums';
import { toObjectId } from '../../common/utils/object-id.util';
import { UsersService } from '../users/users.service';
import type { CreateHelpRequestDto } from './dto/create-help-request.dto';
import type { FulfillmentAdjustmentDto } from './dto/fulfillment-adjustment.dto';
import type { ListHelpRequestsQueryDto } from './dto/list-help-requests-query.dto';
import type { RejectHelpRequestDto } from './dto/reject-help-request.dto';
import {
  mapHelpRequestToResponse,
  type HelpRequestResponse,
} from './help-requests.mapper';
import {
  HelpRequest,
  type HelpRequestDocument,
  type NeedLine,
} from './schemas/help-request.schema';

@Injectable()
export class HelpRequestsService {
  constructor(
    @InjectModel(HelpRequest.name)
    private readonly helpRequestModel: Model<HelpRequestDocument>,
    private readonly usersService: UsersService,
  ) {}

  async listPublic(
    query: ListHelpRequestsQueryDto,
  ): Promise<HelpRequestResponse[]> {
    const filter = this.buildListFilter(query, {
      approvalStatus: HelpRequestApprovalStatus.APPROVED,
    });

    const docs = await this.helpRequestModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    return docs.map(mapHelpRequestToResponse);
  }

  async listMine(userId: string): Promise<HelpRequestResponse[]> {
    const docs = await this.helpRequestModel
      .find({
        createdBy: toObjectId(userId),
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();

    return docs.map(mapHelpRequestToResponse);
  }

  async listPendingModeration(userId: string): Promise<HelpRequestResponse[]> {
    await this.assertAdmin(userId);

    const docs = await this.helpRequestModel
      .find({
        approvalStatus: HelpRequestApprovalStatus.PENDING,
        deletedAt: null,
      })
      .sort({ createdAt: 1 })
      .exec();

    return docs.map(mapHelpRequestToResponse);
  }

  async findById(
    id: string,
    viewerId?: string,
  ): Promise<HelpRequestResponse> {
    const doc = await this.findDocumentOrThrow(id);

    const isOwner = viewerId ? doc.createdBy.toHexString() === viewerId : false;
    const isAdmin = viewerId ? await this.isAdmin(viewerId) : false;
    const isApproved =
      doc.approvalStatus === HelpRequestApprovalStatus.APPROVED;

    if (!isApproved && !isOwner && !isAdmin) {
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

    const autoApprove =
      user.role === UserRole.ADMIN ||
      hasRequestPermission(user.permissions, 'write');

    const media = [...(dto.existingMedia ?? []), ...uploadedMedia].slice(
      0,
      8,
    );

    const doc = await this.helpRequestModel.create({
      createdBy: toObjectId(userId),
      title: dto.title.trim(),
      description: dto.description.trim(),
      helpType: dto.helpType,
      subCategory: dto.subCategory,
      priorityLevel: dto.priorityLevel,
      needs: this.buildNeedsFromInput(dto.needs),
      beneficiariesCount: dto.beneficiariesCount,
      location: dto.location,
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

    const media = [...(dto.existingMedia ?? []), ...uploadedMedia].slice(
      0,
      8,
    );

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
    doc.location = dto.location;
    doc.contactPhone = dto.contactPhone?.trim();
    doc.visibility = dto.visibility ?? doc.visibility;
    doc.media = media;

    await doc.save();
    return mapHelpRequestToResponse(doc);
  }

  async remove(id: string, userId: string): Promise<void> {
    const doc = await this.findDocumentOrThrow(id);
    await this.assertCanDelete(doc, userId);
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
    await this.assertAdmin(adminId);
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
    await this.assertAdmin(adminId);
    const doc = await this.findDocumentOrThrow(id);

    doc.approvalStatus = HelpRequestApprovalStatus.REJECTED;
    doc.rejectionReason = dto.reason?.trim() || undefined;
    doc.reviewedBy = toObjectId(adminId);
    doc.reviewedAt = new Date();

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

  mapUploadedFiles(files: Express.Multer.File[] | undefined): string[] {
    return (files ?? []).map(
      (file) => `/api/v1/uploads/files/${file.filename}`,
    );
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
        $in: [
          HelpRequestStatus.ACTIVE,
          HelpRequestStatus.PARTIALLY_FULFILLED,
        ],
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

  private async findDocumentOrThrow(
    id: string,
  ): Promise<HelpRequestDocument> {
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

  private async isAdmin(userId: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    return user?.role === UserRole.ADMIN;
  }

  private async assertAdmin(userId: string): Promise<void> {
    if (!(await this.isAdmin(userId))) {
      throw new ForbiddenException('Admin access required');
    }
  }

  private async assertCanEdit(
    doc: HelpRequestDocument,
    userId: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException('User profile not found');
    }

    const isOwner = doc.createdBy.toHexString() === userId;
    const isAdmin = user.role === UserRole.ADMIN;
    const canEdit = hasRequestPermission(user.permissions, 'edit');

    if (!isAdmin && !(isOwner && canEdit)) {
      throw new ForbiddenException('Not allowed to edit this request');
    }
  }

  private async assertCanDelete(
    doc: HelpRequestDocument,
    userId: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException('User profile not found');
    }

    const isOwner = doc.createdBy.toHexString() === userId;
    const isAdmin = user.role === UserRole.ADMIN;
    const canDelete = hasRequestPermission(user.permissions, 'delete');

    if (!isAdmin && !(isOwner && canDelete)) {
      throw new ForbiddenException('Not allowed to delete this request');
    }
  }

  private async assertCanManage(
    doc: HelpRequestDocument,
    userId: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException('User profile not found');
    }

    const isOwner = doc.createdBy.toHexString() === userId;
    const isAdmin = user.role === UserRole.ADMIN;
    const canManage = hasRequestPermission(user.permissions, 'manage');

    const manageableStatuses = [
      HelpRequestStatus.ACTIVE,
      HelpRequestStatus.PARTIALLY_FULFILLED,
    ];

    if (!manageableStatuses.includes(doc.status)) {
      throw new ForbiddenException('Request is not manageable in this status');
    }

    if (!isAdmin && !(isOwner && canManage)) {
      throw new ForbiddenException('Not allowed to manage this request');
    }
  }
}
