import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

describe('AiController', () => {
  let controller: AiController;
  let aiService: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [AiService],
    }).compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generate', () => {
    it('delegates to the service and returns the result', async () => {
      const generate = vi
        .spyOn(aiService, 'generate')
        .mockResolvedValue({ response: 'generated text' });

      const result = await controller.generate({ prompt: 'hello' });

      expect(generate).toHaveBeenCalledWith('hello');
      expect(result).toEqual({ response: 'generated text' });
    });
  });
});