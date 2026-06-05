import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createContractTestApp,
  resetContractTestMocks,
} from './helpers/create-contract-test-app';

/**
 * API contract smoke tests — baseline safety net for refactors (Migration Step 0).
 *
 * Contract assertions:
 * 1. GET /property-listings → paginated { items, nextLastId }
 * 2. GET /help-requests → array of help request objects
 * 3. GET /help-requests/mine without session → 401 Unauthorized
 */
describe('Public API contracts (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createContractTestApp();
  });

  beforeEach(() => {
    resetContractTestMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/property-listings returns paginated shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/property-listings')
      .expect(200);

    expect(response.body).toMatchObject({
      items: expect.any(Array),
    });
    expect(
      response.body.nextLastId === null ||
        typeof response.body.nextLastId === 'string',
    ).toBe(true);
  });

  it('GET /api/v1/help-requests returns an array', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/help-requests')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /api/v1/help-requests/mine without auth returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/help-requests/mine')
      .expect(401);
  });
});
