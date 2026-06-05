import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

const AUTH_TAG = 'Auth (Better Auth)';

function getApiBaseUrl(): string {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL.replace(/\/$/, '');
  }
  const port = process.env.PORT ?? '8000';
  return `http://localhost:${port}`;
}

function addBetterAuthPaths(document: OpenAPIObject): void {
  const authPaths = {
    '/api/v1/auth/sign-up/email': {
      post: {
        tags: [AUTH_TAG],
        summary: 'Register a new user (disabled)',
        description:
          'Direct sign-up is disabled. Use `POST /api/v1/auth/sign-up/request-otp` followed by `POST /api/v1/auth/sign-up/verify-otp`.',
        deprecated: true,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'user@example.com',
                  },
                  password: {
                    type: 'string',
                    minLength: 8,
                    example: 'securePassword123',
                  },
                  name: { type: 'string', example: 'Full Name' },
                  phoneNumber: { type: 'string', example: '+96170123456' },
                  whatsappNumber: { type: 'string', example: '+96170123456' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User registered; session token returned' },
          '400': { description: 'Validation error or email already exists' },
        },
      },
    },
    '/api/v1/auth/sign-up/request-otp': {
      post: {
        tags: [AUTH_TAG],
        summary: 'Request signup verification OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', minLength: 8, example: 'securePassword123' },
                  name: { type: 'string', example: 'John Doe' },
                  phoneNumber: { type: 'string', example: '+96170123456' },
                  whatsappNumber: { type: 'string', example: '+96170123456' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP sent (generic message to prevent enumeration)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/sign-up/verify-otp': {
      post: {
        tags: [AUTH_TAG],
        summary: 'Verify OTP and create account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  otp: { type: 'string', pattern: '^\\d{6}$', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Account created; session token returned' },
          '400': { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/api/v1/auth/resend-otp': {
      post: {
        tags: [AUTH_TAG],
        summary: 'Resend signup verification OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP resent (generic message to prevent enumeration)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/sign-in/email': {
      post: {
        tags: [AUTH_TAG],
        summary: 'Sign in with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'user@example.com',
                  },
                  password: { type: 'string', example: 'securePassword123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Signed in; session token returned' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/v1/auth/sign-out': {
      post: {
        tags: [AUTH_TAG],
        summary: 'Sign out current session',
        security: [{ bearer: [] }],
        responses: {
          '200': { description: 'Signed out' },
        },
      },
    },
    '/api/v1/auth/get-session': {
      get: {
        tags: [AUTH_TAG],
        summary: 'Get current session',
        security: [{ bearer: [] }],
        responses: {
          '200': { description: 'Current session or null' },
        },
      },
    },
    '/api/v1/auth/request-password-reset': {
      post: {
        tags: [AUTH_TAG],
        summary: 'Request password reset email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  redirectTo: {
                    type: 'string',
                    example: 'http://localhost:3000/auth/reset-password',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Generic success message (anti-enumeration)' },
        },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        tags: [AUTH_TAG],
        summary: 'Reset password with token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['newPassword', 'token'],
                properties: {
                  newPassword: { type: 'string', minLength: 8 },
                  token: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password reset successfully' },
          '400': { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/v1/auth/change-password': {
      post: {
        tags: [AUTH_TAG],
        summary: 'Change password for authenticated user',
        security: [{ bearer: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                  revokeOtherSessions: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password updated; may return new session token' },
          '400': { description: 'Invalid current password' },
        },
      },
    },
  };

  document.paths = { ...authPaths, ...document.paths };
}

export function setupSwagger(app: INestApplication): void {
  const apiBaseUrl = getApiBaseUrl();

  const config = new DocumentBuilder()
    .setTitle('Daleel API')
    .addServer(apiBaseUrl, 'Local API')
    .setDescription(
      'Humanitarian crisis-management platform API for Lebanon.\n\n' +
        '**Auth:** Better Auth routes are mounted at `/api/v1/auth/*`. ' +
        'Sign-up requires OTP verification via `/api/v1/auth/sign-up/request-otp` and `/api/v1/auth/sign-up/verify-otp`. ' +
        'Use the Bearer token from sign-in or verify-otp in the Authorize button for protected routes.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'token',
        description:
          'Better Auth session token from sign-in or sign-up response',
      },
      'bearer',
    )
    .addTag('Users', 'Daleel user profiles')
    .addTag(AUTH_TAG, 'Authentication via Better Auth (not NestJS controllers)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  addBetterAuthPaths(document);

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get(
    '/api-docs',
    (_req: unknown, res: { redirect: (url: string) => void }) => {
      res.redirect('/api/docs');
    },
  );
}
