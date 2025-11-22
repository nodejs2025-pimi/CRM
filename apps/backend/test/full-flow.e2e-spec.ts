import request from 'supertest';
import { bootstrapApp, loginAdmin } from './e2e-utils';

describe('Full Flow E2E', () => {
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

  it('admin can create product, establishment and place an order', async () => {
    const token = await loginAdmin(baseUrl);

    const product = await request(baseUrl)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'FullFlow Product',
        price: 5,
        available_quantity: 50,
        wholesale_price: 2,
        wholesale_minimum_quantity: 10,
      })
      .expect(201);

    const productBody: { product_id: string } = product.body as {
      product_id: string;
    };

    const establishment = await request(baseUrl)
      .post('/establishments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'cafe',
        name: 'FullFlow Cafe',
        email: 'fullflow@example.com',
        phone: '+380501112235',
        address: 'Full Address',
      })
      .expect(201);

    const establishmentBody: { establishment_id: string } =
      establishment.body as {
        establishment_id: string;
      };

    const order = await request(baseUrl)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ establishment_id: establishmentBody.establishment_id })
      .expect(201);

    const orderBody: { order_id: string } = order.body as {
      order_id: string;
    };

    await request(baseUrl)
      .post(`/orders/${orderBody.order_id}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productBody.product_id, quantity: 5 })
      .expect(201);

    const getOrder = await request(baseUrl)
      .get(`/orders/${orderBody.order_id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    type GetOrderBodyType = {
      order_id: string;
      date: string;
      status: string;
      establishment: {
        establishment_id: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        type: string;
      };
      orderProducts: {
        price: number;
        order_id: string;
        quantity: number;
        product: {
          product_id: string;
          name: string;
          available_quantity: number;
          price: number;
          wholesale_price: number;
          wholesale_minimum_quantity: number;
          is_active: boolean;
        };
      }[];
    };

    const getOrderBody: GetOrderBodyType = getOrder.body as GetOrderBodyType;

    expect(getOrderBody.order_id).toBe(orderBody.order_id);
    expect(getOrderBody.status).toBe('new');
    expect(getOrderBody.establishment.establishment_id).toBe(
      establishmentBody.establishment_id,
    );
    expect(getOrderBody.orderProducts.length).toBe(1);
    expect(getOrderBody.orderProducts[0].product.product_id).toBe(
      productBody.product_id,
    );
  });
});
