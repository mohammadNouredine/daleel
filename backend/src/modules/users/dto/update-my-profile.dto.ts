import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MinLength, ValidateIf } from 'class-validator';

export class UpdateMyProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  fullName?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  phoneNumber?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  whatsappNumber?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Profile image URL from POST /uploads/profile-image',
  })
  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsUrl()
  profileImage?: string | null;
}
