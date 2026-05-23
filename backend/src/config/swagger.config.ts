import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

const AUTH_TAG = 'Auth (Better Auth)';

function addBetterAuthPaths(document: OpenAPIObject): void {
  const authPaths = {
    '/api/v1/auth/sign-up/email': {
      post: {
        tags: [AUTH_TAG],
        summary: 'Register a new user',
        description:
          'Handled by Better Auth. Creates auth user and syncs Daleel profile in `users` collection.',
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
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
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
  };

  document.paths = { ...authPaths, ...document.paths };
}

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Daleel API')
    .setDescription(
      'Humanitarian crisis-management platform API for Lebanon.\n\n' +
        '**Auth:** Better Auth routes are mounted at `/api/v1/auth/*`. ' +
        'Use the Bearer token from sign-in/sign-up in the Authorize button for protected routes.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'token',
        description: 'Better Auth session token from sign-in or sign-up response',
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
  httpAdapter.get('/api-docs', (_req: unknown, res: { redirect: (url: string) => void }) => {
    res.redirect('/api/docs');
  });
}
