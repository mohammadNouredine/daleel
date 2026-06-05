import { Module } from '@nestjs/common';
import { EmailModule } from '../../email/email.module';
import { OtpModule } from '../../otp/otp.module';
import { UsersModule } from '../users/users.module';
import { AuthSignupController } from './auth-signup.controller';
import { AuthResendOtpController } from './auth-resend-otp.controller';
import { AuthSignupService } from './auth-signup.service';

@Module({
  imports: [OtpModule, EmailModule, UsersModule],
  controllers: [AuthSignupController, AuthResendOtpController],
  providers: [AuthSignupService],
})
export class AuthSignupModule {}
