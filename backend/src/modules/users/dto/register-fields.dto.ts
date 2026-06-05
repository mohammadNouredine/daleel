import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Documents fields accepted by OTP signup request.
 * Actual validation runs on POST /api/v1/auth/sign-up/request-otp.
 */
export class RegisterFieldsDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, example: 'securePassword123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Full Name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '+96170123456' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '+96170123456' })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;
}
