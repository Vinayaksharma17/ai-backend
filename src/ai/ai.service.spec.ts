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

  it('should reject a request while another is in flight', async () => {
    let resolveFirst: (value: string) => void;
    mockProvider.generate.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        resolveFirst = resolve;
      }),
    );

    const first = service.generate('first request');

    await expect(service.generate('second request')).rejects.toThrow(
      ServiceUnavailableException,
    );

    resolveFirst!('first response');
    await expect(first).resolves.toEqual({ response: 'first response' });

    expect(mockProvider.generate).toHaveBeenCalledTimes(1);
  });

  it('should release the slot after a failed request', async () => {
    mockProvider.generate
      .mockRejectedValueOnce(new LlmProviderError('Ollama request failed'))
      .mockResolvedValueOnce('second response');

    await expect(service.generate('first request')).rejects.toThrow(
      ServiceUnavailableException,
    );

    await expect(service.generate('second request')).resolves.toEqual({
      response: 'second response',
    });
  });
});
