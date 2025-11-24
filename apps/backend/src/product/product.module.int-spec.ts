import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ProductModule } from './product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { PostgresExceptionFilter } from '../common/filters/postgres-exception.filter';
import { OrderProduct } from '../order/entities/order-product.entity';
import { Order } from '../order/entities/order.entity';
import { Establishment } from '../establishment/entities/establishment.entity';
import 'dotenv/config';
import { Application } from 'express';

describe('ProductModule (integration)', () => {
  let app: INestApplication;
  let appHttpServer: Application;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: process.env.DB_NAME_TEST,
          username: process.env.DB_USER_TEST,
          password: process.env.DB_PASSWORD_TEST,
          host: process.env.DB_HOST_TEST || 'localhost',
          port: Number(process.env.DB_PORT_TEST) || 5432,
          dropSchema: true,
          entities: [Product, OrderProduct, Order, Establishment],
          synchronize: true,
        }),
        ProductModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new PostgresExceptionFilter());
    await app.init();

    appHttpServer = app.getHttpServer() as unknown as Application;
  });

  afterAll(async () => {
    await app.close();
  });

  // GET (csv)
  it('GET /products/csv [Check csv export]', async () => {
    await request(appHttpServer).post('/products').send({
      name: 'CSV Product',
      price: 100,
      available_quantity: 50,
      wholesale_price: 40,
      wholesale_minimum_quantity: 10,
    });

    const res = await request(appHttpServer).get('/products/csv').expect(200);

    expect(res.header['content-type']).toContain('text/csv');
    const rows = res.text.split('\n');
    expect(rows[0]).toBe(
      'product_id,name,available_quantity,price,wholesale_price,wholesale_minimum_quantity,is_active',
    );
    expect(rows.length).toBe(2);
    expect(rows[1]).toContain('CSV Product');
  });

  // POST
  it('POST /products [Check validation]', async () => {
    const product = {
      name: true,
      price: 100.29282,
      available_quantity: -2,
      wholesale_price: null,
      wholesale_minimum_quantity: '100',
    };
    const res = await request(app.getHttpServer() as unknown as Application)
      .post('/products')
      .send(product)
      .expect(400);

    const responseBody: { error: string; message: string[] } = res.body as {
      error: string;
      message: string[];
    };

    expect(responseBody.error).toBeDefined();

    expect(Array.isArray(responseBody.message)).toBe(true);

    const expectedMessages = [
      'name must be a string',
      'available_quantity must not be less than 0',
      'price must be a number conforming to the specified constraints',
      'wholesale_price must be a number conforming to the specified constraints',
      'wholesale_minimum_quantity must be an integer number',
    ];

    for (const msg of expectedMessages) {
      expect(responseBody.message).toContain(msg);
    }
  });

  it('POST /products [Check filter]', async () => {
    const product = {
      name: 'Test 1',
      price: 100.5,
      available_quantity: 100,
      wholesale_price: 50.25,
      wholesale_minimum_quantity: 20,
    };
    const firstRes = await request(appHttpServer)
      .post('/products')
      .send(product)
      .expect(201);

    const firstResBody: { product_id: number; name: string } =
      firstRes.body as {
        product_id: number;
        name: string;
      };

    expect(firstResBody.name).toBe(product.name);

    const secondRes = await request(appHttpServer)
      .post('/products')
      .send(product)
      .expect(409);

    const secondResBody: { error: string; message: string } =
      secondRes.body as {
        error: string;
        message: string;
      };

    expect(secondResBody.error).toBeDefined();
    expect(secondResBody.message).toBe('Duplicate error.');
  });

  it('POST /products [Check creation]', async () => {
    const product = {
      name: 'Test product',
      price: 100.5,
      available_quantity: 100,
      wholesale_price: 50.25,
      wholesale_minimum_quantity: 20,
    };
    const res = await request(appHttpServer)
      .post('/products')
      .send(product)
      .expect(201);

    const responseBody: {
      product_id: number;
      name: string;
      price: number;
      available_quantity: number;
      wholesale_price: number;
      wholesale_minimum_quantity: number;
      is_active: boolean;
    } = res.body as {
      product_id: number;
      name: string;
      price: number;
      available_quantity: number;
      wholesale_price: number;
      wholesale_minimum_quantity: number;
      is_active: boolean;
    };

    expect(responseBody.product_id).toBeDefined();
    expect(responseBody.name).toBe(product.name);
    expect(responseBody.price).toBe(product.price);
    expect(responseBody.available_quantity).toBe(product.available_quantity);
    expect(responseBody.wholesale_price).toBe(product.wholesale_price);
    expect(responseBody.wholesale_minimum_quantity).toBe(
      product.wholesale_minimum_quantity,
    );
    expect(responseBody.is_active).toBe(true);
  });

  // GET
  it('GET /products/:id [Check getting non-existing product]', async () => {
    const res = await request(appHttpServer)
      .get('/products/999999') // або якийсь інший гарантовано неіснуючий id
      .expect(404);

    const responseBody: { error: string; message: string } = res.body as {
      error: string;
      message: string;
    };

    expect(responseBody.error).toBeDefined();
  });

  it('GET /products/:id [Check getting existing product]', async () => {
    const product = {
      name: 'Test product for get',
      price: 100.5,
      available_quantity: 100,
      wholesale_price: 50.25,
      wholesale_minimum_quantity: 20,
    };
    const createRes = await request(appHttpServer)
      .post('/products')
      .send(product)
      .expect(201);

    const id = (createRes.body as { product_id: number }).product_id;

    const getRes = await request(appHttpServer)
      .get(`/products/${id}`)
      .expect(200);

    const getResBody: {
      product_id: number;
      name: string;
      price: number;
      available_quantity: number;
      wholesale_price: number;
      wholesale_minimum_quantity: number;
      is_active: boolean;
    } = getRes.body as {
      product_id: number;
      name: string;
      price: number;
      available_quantity: number;
      wholesale_price: number;
      wholesale_minimum_quantity: number;
      is_active: boolean;
    };

    expect(getResBody.product_id).toBe(id);
    expect(getResBody.name).toBe(product.name);
    expect(getResBody.price).toBe(product.price);
    expect(getResBody.available_quantity).toBe(product.available_quantity);
    expect(getResBody.wholesale_price).toBe(product.wholesale_price);
    expect(getResBody.wholesale_minimum_quantity).toBe(
      product.wholesale_minimum_quantity,
    );
    expect(getResBody.is_active).toBe(true);
  });

  it('GET /products [Check validation of query params]', async () => {
    const res = await request(appHttpServer)
      .get('/products')
      .query({ sort: 'invalid' })
      .expect(400);

    const responseBody: { error: string; message: string[] } = res.body as {
      error: string;
      message: string[];
    };

    expect(responseBody.error).toBeDefined();
    expect(Array.isArray(responseBody.message)).toBe(true);
    expect(responseBody.message).toContain(
      'sort must be one of the following values: name, price, available_quantity',
    );
  });

  it('GET /products [Check list with default sorting]', async () => {
    await request(appHttpServer).post('/products').send({
      name: 'List Product B',
      price: 10,
      available_quantity: 20,
      wholesale_price: 5,
      wholesale_minimum_quantity: 10,
    });
    await request(appHttpServer).post('/products').send({
      name: 'List Product A',
      price: 20,
      available_quantity: 40,
      wholesale_price: 15,
      wholesale_minimum_quantity: 30,
    });

    const res = await request(appHttpServer)
      .get('/products')
      .query({ search: 'List Product' })
      .expect(200);

    const responseBody: { name: string }[] = res.body as { name: string }[];

    expect(Array.isArray(res.body)).toBe(true);
    expect(responseBody.length).toBe(2);
    expect(responseBody[0].name).toBe('List Product A');
    expect(responseBody[1].name).toBe('List Product B');
  });

  it('GET /products [Check sort by price desc]', async () => {
    await request(appHttpServer).post('/products').send({
      name: 'Sort Product Low',
      price: 10,
      available_quantity: 10,
      wholesale_price: 4,
      wholesale_minimum_quantity: 5,
    });
    await request(appHttpServer).post('/products').send({
      name: 'Sort Product High',
      price: 50,
      available_quantity: 10,
      wholesale_price: 4,
      wholesale_minimum_quantity: 5,
    });

    const res = await request(appHttpServer)
      .get('/products')
      .query({ search: 'Sort Product', sort: 'price', order: 'desc' })
      .expect(200);

    const responseBody: { price: number }[] = res.body as { price: number }[];

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(2);
    expect(responseBody[0].price).toBeGreaterThan(responseBody[1].price);
  });

  // PATCH
  it('PATCH /products/:id [Check validation]', async () => {
    const createRes = await request(appHttpServer).post('/products').send({
      name: 'Patch Product Validation',
      price: 100,
      available_quantity: 50,
      wholesale_price: 40,
      wholesale_minimum_quantity: 10,
    });

    const id = (createRes.body as { product_id: number }).product_id;

    const updatedProduct = {
      price: '120',
      available_quantity: true,
      wholesale_price: -1,
      wholesale_minimum_quantity: 1.05,
      is_active: 'false',
    };
    const updateRes = await request(appHttpServer)
      .patch(`/products/${id}`)
      .send(updatedProduct)
      .expect(400);

    const responseBody: { error: string; message: string[] } =
      updateRes.body as {
        error: string;
        message: string[];
      };

    expect(responseBody.error).toBeDefined();
    const expectedMessages = [
      'available_quantity must not be less than 0',
      'available_quantity must be an integer number',
      'price must not be less than 0',
      'price must be a number conforming to the specified constraints',
      'wholesale_price must not be less than 0',
      'wholesale_minimum_quantity must be an integer number',
      'is_active must be a boolean value',
    ];

    for (const msg of expectedMessages) {
      expect(responseBody.message).toContain(msg);
    }
  });

  it('PATCH /products/:id [Check filter]', async () => {
    const product1 = await request(appHttpServer).post('/products').send({
      name: 'Patch Product Ckeck Filter 1',
      price: 100,
      available_quantity: 50,
      wholesale_price: 40,
      wholesale_minimum_quantity: 10,
    });

    const product2 = await request(appHttpServer).post('/products').send({
      name: 'Patch Product Check Filter 2',
      price: 100,
      available_quantity: 50,
      wholesale_price: 40,
      wholesale_minimum_quantity: 10,
    });

    const product1Body: { product_id: number; name: string } =
      product1.body as { product_id: number; name: string };

    const product2Body: { product_id: number; name: string } =
      product2.body as { product_id: number; name: string };

    const updateRes = await request(appHttpServer)
      .patch(`/products/${product2Body.product_id}`)
      .send({ name: product1Body.name })
      .expect(409);

    expect((updateRes.body as { error: string }).error).toBeDefined();
  });

  it('PATCH /products/:id [Check update]', async () => {
    const createRes = await request(appHttpServer).post('/products').send({
      name: 'Patch Product',
      price: 100,
      available_quantity: 50,
      wholesale_price: 40,
      wholesale_minimum_quantity: 10,
    });
    const id = (createRes.body as { product_id: number }).product_id;
    const updatedProduct = {
      price: 120,
      available_quantity: 80,
      wholesale_price: 50,
      wholesale_minimum_quantity: 15,
      is_active: false,
    };
    const updateRes = await request(appHttpServer)
      .patch(`/products/${id}`)
      .send(updatedProduct)
      .expect(200);

    const updateResBody: {
      product_id: number;
      name: string;
      price: number;
      available_quantity: number;
      wholesale_price: number;
      wholesale_minimum_quantity: number;
      is_active: boolean;
    } = updateRes.body as {
      product_id: number;
      name: string;
      price: number;
      available_quantity: number;
      wholesale_price: number;
      wholesale_minimum_quantity: number;
      is_active: boolean;
    };

    expect(updateResBody.product_id).toBe(id);
    expect(updateResBody.name).toBe('Patch Product');
    expect(updateResBody.price).toBe(updatedProduct.price);
    expect(updateResBody.available_quantity).toBe(
      updatedProduct.available_quantity,
    );
    expect(updateResBody.wholesale_price).toBe(updatedProduct.wholesale_price);
    expect(updateResBody.wholesale_minimum_quantity).toBe(
      updatedProduct.wholesale_minimum_quantity,
    );
    expect(updateResBody.is_active).toBe(false);
  });

  // DELETE
  it('DELETE /products/:id [Check non-existing deletion]', async () => {
    await request(appHttpServer).delete(`/products/9999`).expect(404);
  });

  it('DELETE /products/:id [Check deletion]', async () => {
    const createRes = await request(appHttpServer).post('/products').send({
      name: 'ToDelete Product',
      price: 100,
      available_quantity: 50,
      wholesale_price: 40,
      wholesale_minimum_quantity: 10,
    });
    const id = (createRes.body as { product_id: number }).product_id;

    await request(appHttpServer).delete(`/products/${id}`).expect(204);
  });
});
