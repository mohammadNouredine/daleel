import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { mongoDb } from '../../database/mongo-client';
import { toObjectId } from '../../common/utils/object-id.util';
import {
  defaultPermissionsForRole,
  hasPermission,
} from '../../common/permissions';
import { UserRole, VerificationStatus } from '../../common/enums';
import { registerUserProfileSetup } from './users-profile.registry';
import { mapDocumentToUser } from './users.mapper';
import type { DaleelUser, UserPermissions } from './schemas/user.types';
import { USERS_COLLECTION } from './schemas/user.types';
import type { ListUsersQueryDto } from './dto/list-users-query.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UpdateUserPermissionsDto } from './dto/user-permissions.dto';
import type { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { sanitizeUser } from '../../common/utils/sanitize-user';
import {
  mapUserToAdminResponse,
  type AdminUserResponse,
} from './users-admin.mapper';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class UsersService {
  constructor(private readonly storageService: StorageService) {
    registerUserProfileSetup(async (_id, role) => {
      await this.applyDefaultProfile(_id, role);
    });
  }

  async findById(_id: string): Promise<DaleelUser | null> {
    const record = await mongoDb
      .collection(USERS_COLLECTION)
      .findOne({ _id: toObjectId(_id) });
    return record ? mapDocumentToUser(record) : null;
  }

  async findByEmail(email: string): Promise<DaleelUser | null> {
    const record = await mongoDb.collection(USERS_COLLECTION).findOne({
      email: email.trim().toLowerCase(),
    });
    return record ? mapDocumentToUser(record) : null;
  }

  async applyDefaultProfile(
    _id: string,
    role: UserRole = UserRole.USER,
  ): Promise<void> {
    await mongoDb.collection(USERS_COLLECTION).updateOne(
      { _id: toObjectId(_id) },
      {
        $set: {
          role,
          permissions: defaultPermissionsForRole(role),
          isVerified: false,
          verificationStatus: VerificationStatus.UNVERIFIED,
          isActive: true,
        },
      },
    );
  }

  async promoteToAdmin(_id: string): Promise<DaleelUser> {
    const objectId = toObjectId(_id);

    await mongoDb.collection(USERS_COLLECTION).updateOne(
      { _id: objectId },
      {
        $set: {
          role: UserRole.ADMIN,
          permissions: defaultPermissionsForRole(UserRole.ADMIN),
          isVerified: true,
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
    );

    const record = await mongoDb
      .collection(USERS_COLLECTION)
      .findOne({ _id: objectId });
    if (!record) {
      throw new Error(`User not found: ${_id}`);
    }

    const user = mapDocumentToUser(record);
    if (!user) {
      throw new Error(`User not found: ${_id}`);
    }
    return user;
  }

  async promoteToAdminByEmail(email: string): Promise<DaleelUser> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error(`User not found for email: ${email}`);
    }
    return this.promoteToAdmin(user._id);
  }

  async listForAdmin(
    actorId: string,
    query: ListUsersQueryDto,
  ): Promise<{ items: AdminUserResponse[]; nextLastId: string | null }> {
    const actor = await this.requireUser(actorId);
    if (!hasPermission(actor, 'users.read')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const limit = Math.min(query.limit ?? 20, 100);
    const filter: Record<string, unknown> = {};

    if (query.role) {
      filter.role = query.role;
    }

    const search = query.q?.trim();
    if (search) {
      const pattern = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      filter.$or = [{ name: pattern }, { email: pattern }];
    }

    if (query.lastId) {
      if (!ObjectId.isValid(query.lastId)) {
        return { items: [], nextLastId: null };
      }
      filter._id = { $lt: toObjectId(query.lastId) };
    }

    const records = await mongoDb
      .collection(USERS_COLLECTION)
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .toArray();

    const hasMore = records.length > limit;
    const page = hasMore ? records.slice(0, limit) : records;
    const items = page
      .map((record) => mapDocumentToUser(record))
      .filter((user): user is DaleelUser => user != null)
      .map(mapUserToAdminResponse);

    const nextLastId =
      hasMore && items.length > 0 ? items[items.length - 1]._id : null;

    return { items, nextLastId };
  }

  async findByIdForAdmin(
    actorId: string,
    targetId: string,
  ): Promise<AdminUserResponse> {
    const actor = await this.requireUser(actorId);
    if (!hasPermission(actor, 'users.read')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.findById(targetId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return mapUserToAdminResponse(user);
  }

  async updateForAdmin(
    actorId: string,
    targetId: string,
    dto: UpdateUserDto,
  ): Promise<AdminUserResponse> {
    const actor = await this.requireUser(actorId);
    if (!hasPermission(actor, 'users.edit')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const existing = await this.findById(targetId);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const update: Record<string, unknown> = {};

    if (dto.fullName !== undefined) {
      update.name = dto.fullName.trim();
    }

    if (dto.isActive !== undefined) {
      update.isActive = dto.isActive;
    }

    if (dto.isVerified !== undefined) {
      update.isVerified = dto.isVerified;
      if (dto.isVerified) {
        update.verificationStatus = VerificationStatus.VERIFIED;
      }
    }

    if (dto.role !== undefined && dto.role !== existing.role) {
      update.role = dto.role;
      update.permissions = defaultPermissionsForRole(dto.role);
    }

    if (Object.keys(update).length === 0) {
      return mapUserToAdminResponse(existing);
    }

    update.updatedAt = new Date();

    await mongoDb
      .collection(USERS_COLLECTION)
      .updateOne({ _id: toObjectId(targetId) }, { $set: update });

    const updated = await this.findById(targetId);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return mapUserToAdminResponse(updated);
  }

  async updateOwnProfile(
    userId: string,
    dto: UpdateMyProfileDto,
  ): Promise<ReturnType<typeof sanitizeUser>> {
    const existing = await this.findById(userId);
    if (!existing) {
      throw new NotFoundException('User profile not found');
    }

    const update: Record<string, unknown> = {};

    if (dto.fullName !== undefined) {
      update.name = dto.fullName.trim();
    }

    if (dto.phoneNumber !== undefined) {
      update.phoneNumber = dto.phoneNumber?.trim() || null;
    }

    if (dto.whatsappNumber !== undefined) {
      update.whatsappNumber = dto.whatsappNumber?.trim() || null;
    }

    if (dto.profileImage !== undefined) {
      const previousImage = existing.profileImage ?? existing.image;
      update.profileImage = dto.profileImage;
      update.image = dto.profileImage;

      if (
        previousImage &&
        previousImage !== dto.profileImage &&
        this.storageService.isManagedUrl(previousImage)
      ) {
        await this.storageService.deleteByUrls([previousImage]);
      }
    }

    if (Object.keys(update).length === 0) {
      return sanitizeUser(existing);
    }

    update.updatedAt = new Date();

    await mongoDb
      .collection(USERS_COLLECTION)
      .updateOne({ _id: toObjectId(userId) }, { $set: update });

    const updated = await this.findById(userId);
    if (!updated) {
      throw new NotFoundException('User profile not found');
    }

    return sanitizeUser(updated);
  }

  async updatePermissionsForAdmin(
    actorId: string,
    targetId: string,
    dto: UpdateUserPermissionsDto,
  ): Promise<AdminUserResponse> {
    const actor = await this.requireUser(actorId);
    if (!hasPermission(actor, 'users.managePermissions')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const existing = await this.findById(targetId);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const permissions: UserPermissions = {
      requests: { ...dto.requests },
      properties: { ...dto.properties },
      users: { ...dto.users },
    };

    await mongoDb
      .collection(USERS_COLLECTION)
      .updateOne(
        { _id: toObjectId(targetId) },
        { $set: { permissions, updatedAt: new Date() } },
      );

    const updated = await this.findById(targetId);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return mapUserToAdminResponse(updated);
  }

  async deleteForAdmin(actorId: string, targetId: string): Promise<void> {
    const actor = await this.requireUser(actorId);
    if (!hasPermission(actor, 'users.delete')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (actorId === targetId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const existing = await this.findById(targetId);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (existing.role === UserRole.ADMIN) {
      const adminCount = await mongoDb
        .collection(USERS_COLLECTION)
        .countDocuments({
          role: UserRole.ADMIN,
        });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin account');
      }
    }

    await mongoDb.collection(USERS_COLLECTION).deleteOne({
      _id: toObjectId(targetId),
    });
  }

  private async requireUser(userId: string): Promise<DaleelUser> {
    const user = await this.findById(userId);
    if (!user) {
      throw new ForbiddenException('User profile not found');
    }
    return user;
  }
}
