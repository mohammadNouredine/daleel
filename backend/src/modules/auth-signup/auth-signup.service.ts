import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { auth } from '../../auth/auth';
import { INTERNAL_SIGNUP_HEADER } from '../../auth/block-direct-signup.plugin';
import { EmailService } from '../../email/email.service';
import {
  GENERIC_OTP_SENT_MESSAGE,
  GENERIC_RESEND_MESSAGE,
  OTP_EXPIRY_MINUTES,
} from '../../otp/otp.constants';
import { OtpService } from '../../otp/otp.service';
import type { SignupPayload } from '../../otp/otp.types';
import { UsersService } from '../users/users.service';
import { classifySignUpError } from '../users/admin-seed.utils';
import type { RequestOtpDto } from './dto/request-otp.dto';
import type { ResendOtpDto } from './dto/resend-otp.dto';
import type { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthSignupService {
  private readonly logger = new Logger(AuthSignupService.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  async requestOtp(dto: RequestOtpDto): Promise<{ message: string }> {
    const email = this.otpService.normalizeEmail(dto.email);
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      return { message: GENERIC_OTP_SENT_MESSAGE };
    }

    try {
      const { otp } = await this.otpService.createOrReplacePendingSignup({
        email: dto.email,
        password: dto.password,
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        whatsappNumber: dto.whatsappNumber,
      });

      await this.emailService.sendVerificationCode({
        to: email,
        name: dto.name.trim(),
        otp,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      });
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === 429) {
        throw error;
      }
      this.logger.error('Failed to send verification email', error);
      throw new BadRequestException('Unable to send verification code.');
    }

    return { message: GENERIC_OTP_SENT_MESSAGE };
  }

  async resendOtp(dto: ResendOtpDto): Promise<{ message: string }> {
    const email = this.otpService.normalizeEmail(dto.email);
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      return { message: GENERIC_RESEND_MESSAGE };
    }

    const pending = await this.otpService.findPendingByEmail(email);
    if (!pending) {
      return { message: GENERIC_RESEND_MESSAGE };
    }

    try {
      const { otp } = await this.otpService.resendOtp(email);

      await this.emailService.sendVerificationCode({
        to: email,
        name: pending.signupData.name,
        otp,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      });
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === 429) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        return { message: GENERIC_RESEND_MESSAGE };
      }
      this.logger.error('Failed to resend verification email', error);
      throw new BadRequestException('Unable to resend verification code.');
    }

    return { message: GENERIC_RESEND_MESSAGE };
  }

  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<{ data: unknown; message: string }> {
    const signupData = await this.otpService.verifyAndConsume(
      dto.email,
      dto.otp,
    );

    const authResponse = await this.createUserViaBetterAuth(signupData);

    this.sendWelcomeEmailSafe(signupData).catch((error) => {
      this.logger.warn('Welcome email failed after signup', error);
    });

    return {
      data: authResponse,
      message: '',
    };
  }

  private async createUserViaBetterAuth(
    signupData: SignupPayload,
  ): Promise<{ token: string | null; user: unknown }> {
    const internalSecret =
      process.env.INTERNAL_SIGNUP_SECRET ?? process.env.BETTER_AUTH_SECRET;

    const body: Record<string, string> = {
      email: signupData.email,
      password: signupData.password,
      name: signupData.name,
    };

    if (signupData.phoneNumber) {
      body.phoneNumber = signupData.phoneNumber;
    }
    if (signupData.whatsappNumber) {
      body.whatsappNumber = signupData.whatsappNumber;
    }

    try {
      const result = await auth.api.signUpEmail({
        body: body as {
          email: string;
          password: string;
          name: string;
          phoneNumber?: string;
          whatsappNumber?: string;
        },
        headers: new Headers({
          [INTERNAL_SIGNUP_HEADER]: internalSecret ?? '',
        }),
      });

      return {
        token: result.token ?? null,
        user: result.user,
      };
    } catch (error) {
      const classified = classifySignUpError(error);

      if (classified.userAlreadyExists) {
        throw new BadRequestException(
          'An account with this email already exists.',
        );
      }

      this.logger.error(
        'Better Auth signup failed after OTP verification',
        error,
      );
      throw new BadRequestException(
        'Unable to create account. Please try again.',
      );
    }
  }

  private async sendWelcomeEmailSafe(signupData: SignupPayload): Promise<void> {
    await this.emailService.sendWelcomeEmail({
      to: signupData.email,
      name: signupData.name,
    });
  }
}
