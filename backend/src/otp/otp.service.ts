import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { Model } from 'mongoose';
import {
  OTP_EXPIRY_MINUTES,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_RESEND_COOLDOWN_SECONDS,
} from './otp.constants';
import type { OtpIssueResult, SignupPayload } from './otp.types';
import {
  PendingSignup,
  PendingSignupDocument,
} from './schemas/pending-signup.schema';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(PendingSignup.name)
    private readonly pendingSignupModel: Model<PendingSignupDocument>,
  ) {}

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  generateOtp(): string {
    const max = 10 ** OTP_LENGTH;
    const value = randomInt(0, max);
    return value.toString().padStart(OTP_LENGTH, '0');
  }

  async hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, BCRYPT_ROUNDS);
  }

  async verifyOtpHash(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }

  private buildExpiryDate(): Date {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  }

  private assertNotRateLimited(record: PendingSignupDocument): void {
    if (record.locked) {
      throw new HttpException(
        'Too many verification attempts. Please request a new code.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (record.lastSentAt) {
      const elapsedSeconds = (Date.now() - record.lastSentAt.getTime()) / 1000;
      if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        throw new HttpException(
          `Please wait before requesting another code.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (
      record.sendCount >= OTP_MAX_SENDS_PER_HOUR &&
      record.lastSentAt &&
      record.lastSentAt > oneHourAgo
    ) {
      throw new HttpException(
        'Too many verification codes requested. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async createOrReplacePendingSignup(
    payload: SignupPayload,
  ): Promise<OtpIssueResult> {
    const email = this.normalizeEmail(payload.email);
    const otp = this.generateOtp();
    const otpHash = await this.hashOtp(otp);
    const expiresAt = this.buildExpiryDate();
    const now = new Date();

    const existing = await this.pendingSignupModel.findOne({ email });

    if (existing) {
      this.assertNotRateLimited(existing);

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const sendCount =
        existing.lastSentAt && existing.lastSentAt > oneHourAgo
          ? existing.sendCount + 1
          : 1;

      existing.otpHash = otpHash;
      existing.expiresAt = expiresAt;
      existing.consumed = false;
      existing.attempts = 0;
      existing.locked = false;
      existing.signupData = {
        email,
        password: payload.password,
        name: payload.name.trim(),
        phoneNumber: payload.phoneNumber?.trim() || undefined,
        whatsappNumber: payload.whatsappNumber?.trim() || undefined,
      };
      existing.sendCount = sendCount;
      existing.lastSentAt = now;
      await existing.save();

      return { otp, expiresAt };
    }

    await this.pendingSignupModel.create({
      email,
      otpHash,
      expiresAt,
      consumed: false,
      attempts: 0,
      locked: false,
      sendCount: 1,
      lastSentAt: now,
      signupData: {
        email,
        password: payload.password,
        name: payload.name.trim(),
        phoneNumber: payload.phoneNumber?.trim() || undefined,
        whatsappNumber: payload.whatsappNumber?.trim() || undefined,
      },
    });

    return { otp, expiresAt };
  }

  async resendOtp(email: string): Promise<OtpIssueResult> {
    const normalizedEmail = this.normalizeEmail(email);
    const record = await this.pendingSignupModel.findOne({
      email: normalizedEmail,
      consumed: false,
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired verification request.');
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Verification code has expired.');
    }

    this.assertNotRateLimited(record);

    const otp = this.generateOtp();
    const otpHash = await this.hashOtp(otp);
    const expiresAt = this.buildExpiryDate();
    const now = new Date();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const sendCount =
      record.lastSentAt && record.lastSentAt > oneHourAgo
        ? record.sendCount + 1
        : 1;

    record.otpHash = otpHash;
    record.expiresAt = expiresAt;
    record.attempts = 0;
    record.locked = false;
    record.sendCount = sendCount;
    record.lastSentAt = now;
    await record.save();

    return { otp, expiresAt };
  }

  async verifyAndConsume(email: string, otp: string): Promise<SignupPayload> {
    const normalizedEmail = this.normalizeEmail(email);
    const record = await this.pendingSignupModel.findOne({
      email: normalizedEmail,
      consumed: false,
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired verification code.');
    }

    if (record.locked) {
      throw new HttpException(
        'Too many verification attempts. Please request a new code.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Verification code has expired.');
    }

    const isValid = await this.verifyOtpHash(otp, record.otpHash);

    if (!isValid) {
      record.attempts += 1;
      if (record.attempts >= OTP_MAX_ATTEMPTS) {
        record.locked = true;
      }
      await record.save();

      if (record.locked) {
        throw new HttpException(
          'Too many verification attempts. Please request a new code.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new BadRequestException('Invalid verification code.');
    }

    record.consumed = true;
    await record.save();

    const signupData = { ...record.signupData };
    await this.pendingSignupModel.deleteOne({ _id: record._id });

    return signupData;
  }

  async findPendingByEmail(
    email: string,
  ): Promise<PendingSignupDocument | null> {
    return this.pendingSignupModel.findOne({
      email: this.normalizeEmail(email),
      consumed: false,
    });
  }
}
