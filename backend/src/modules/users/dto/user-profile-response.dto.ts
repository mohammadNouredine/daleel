import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RequestPermissionsDto {
  @ApiProperty({ description: 'View help requests' })
  read: boolean;

  @ApiProperty({ description: 'Create new help requests' })
  write: boolean;

  @ApiProperty({ description: 'Update existing help requests' })
  edit: boolean;

  @ApiProperty({ description: 'Verify help requests (anti-fraud / moderation)' })
  verify: boolean;

  @ApiProperty({ description: 'Full management (assign, admin actions)' })
  manage: boolean;

  @ApiProperty({ description: 'Delete help requests' })
  delete: boolean;
}

class PropertyPermissionsDto {
  @ApiProperty()
  canViewProperties: boolean;

  @ApiProperty()
  canEditProperty: boolean;

  @ApiProperty()
  canDeleteProperty: boolean;

  @ApiProperty()
  canHideProperty: boolean;

  @ApiProperty()
  canApproveProperty: boolean;

  @ApiProperty()
  canRejectProperty: boolean;
}

class UserPermissionsDto {
  @ApiProperty({ type: RequestPermissionsDto })
  requests: RequestPermissionsDto;

  @ApiProperty({ type: PropertyPermissionsDto })
  properties: PropertyPermissionsDto;
}

class UserLocationDto {
  @ApiPropertyOptional()
  governorate?: string;

  @ApiPropertyOptional()
  district?: string;

  @ApiPropertyOptional()
  city?: string;
}

class DaleelProfileDto {
  @ApiProperty({ description: 'MongoDB ObjectId (hex)' })
  _id: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiProperty({ enum: ['USER', 'VOLUNTEER', 'ORGANIZATION', 'ADMIN'] })
  role: string;

  @ApiProperty({ type: UserPermissionsDto })
  permissions: UserPermissionsDto;

  @ApiPropertyOptional({ type: UserLocationDto })
  location?: UserLocationDto;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  isActive: boolean;
}

export class UserProfileResponseDto {
  @ApiProperty({ description: 'Better Auth session payload' })
  session: Record<string, unknown>;

  @ApiProperty({ type: DaleelProfileDto })
  profile: DaleelProfileDto;
}
