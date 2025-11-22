import request from 'supertest';
import { bootstrapApp, loginAdmin } from './e2e-utils';

describe('Order E2E', () => {
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

  it('should create order for an establishment', async () => {
    const token = await loginAdmin(baseUrl);

    const establishment = await request(baseUrl)
      .post('/establishments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'cafe',
        name: 'Order Cafe',
        email: 'ordercafe@example.com',
        phone: '+380501112234',
        address: 'Order Address',
      })
      .expect(201);

    const establishmentBody: { establishment_id: string } =
      establishment.body as {
        establishment_id: string;
      };

    const createOrder = await request(baseUrl)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ establishment_id: establishmentBody.establishment_id })
      .expect(201);

    const createOrderBody: { order_id: string } = createOrder.body as {
      order_id: string;
    };

    const order = await request(baseUrl)
      .get(`/orders/${createOrderBody.order_id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    console.log('Create Order Body:', order.body);

    type GetOrderBodyType = {
      order_id: string;
      status: string;
      date: string;
      establishment: {
        establishment_id: string;
        name: string;
        type: string;
        email: string;
        phone: string;
        address: string;
      };
      orderProducts: object[];
    };

    const orderBody: GetOrderBodyType = order.body as GetOrderBodyType;

    expect(orderBody.order_id).toBe(createOrderBody.order_id);
    expect(orderBody.status).toBe('new');
    expect(orderBody.establishment.establishment_id).toBe(
      establishmentBody.establishment_id,
    );
  });
});
