import { Test, TestingModule } from '@nestjs/testing';

import { AiController } from './ai.controller.js';
import { AiQueueService } from './queue/ai-queue.service.js';

describe('AiController', () => {
  let controller: AiController;
  let queueService: { addGenerationJob: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    queueService = {
      addGenerationJob: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiQueueService,
          useValue: queueService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createJob', () => {
    it('submits the prompt to the queue and returns the job id', async () => {
      queueService.addGenerationJob.mockResolvedValue({ jobId: 'job-123' });

      const result = await controller.createJob({ prompt: 'hello' });

      expect(queueService.addGenerationJob).toHaveBeenCalledWith('hello');
      expect(result).toEqual({ jobId: 'job-123' });
    });
  });
});
