import { Test, TestingModule } from '@nestjs/testing';

import { AiService } from './ai.service.js';
import { AiQueueService } from './queue/ai-queue.service.js';

describe('AiService', () => {
  let service: AiService;
  let queueService: { addGenerationJob: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    queueService = {
      addGenerationJob: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AiQueueService,
          useValue: queueService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('returns the queued job id without waiting for generation', async () => {
    queueService.addGenerationJob.mockResolvedValue({ jobId: 'job-123' });

    await expect(service.generate('Explain MQTT')).resolves.toEqual({
      jobId: 'job-123',
    });
  });

  it('submits the prompt to the queue', async () => {
    queueService.addGenerationJob.mockResolvedValue({ jobId: 'job-123' });

    await service.generate('Explain MQTT');

    expect(queueService.addGenerationJob).toHaveBeenCalledWith('Explain MQTT');
  });
});
