import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { SessionAuthGuard } from '../../src/common/auth';
import { HelpRequestsController } from '../../src/modules/help-requests/help-requests.controller';
import { HelpRequestsService } from '../../src/modules/help-requests/help-requests.service';
import { PropertyListingsController } from '../../src/modules/property-listings/property-listings.controller';
import { PropertyListingsService } from '../../src/modules/property-listings/property-listings.service';
import { UsersController } from '../../src/modules/users/users.controller';
import { UsersService } from '../../src/modules/users/users.service';

const propertyListingsServiceMock = {
  listPublic: jest.fn().mockResolvedValue({
    items: [],
    nextLastId: null,
  }),
};

const helpRequestsServiceMock = {
  listPublic: jest.fn().mockResolvedValue([]),
  listMine: jest.fn(),
};

const usersServiceMock = {
  findById: jest.fn(),
};

/**
 * HTTP contract test app — controllers with mocked domain services (no MongoDB).
 * Validates routing, global prefix, validation pipe, and auth entry points.
 */
export async function createContractTestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    controllers: [
      PropertyListingsController,
      HelpRequestsController,
      UsersController,
    ],
    providers: [
      SessionAuthGuard,
      {
        provide: PropertyListingsService,
        useValue: propertyListingsServiceMock,
      },
      {
        provide: HelpRequestsService,
        useValue: helpRequestsServiceMock,
      },
      {
        provide: UsersService,
        useValue: usersServiceMock,
      },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

export function resetContractTestMocks(): void {
  propertyListingsServiceMock.listPublic.mockClear();
  helpRequestsServiceMock.listPublic.mockClear();
  usersServiceMock.findById.mockClear();
}
