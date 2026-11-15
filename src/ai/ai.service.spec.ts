import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';

import { AiService } from './ai.service.js';
import { LLM_PROVIDER } from './providers/llm-provider.token.js';
import { LlmProviderError } from './providers/llm-provider.error.js';

describe('AiService', () => {
  let service: AiService;

  const mockProvider = {
    generate: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: LLM_PROVIDER,
          useValue: mockProvider,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should return generated response', async () => {
    mockProvider.generate.mockResolvedValue('MQTT explanation');

    await expect(service.generate('Explain MQTT')).resolves.toEqual({
      response: 'MQTT explanation',
    });
  });

  it('should convert provider errors into HTTP 503', async () => {
    mockProvider.generate.mockRejectedValue(
      new LlmProviderError('Ollama request failed'),
    );

    await expect(service.generate('Explain MQTT')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('should propagate unexpected errors', async () => {
    mockProvider.generate.mockRejectedValue(new Error('Unexpected failure'));

    await expect(service.generate('Explain MQTT')).rejects.toThrow(
      'Unexpected failure',
    );
  });
});
