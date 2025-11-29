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

describe('ProductModule (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: process.env.DB_NAME_TEST,
          username: process.env.DB_USER_TEST,
          password: process.env.DB_PASSWORD_TEST,
          host: 'localhost',
          port: 5432,
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
  });

  afterAll(async () => {
    await app.close();
  });

  // GET (csv)
  it('GET /products/csv [Check csv export]', async () => {
    await request(app.getHttpServer()).post('/products').send({
      name: 'CSV Product',
      price: 100,
      available_quantity: 50,
      wholesale_price: 40,
      wholesale_minimum_quantity: 10,
    });

    const res = await request(app.getHttpServer())
      .get('/products/csv')
      .expect(200);

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
    const res = await request(app.getHttpServer())
      .post('/products')
      .send(product)
      .expect(400);

    expect(res.body.error).toBeDefined();

    expect(Array.isArray(res.body.message)).toBe(true);

    const expectedMessages = [
      'name must be a string',
      'available_quantity must not be less than 0',
      'price must be a number conforming to the specified constraints',
      'wholesale_price must be a number conforming to the specified constraints',
      'wholesale_minimum_quantity must be an integer number',
    ];

    for (const msg of expectedMessages) {
      expect(res.body.message).toContain(msg);
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
    const firstRes = await request(app.getHttpServer())
      .post('/products')
      .send(product)
      .expect(201);

    expect(firstRes.body.name).toBe(product.name);

    const secondRes = await request(app.getHttpServer())
      .post('/products')
      .send(product)
      .expect(409);
    expect(secondRes.body.error).toBeDefined();
    expect(secondRes.body.message).toBe('Duplicate error.');
  });

  it('POST /products [Check creation]', async () => {
    const product = {
      name: 'Test product',
      price: 100.5,
      available_quantity: 100,
      wholesale_price: 50.25,
      wholesale_minimum_quantity: 20,
    };
    const res = await request(app.getHttpServer())
      .post('/products')
      .send(product)
      .expect(201);

    expect(res.body.product_id).toBeDefined();
    expect(res.body.name).toBe(product.name);
    expect(res.body.price).toBe(product.price);
    expect(res.body.available_quantity).toBe(product.available_quantity);
    expect(res.body.wholesale_price).toBe(product.wholesale_price);
    expect(res.body.wholesale_minimum_quantity).toBe(
      product.wholesale_minimum_quantity,
    );
    expect(res.body.is_active).toBe(true);
  });

  // GET
  it('GET /products/:id [Check getting non-existing product]', async () => {
    const res = await request(app.getHttpServer())
      .get('/products/999999') // або якийсь інший гарантовано неіснуючий id
      .expect(404);

    expect(res.body.error).toBeDefined();
  });

  it('GET /products/:id [Check getting existing product]', async () => {
    const product = {
      name: 'Test product for get',
      price: 100.5,
      available_quantity: 100,
      wholesale_price: 50.25,
      wholesale_minimum_quantity: 20,
    };
    const createRes = await request(app.getHttpServer())
      .post('/products')
      .send(product)
      .expect(201);

    const id = createRes.body.product_id;

    const getRes = await request(app.getHttpServer())
      .get(`/products/${id}`)
      .expect(200);

    expect(getRes.body.product_id).toBe(id);
    expect(getRes.body.name).toBe(product.name);
    expect(getRes.body.price).toBe(product.price);
    expect(getRes.body.available_quantity).toBe(product.available_quantity);
    expect(getRes.body.wholesale_price).toBe(product.wholesale_price);
    expect(getRes.body.wholesale_minimum_quantity).toBe(
      product.wholesale_minimum_quantity,
    );
    expect(getRes.body.is_active).toBe(true);
  });

  it('GET /products [Check validation of query params]', async () => {
    const res = await request(app.getHttpServer())
      .get('/products')
      .query({ sort: 'invalid' })
      .expect(400);

    expect(res.body.error).toBeDefined();
    expect(Array.isArray(res.body.message)).toBe(true);
    expect(res.body.message).toContain(
      'sort must be one of the following values: name, price, available_quantity',
    );
  });

  it('GET /products [Check list with default sorting]', async () => {
    await request(app.getHttpServer()).post('/products').send({
      name: 'List Product B',
      price: 10,
      available_quantity: 20,
      wholesale_price: 5,
      wholesale_minimum_quantity: 10,
    });
    await request(app.getHttpServer()).post('/products').send({
      name: 'List Product A',
      price: 20,
      available_quantity: 40,
      wholesale_price: 15,
      wholesale_minimum_quantity: 30,
    });

    const res = await request(app.getHttpServer())
      .get('/products')
      .query({ search: 'List Product' })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe('List Product A');
    expect(res.body[1].name).toBe('List Product B');
  });

  it('GET /products [Check sort by price desc]', async () => {
    await request(app.getHttpServer()).post('/products').send({
      name: 'Sort Product Low',
      price: 10,
      available_quantity: 10,
      wholesale_price: 4,
      wholesale_minimum_quantity: 5,
    });
    await request(app.getHttpServer()).post('/products').send({
      name: 'Sort Product High',
      price: 50,
      available_quantity: 10,
      wholesale_price: 4,
      wholesale_minimum_quantity: 5,
    });

    const res = await request(app.getHttpServer())
      .get('/products')
      .query({ search: 'Sort Product', sort: 'price', order: 'desc' })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].price).toBeGreaterThan(res.body[1].price);
  });

  // PATCH
  it('PATCH /products/:id [Check validation]', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Patch Product Validation',
        price: 100,
        available_quantity: 50,
        wholesale_price: 40,
        wholesale_minimum_quantity: 10,
      });
    const id = createRes.body.product_id;
    const updatedProduct = {
      price: '120',
      available_quantity: true,
      wholesale_price: -1,
      wholesale_minimum_quantity: 1.05,
      is_active: 'false',
    };
    const updateRes = await request(app.getHttpServer())
      .patch(`/products/${id}`)
      .send(updatedProduct)
      .expect(400);

    expect(updateRes.body.error).toBeDefined();
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
      expect(updateRes.body.message).toContain(msg);
    }
  });

  it('PATCH /products/:id [Check filter]', async () => {
    const product1 = await request(app.getHttpServer()).post('/products').send({
      name: 'Patch Product Ckeck Filter 1',
      price: 100,
      available_quantity: 50,
      wholesale_price: 40,
      wholesale_minimum_quantity: 10,
    });
    const product2 = await request(app.getHttpServer()).post('/products').send({
      name: 'Patch Product Check Filter 2',
      price: 100,
      available_quantity: 50,
      wholesale_price: 40,
      wholesale_minimum_quantity: 10,
    });
    const updateRes = await request(app.getHttpServer())
      .patch(`/products/${product2.body.product_id}`)
      .send({ name: product1.body.name })
      .expect(409);

    expect(updateRes.body.error).toBeDefined();
  });

  it('PATCH /products/:id [Check update]', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Patch Product',
        price: 100,
        available_quantity: 50,
        wholesale_price: 40,
        wholesale_minimum_quantity: 10,
      });
    const id = createRes.body.product_id;
    const updatedProduct = {
      price: 120,
      available_quantity: 80,
      wholesale_price: 50,
      wholesale_minimum_quantity: 15,
      is_active: false,
    };
    const updateRes = await request(app.getHttpServer())
      .patch(`/products/${id}`)
      .send(updatedProduct)
      .expect(200);

    expect(updateRes.body.product_id).toBe(id);
    expect(updateRes.body.name).toBe('Patch Product');
    expect(updateRes.body.price).toBe(updatedProduct.price);
    expect(updateRes.body.available_quantity).toBe(
      updatedProduct.available_quantity,
    );
    expect(updateRes.body.wholesale_price).toBe(updatedProduct.wholesale_price);
    expect(updateRes.body.wholesale_minimum_quantity).toBe(
      updatedProduct.wholesale_minimum_quantity,
    );
    expect(updateRes.body.is_active).toBe(false);
  });

  // DELETE
  it('DELETE /products/:id [Check non-existing deletion]', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/products/9999`)
      .expect(404);
  });

  it('DELETE /products/:id [Check deletion]', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'ToDelete Product',
        price: 100,
        available_quantity: 50,
        wholesale_price: 40,
        wholesale_minimum_quantity: 10,
      });
    const id = createRes.body.product_id;

    const deleteRes = await request(app.getHttpServer())
      .delete(`/products/${id}`)
      .expect(204);
  });
});
