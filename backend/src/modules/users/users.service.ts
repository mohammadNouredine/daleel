import { Injectable } from '@nestjs/common';
import { mongoDb } from '../../database/mongo-client';
import { toObjectId } from '../../common/utils/object-id.util';
import { defaultPermissionsForRole } from '../../common/permissions';
import { UserRole, VerificationStatus } from '../../common/enums';
import { registerUserProfileSetup } from './users-profile.registry';
import { mapDocumentToUser } from './users.mapper';
import type { DaleelUser } from './schemas/user.types';
import { USERS_COLLECTION } from './schemas/user.types';

@Injectable()
export class UsersService {
  constructor() {
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

    const record = await mongoDb.collection(USERS_COLLECTION).findOne({ _id: objectId });
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
}
