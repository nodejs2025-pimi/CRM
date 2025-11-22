import request from 'supertest';
import { bootstrapApp } from './e2e-utils';

describe('Auth E2E', () => {
  let baseUrl: string;
  let closeApp: () => Promise<void>;

  beforeAll(async () => {
    const { baseUrl: b, close } = await bootstrapApp();
    baseUrl = b;
    closeApp = close;
  });

  afterAll(async () => {
    if (closeApp) await closeApp();
  });

  it('POST /auth/login returns access and refresh tokens', async () => {
    const res = await request(baseUrl)
      .post('/auth/login')
      .send({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      })
      .expect(201);

    const resBody: { accessToken: string; refreshToken: string } = res.body as {
      accessToken: string;
      refreshToken: string;
    };

    expect(resBody.accessToken).toBeDefined();
    expect(resBody.refreshToken).toBeDefined();
  });

  it('POST /auth/refresh returns new access token', async () => {
    const login = await request(baseUrl)
      .post('/auth/login')
      .send({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      })
      .expect(201);

    const loginBody: { accessToken: string; refreshToken: string } =
      login.body as {
        accessToken: string;
        refreshToken: string;
      };

    const refresh = await request(baseUrl)
      .post('/auth/refresh')
      .send({ token: loginBody.refreshToken })
      .expect(201);

    const refreshBody: { accessToken: string } = refresh.body as {
      accessToken: string;
    };

    expect(refreshBody.accessToken).toBeDefined();
  });
});
