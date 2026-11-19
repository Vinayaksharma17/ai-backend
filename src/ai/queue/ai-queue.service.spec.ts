import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';

import {
  AI_GENERATION_BACKOFF_DELAY_MS,
  AI_GENERATION_JOB,
  AI_GENERATION_JOB_ATTEMPTS,
  AI_GENERATION_JOB_RETENTION_COUNT,
  AI_GENERATION_QUEUE,
} from './ai-queue.constants.js';
import { AiQueueService } from './ai-queue.service.js';

describe('AiQueueService', () => {
  let service: AiQueueService;
  let queue: { add: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    queue = {
      add: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiQueueService,
        {
          provide: getQueueToken(AI_GENERATION_QUEUE),
          useValue: queue,
        },
      ],
    }).compile();

    service = module.get<AiQueueService>(AiQueueService);
  });

  it('adds the generation job to the queue and returns its id', async () => {
    queue.add.mockResolvedValue({ id: 'job-123' });

    await expect(service.addGenerationJob('Explain MQTT')).resolves.toEqual({
      jobId: 'job-123',
    });
    expect(queue.add).toHaveBeenCalledWith(
      AI_GENERATION_JOB,
      { prompt: 'Explain MQTT' },
      {
        attempts: AI_GENERATION_JOB_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: AI_GENERATION_BACKOFF_DELAY_MS,
        },
        removeOnComplete: { count: AI_GENERATION_JOB_RETENTION_COUNT },
        removeOnFail: { count: AI_GENERATION_JOB_RETENTION_COUNT },
      },
    );
  });

  it('rejects when the queue does not assign an id', async () => {
    queue.add.mockResolvedValue({ id: undefined });

    await expect(service.addGenerationJob('Explain MQTT')).rejects.toThrow(
      'AI generation job was not assigned an id',
    );
  });
});
