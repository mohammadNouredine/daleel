import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AuthSignupService } from './auth-signup.service';
import { ResendOtpDto } from './dto/resend-otp.dto';

@ApiTags('Auth (Better Auth)')
@AllowAnonymous()
@Controller('auth')
export class AuthResendOtpController {
  constructor(private readonly authSignupService: AuthSignupService) {}

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend signup verification OTP' })
  @ApiOkResponse({
    description: 'Verification code resent if request is valid',
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
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authSignupService.resendOtp(dto);
  }
}
