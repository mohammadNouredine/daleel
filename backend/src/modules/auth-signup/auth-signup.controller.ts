import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AuthSignupService } from './auth-signup.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Auth (Better Auth)')
@AllowAnonymous()
@Controller('auth/sign-up')
export class AuthSignupController {
  constructor(private readonly authSignupService: AuthSignupService) {}

  @Post('request-otp')
  @ApiOperation({ summary: 'Request signup verification OTP' })
  @ApiOkResponse({
    description: 'Verification code sent if request is valid',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'If the request is valid, a verification code has been sent.',
        },
      },
    },
  })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authSignupService.requestOtp(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and create account' })
  @ApiOkResponse({
    description: 'Account created; session token returned',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            token: { type: 'string', nullable: true },
            user: { type: 'object' },
          },
        },
        message: { type: 'string', example: '' },
      },
    },
  })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authSignupService.verifyOtp(dto);
  }
}
