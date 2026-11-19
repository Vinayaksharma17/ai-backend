import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AiController } from './../src/ai/ai.controller.js';
import { AiQueueService } from './../src/ai/queue/ai-queue.service.js';

describe('AiModule (e2e)', () => {
  let app: INestApplication;
  const queueService = {
    addGenerationJob: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    queueService.addGenerationJob.mockResolvedValue({ jobId: 'job-123' });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiQueueService,
          useValue: queueService,
        },
      ],
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

  it('/ai/jobs (POST) returns an accepted job id', () => {
    return request(app.getHttpServer())
      .post('/ai/jobs')
      .send({ prompt: 'Explain MQTT in simple terms' })
      .expect(202)
      .expect(({ body }) => {
        expect(body).toEqual({ jobId: 'job-123' });
      });
  });

  it('/ai/jobs (POST) passes the prompt to the queue', async () => {
    await request(app.getHttpServer())
      .post('/ai/jobs')
      .send({ prompt: 'Explain MQTT in simple terms' })
      .expect(202);

    expect(queueService.addGenerationJob).toHaveBeenCalledWith(
      'Explain MQTT in simple terms',
    );
  });

  it('/ai/jobs (POST) rejects a missing prompt', () => {
    return request(app.getHttpServer()).post('/ai/jobs').send({}).expect(400);
  });

  it('/ai/jobs (POST) rejects an empty prompt', () => {
    return request(app.getHttpServer())
      .post('/ai/jobs')
      .send({ prompt: '' })
      .expect(400);
  });

  it('/ai/jobs (POST) rejects unknown properties', () => {
    return request(app.getHttpServer())
      .post('/ai/jobs')
      .send({ prompt: 'hello', extra: true })
      .expect(400);
  });
});
