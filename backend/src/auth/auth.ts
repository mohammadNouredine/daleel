import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { bearer } from 'better-auth/plugins/bearer';
import { apiResponseWrapPlugin } from './api-response-wrap.plugin';
import { blockDirectSignupPlugin } from './block-direct-signup.plugin';
import { otpSignupPlugin } from './otp-signup.plugin';
import { UserRole } from '../common/enums';
import { mongoClient, mongoDb } from '../database/mongo-client';
import { runUserProfileSetup } from '../modules/users/users-profile.registry';

const trustedOrigins = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  secret: process.env.BETTER_AUTH_SECRET,
  basePath: '/api/v1/auth',
  trustedOrigins,
  database: mongodbAdapter(mongoDb, {
    client: mongoClient,
    transaction: false,
  }),
  user: {
    modelName: 'users',
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: UserRole.USER,
        input: false,
      },
      phoneNumber: {
        type: 'string',
        required: false,
      },
      whatsappNumber: {
        type: 'string',
        required: false,
      },
    },
  },
  session: {
    modelName: 'sessions',
  },
  account: {
    modelName: 'accounts',
  },
  verification: {
    modelName: 'verifications',
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    bearer(),
    apiResponseWrapPlugin(),
    blockDirectSignupPlugin(),
    otpSignupPlugin(),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const role =
            typeof user.role === 'string' &&
            Object.values(UserRole).includes(user.role as UserRole)
              ? (user.role as UserRole)
              : UserRole.USER;
          // Better Auth exposes `_id` as `user.id` (hex string)
          await runUserProfileSetup(user.id, role);
        },
      },
    },
  },
});
