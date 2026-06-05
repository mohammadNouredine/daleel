import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createContractTestApp,
  resetContractTestMocks,
} from './helpers/create-contract-test-app';

describe('AppModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createContractTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should bootstrap the contract test application', () => {
    expect(app).toBeDefined();
  });
});
