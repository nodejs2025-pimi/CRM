import request from 'supertest';
import { bootstrapApp, loginAdmin } from './e2e-utils';

describe('Establishment E2E', () => {
  let baseUrl: string;

  beforeAll(async () => {
    ({ baseUrl } = await bootstrapApp());
  });

  it('should create and list establishments', async () => {
    const token = await loginAdmin(baseUrl);

    const establishment = await request(baseUrl)
      .post('/establishments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'cafe',
        name: 'Test Cafe',
        email: 'testcafe@example.com',
        phone: '+380501112233',
        address: 'Some Address',
      })
      .expect(201);

    const createResBody: {
      name: string;
      type: string;
      email: string;
      phone: string;
      address: string;
    } = establishment.body as {
      name: string;
      type: string;
      email: string;
      phone: string;
      address: string;
    };

    expect(createResBody.name).toBe('Test Cafe');
    expect(createResBody.type).toBe('cafe');
    expect(createResBody.email).toBe('testcafe@example.com');
    expect(createResBody.phone).toBe('+380501112233');
    expect(createResBody.address).toBe('Some Address');

    const establishmentList = await request(baseUrl)
      .get('/establishments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const establishmentListBody: {
      establishment_id: string;
      name: string;
      type: string;
      email: string;
      phone: string;
      address: string;
    }[] = establishmentList.body as {
      establishment_id: string;
      name: string;
      type: string;
      email: string;
      phone: string;
      address: string;
    }[];

    expect(Array.isArray(establishmentListBody)).toBe(true);
    expect(establishmentListBody.length).toBeGreaterThan(0);
    expect(establishmentListBody).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Test Cafe',
          type: 'cafe',
          email: 'testcafe@example.com',
          phone: '+380501112233',
          address: 'Some Address',
        }),
      ]),
    );
  });
});
