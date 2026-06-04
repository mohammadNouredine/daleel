import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, ValidateNested } from 'class-validator';

class RequestPermissionsDto {
  @ApiProperty()
  @IsBoolean()
  read: boolean;

  @ApiProperty()
  @IsBoolean()
  write: boolean;

  @ApiProperty()
  @IsBoolean()
  edit: boolean;

  @ApiProperty()
  @IsBoolean()
  verify: boolean;

  @ApiProperty()
  @IsBoolean()
  manage: boolean;

  @ApiProperty()
  @IsBoolean()
  delete: boolean;
}

class PropertyPermissionsDto {
  @ApiProperty()
  @IsBoolean()
  canViewProperties: boolean;

  @ApiProperty()
  @IsBoolean()
  canEditProperty: boolean;

  @ApiProperty()
  @IsBoolean()
  canDeleteProperty: boolean;

  @ApiProperty()
  @IsBoolean()
  canHideProperty: boolean;

  @ApiProperty()
  @IsBoolean()
  canApproveProperty: boolean;

  @ApiProperty()
  @IsBoolean()
  canRejectProperty: boolean;

  @ApiProperty()
  @IsBoolean()
  canPermanentlyDeleteProperty: boolean;
}

class UserAdminPermissionsDto {
  @ApiProperty()
  @IsBoolean()
  read: boolean;

  @ApiProperty()
  @IsBoolean()
  edit: boolean;

  @ApiProperty()
  @IsBoolean()
  delete: boolean;

  @ApiProperty()
  @IsBoolean()
  managePermissions: boolean;
}

export class UpdateUserPermissionsDto {
  @ApiProperty({ type: RequestPermissionsDto })
  @ValidateNested()
  @Type(() => RequestPermissionsDto)
  requests: RequestPermissionsDto;

  @ApiProperty({ type: PropertyPermissionsDto })
  @ValidateNested()
  @Type(() => PropertyPermissionsDto)
  properties: PropertyPermissionsDto;

  @ApiProperty({ type: UserAdminPermissionsDto })
  @ValidateNested()
  @Type(() => UserAdminPermissionsDto)
  users: UserAdminPermissionsDto;
}
