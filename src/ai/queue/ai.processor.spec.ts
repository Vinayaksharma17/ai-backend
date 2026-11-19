import { Test, TestingModule } from '@nestjs/testing';
import type { Job } from 'bullmq';

import { LLM_PROVIDER } from '../providers/llm-provider.token.js';
import type { AiGenerationJob, AiGenerationResult } from './ai-job.types.js';
import { AiProcessor } from './ai.processor.js';

describe('AiProcessor', () => {
  let processor: AiProcessor;
  let provider: { generate: ReturnType<typeof vi.fn> };

  const job = {
    id: 'job-123',
    data: { prompt: 'Explain MQTT' },
  } as Job<AiGenerationJob, AiGenerationResult>;

  beforeEach(async () => {
    provider = {
      generate: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiProcessor,
        {
          provide: LLM_PROVIDER,
          useValue: provider,
        },
      ],
    }).compile();

    processor = module.get<AiProcessor>(AiProcessor);
  });

  it('generates the response through the LLM provider', async () => {
    provider.generate.mockResolvedValue('MQTT explanation');

    await expect(processor.process(job)).resolves.toEqual({
      response: 'MQTT explanation',
    });
    expect(provider.generate).toHaveBeenCalledWith('Explain MQTT');
  });

  it('propagates provider failures so the job fails', async () => {
    const error = new Error('Ollama request failed');
    provider.generate.mockRejectedValue(error);

    await expect(processor.process(job)).rejects.toBe(error);
  });
});
