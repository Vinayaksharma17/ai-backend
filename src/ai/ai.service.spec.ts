import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service.js';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('returns a response for the given prompt', async () => {
      await expect(service.generate('Explain MQTT in simple terms')).resolves.toEqual(
        { response: 'Echo: Explain MQTT in simple terms' },
      );
    });
  });
});