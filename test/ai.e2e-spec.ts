import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('AiModule (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ai/generate (POST) returns a response', () => {
    return request(app.getHttpServer())
      .post('/ai/generate')
      .send({ prompt: 'Explain MQTT in simple terms' })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          response: 'Echo: Explain MQTT in simple terms',
        });
      });
  });

  it('/ai/generate (POST) rejects a missing prompt', () => {
    return request(app.getHttpServer())
      .post('/ai/generate')
      .send({})
      .expect(400);
  });

  it('/ai/generate (POST) rejects an empty prompt', () => {
    return request(app.getHttpServer())
      .post('/ai/generate')
      .send({ prompt: '' })
      .expect(400);
  });

  it('/ai/generate (POST) rejects unknown properties', () => {
    return request(app.getHttpServer())
      .post('/ai/generate')
      .send({ prompt: 'hello', extra: true })
      .expect(400);
  });
});