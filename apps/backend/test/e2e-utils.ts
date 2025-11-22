import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PostgresExceptionFilter } from '../src/common/filters/postgres-exception.filter';
import { DataSource } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { join } from 'path';
import { Server } from 'http';

dotenv.config({ path: join(__dirname, '..', '.env') });

export async function bootstrapApp(): Promise<{
  app: INestApplication;
  baseUrl: string;
  dataSource: DataSource;
  close: () => Promise<void>;
  server: Server;
}> {
  process.env.DB_NAME = process.env.DB_NAME_TEST ?? process.env.DB_NAME;
  process.env.DB_USER = process.env.DB_USER_TEST ?? process.env.DB_USER;
  process.env.DB_PASSWORD =
    process.env.DB_PASSWORD_TEST ?? process.env.DB_PASSWORD;
  process.env.DB_PORT = process.env.DB_PORT_TEST ?? process.env.DB_PORT;

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PostgresExceptionFilter());

  const dataSource = app.get(DataSource);

  try {
    await dataSource.dropDatabase();
  } catch {
    // ignore
  }
  await dataSource.synchronize();

  try {
    const userRepo = dataSource.getRepository(User);
    const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
    const adminAddress = process.env.ADMIN_ADDRESS ?? 'address';

    const existingUser = await userRepo.findOne({
      where: { username: adminUsername },
    });

    if (!existingUser) {
      const saltRoundsStr = process.env.BCRYPT_SALT_ROUNDS ?? '10';
      const saltRounds = Number.parseInt(saltRoundsStr, 10) || 10;
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
      await userRepo.save({
        username: adminUsername,
        password_hash: passwordHash,
        address: adminAddress,
      });
    }
  } catch (err) {
    console.error('[e2e] failed to ensure admin user', err);
  }

  await app.listen(0);
  const server: Server = app.getHttpServer() as Server;
  const addr = server.address();
  let port: number | string;
  if (addr && typeof addr !== 'string' && 'port' in addr) {
    port = addr.port;
  } else {
    port = process.env.PORT ?? 3000;
  }
  const baseUrl = `http://127.0.0.1:${port}`;

  const close = async () => {
    try {
      await app.close();
    } catch {
      // ignore
    }
    try {
      if (dataSource && !dataSource.isInitialized) return;
      if (dataSource && dataSource.isInitialized) await dataSource.destroy();
    } catch {
      // ignore
    }
  };

  return { app, baseUrl, dataSource, close, server };
}

export async function loginAdmin(baseUrl: string) {
  const res = await request(baseUrl).post('/auth/login').send({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  });

  return (res.body as { accessToken: string } | undefined)
    ?.accessToken as string;
}
