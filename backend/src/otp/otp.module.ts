import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpService } from './otp.service';
import {
  PendingSignup,
  PendingSignupSchema,
} from './schemas/pending-signup.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PendingSignup.name, schema: PendingSignupSchema },
    ]),
  ],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
