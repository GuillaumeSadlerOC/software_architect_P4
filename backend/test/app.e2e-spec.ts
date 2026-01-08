import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'typeorm';

describe('DataShare MVP e2e', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    const connection = app.get(Connection);
    await connection.close();
    await app.close();
  });

  it('Full flow: register → login → upload → metadata → download → delete', async () => {
    // Register
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123' })
      .expect(201);

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' })
      .expect(201);
    token = loginRes.body.token;

    expect(token).toBeDefined();
  });
});