import { createAuthEndpoint } from '@better-auth/core/api';
import { APIError } from '@better-auth/core/error';
import type { BetterAuthPlugin } from 'better-auth';
import { Resend } from 'resend';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import * as z from 'zod';
import { parseUserOutput } from 'better-auth/db';

import { mongoDb } from '../database/mongo-client';
import {
  OTP_EXPIRY_MINUTES,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_RESEND_COOLDOWN_SECONDS,
  GENERIC_OTP_SENT_MESSAGE,
} from '../otp/otp.constants';
import {
  verificationEmailTemplate,
  welcomeEmailTemplate,
} from '../email/templates';

const PENDING_SIGNUPS_COLLECTION = 'pending_signups';
const USERS_COLLECTION = 'users';

const BCRYPT_ROUNDS = 10;

type PendingSignupDoc = {
  _id: any;
  email: string;
  otpHash: string;
  expiresAt: Date;
  consumed?: boolean;
  signupData: {
    email: string;
    password: string;
    name: string;
    phoneNumber?: string;
    whatsappNumber?: string;
  };
  attempts: number;
  locked: boolean;
  sendCount?: number;
  lastSentAt?: Date;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateOtp(): string {
  const max = 10 ** OTP_LENGTH;
  const value = randomInt(0, max);
  return value.toString().padStart(OTP_LENGTH, '0');
}

async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, BCRYPT_ROUNDS);
}

async function verifyOtpHash(otp: string, otpHash: string): Promise<boolean> {
  return bcrypt.compare(otp, otpHash);
}

async function deliverVerificationOtpEmail(params: {
  resend: Resend;
  from: string;
  to: string;
  name: string;
  otp: string;
  source: 'request' | 'resend';
}): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[OTP signup:${params.source}] to=${params.to} name=${params.name} code=${params.otp} expiresIn=${OTP_EXPIRY_MINUTES}m`,
    );
    return;
  }

  const template = verificationEmailTemplate({
    name: params.name,
    otp: params.otp,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  });

  await params.resend.emails.send({
    from: params.from,
    to: params.to,
    subject: template.subject,
    html: template.html,
  });
}

export function otpSignupPlugin(): BetterAuthPlugin {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is required to enable OTP-based signup verification.',
    );
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.EMAIL_FROM ?? 'Daleel <onboarding@resend.dev>';

  const requestOtpBodySchema = z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1),
      phoneNumber: z.string().optional(),
      whatsappNumber: z.string().optional(),
    })
    .and(z.record(z.string(), z.unknown()));

  const verifyOtpBodySchema = z
    .object({
      email: z.string().email(),
      otp: z.string().length(6).regex(/^\d{6}$/),
    })
    .and(z.record(z.string(), z.unknown()));

  const resendOtpBodySchema = z
    .object({
      email: z.string().email(),
    })
    .and(z.record(z.string(), z.unknown()));

  const requestOtp = createAuthEndpoint(
    '/sign-up/request-otp',
    {
      method: 'POST',
      operationId: 'requestOtp',
      body: requestOtpBodySchema,
    },
    async (ctx) => {
      const body = ctx.body as z.infer<typeof requestOtpBodySchema>;
      const normalizedEmail = normalizeEmail(body.email);

      const existingUser = await mongoDb
        .collection(USERS_COLLECTION)
        .findOne({ email: normalizedEmail });

      // Anti-enumeration: always respond generically and do not send OTP if user exists.
      if (existingUser) {
        return ctx.json({ data: {}, message: GENERIC_OTP_SENT_MESSAGE });
      }

      const pending = (await mongoDb
        .collection(PENDING_SIGNUPS_COLLECTION)
        .findOne({ email: normalizedEmail, consumed: false })) as
        | PendingSignupDoc
        | null;

      const now = new Date();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const isRateLimited =
        !!pending?.locked ||
        (!!pending?.lastSentAt &&
          now.getTime() - pending.lastSentAt.getTime() <
            OTP_RESEND_COOLDOWN_SECONDS * 1000) ||
        (!!pending?.lastSentAt &&
          (pending.sendCount ?? 0) >= OTP_MAX_SENDS_PER_HOUR &&
          pending.lastSentAt > oneHourAgo);

      if (isRateLimited) {
        return ctx.json({ data: {}, message: GENERIC_OTP_SENT_MESSAGE });
      }

      const otp = generateOtp();
      const otpHash = await hashOtp(otp);
      const expiresAt = new Date(
        now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000,
      );

      const signupData = {
        email: normalizedEmail,
        password: body.password,
        name: body.name.trim(),
        phoneNumber: body.phoneNumber?.trim() || undefined,
        whatsappNumber: body.whatsappNumber?.trim() || undefined,
      };

      const sendCount =
        pending?.lastSentAt && pending.lastSentAt > oneHourAgo
          ? (pending.sendCount ?? 0) + 1
          : 1;

      const update = {
        $set: {
          email: normalizedEmail,
          otpHash,
          expiresAt,
          consumed: false,
          locked: false,
          attempts: 0,
          signupData,
          sendCount,
          lastSentAt: now,
        },
      } as const;

      await mongoDb
        .collection(PENDING_SIGNUPS_COLLECTION)
        .updateOne(
          { email: normalizedEmail, consumed: false },
          update,
          { upsert: true },
        );

      await deliverVerificationOtpEmail({
        resend,
        from,
        to: normalizedEmail,
        name: signupData.name,
        otp,
        source: 'request',
      });

      return ctx.json({ data: {}, message: GENERIC_OTP_SENT_MESSAGE });
    },
  );

  const resendOtp = createAuthEndpoint(
    '/resend-otp',
    {
      method: 'POST',
      operationId: 'resendOtp',
      body: resendOtpBodySchema,
    },
    async (ctx) => {
      const body = ctx.body as z.infer<typeof resendOtpBodySchema>;
      const normalizedEmail = normalizeEmail(body.email);

      const existingUser = await mongoDb
        .collection(USERS_COLLECTION)
        .findOne({ email: normalizedEmail });
      if (existingUser) {
        return ctx.json({ data: {}, message: GENERIC_OTP_SENT_MESSAGE });
      }

      const pending = (await mongoDb
        .collection(PENDING_SIGNUPS_COLLECTION)
        .findOne({ email: normalizedEmail, consumed: false })) as
        | PendingSignupDoc
        | null;

      const now = new Date();
      if (!pending || pending.expiresAt.getTime() <= now.getTime()) {
        return ctx.json({ data: {}, message: GENERIC_OTP_SENT_MESSAGE });
      }

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const isRateLimited =
        pending.locked ||
        (!!pending.lastSentAt &&
          now.getTime() - pending.lastSentAt.getTime() <
            OTP_RESEND_COOLDOWN_SECONDS * 1000) ||
        (!!pending.lastSentAt &&
          (pending.sendCount ?? 0) >= OTP_MAX_SENDS_PER_HOUR &&
          pending.lastSentAt > oneHourAgo);

      if (isRateLimited) {
        return ctx.json({ data: {}, message: GENERIC_OTP_SENT_MESSAGE });
      }

      const otp = generateOtp();
      const otpHash = await hashOtp(otp);
      const expiresAt = new Date(
        now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000,
      );

      const signupData = pending.signupData;
      const sendCount =
        pending.lastSentAt && pending.lastSentAt > oneHourAgo
          ? (pending.sendCount ?? 0) + 1
          : 1;

      await mongoDb
        .collection(PENDING_SIGNUPS_COLLECTION)
        .updateOne(
          { email: normalizedEmail, consumed: false },
          {
            $set: {
              otpHash,
              expiresAt,
              consumed: false,
              locked: false,
              attempts: 0,
              sendCount,
              lastSentAt: now,
              signupData,
            },
          },
        );

      await deliverVerificationOtpEmail({
        resend,
        from,
        to: normalizedEmail,
        name: signupData.name,
        otp,
        source: 'resend',
      });

      return ctx.json({ data: {}, message: GENERIC_OTP_SENT_MESSAGE });
    },
  );

  const verifyOtp = createAuthEndpoint(
    '/sign-up/verify-otp',
    {
      method: 'POST',
      operationId: 'verifyOtp',
      body: verifyOtpBodySchema,
    },
    async (ctx) => {
      const body = ctx.body as z.infer<typeof verifyOtpBodySchema>;
      const normalizedEmail = normalizeEmail(body.email);

      const pending = (await mongoDb
        .collection(PENDING_SIGNUPS_COLLECTION)
        .findOne({ email: normalizedEmail, consumed: false })) as
        | PendingSignupDoc
        | null;

      const now = new Date();
      if (!pending) {
        throw APIError.from('BAD_REQUEST', {
          code: 'OTP_INVALID_OR_EXPIRED',
          message: 'Invalid or expired verification code.',
        });
      }

      if (pending.locked) {
        throw APIError.from('BAD_REQUEST', {
          code: 'OTP_LOCKED',
          message: 'Too many verification attempts. Please request a new code.',
        });
      }

      if (pending.expiresAt.getTime() <= now.getTime()) {
        throw APIError.from('BAD_REQUEST', {
          code: 'OTP_INVALID_OR_EXPIRED',
          message: 'Invalid or expired verification code.',
        });
      }

      const isValid = await verifyOtpHash(body.otp, pending.otpHash);
      if (!isValid) {
        const attempts = (pending.attempts ?? 0) + 1;
        const locked = attempts >= OTP_MAX_ATTEMPTS;
        await mongoDb
          .collection(PENDING_SIGNUPS_COLLECTION)
          .updateOne(
            { _id: pending._id },
            { $set: { attempts, locked } },
          );

        if (locked) {
          throw APIError.from('BAD_REQUEST', {
            code: 'OTP_LOCKED',
            message: 'Too many verification attempts. Please request a new code.',
          });
        }

        throw APIError.from('BAD_REQUEST', {
          code: 'OTP_INVALID',
          message: 'Invalid verification code.',
        });
      }

      await mongoDb
        .collection(PENDING_SIGNUPS_COLLECTION)
        .deleteOne({ _id: pending._id });

      const passwordHash = await ctx.context.password.hash(
        pending.signupData.password,
      );

      const createdUser = await ctx.context.internalAdapter.createUser({
        name: pending.signupData.name,
        email: normalizedEmail,
        image: null,
        emailVerified: false,
        phoneNumber: pending.signupData.phoneNumber,
        whatsappNumber: pending.signupData.whatsappNumber,
      });

      await ctx.context.internalAdapter.linkAccount({
        userId: createdUser.id,
        providerId: 'credential',
        accountId: createdUser.id,
        password: passwordHash,
      });

      const session = await ctx.context.internalAdapter.createSession(
        createdUser.id,
        false,
      );

      const user = parseUserOutput(ctx.context.options, createdUser);

      // Welcome email is non-blocking.
      const welcomeTemplate = welcomeEmailTemplate({
        name: pending.signupData.name,
      });
      resend.emails
        .send({
          from,
          to: normalizedEmail,
          subject: welcomeTemplate.subject,
          html: welcomeTemplate.html,
        })
        .catch(() => undefined);

      return ctx.json({
        data: {
          token: session.token,
          user,
        },
        message: '',
      });
    },
  );

  return {
    id: 'otp-signup',
    endpoints: {
      requestOtp,
      resendOtp,
      verifyOtp,
    },
  };
}

