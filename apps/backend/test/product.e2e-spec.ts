import request from 'supertest';
import { bootstrapApp, loginAdmin } from './e2e-utils';

describe('Product E2E', () => {
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

  it('login and create product', async () => {
    const token = await loginAdmin(baseUrl);

    await request(baseUrl)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: true })
      .expect(400);

    const createRes = await request(baseUrl)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'E2E Product',
        price: 10.5,
        available_quantity: 100,
        wholesale_price: 5,
        wholesale_minimum_quantity: 10,
      })
      .expect(201);

    const createResBody: { name: string } = createRes.body as { name: string };

    expect(createResBody.name).toBe('E2E Product');

    // list
    const listRes = await request(baseUrl)
      .get('/products')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
  });
});
