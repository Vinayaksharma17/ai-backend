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

  it('should queue a request while another is in flight', async () => {
    const resolvers: Array<(value: string) => void> = [];
    mockProvider.generate.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolvers.push(resolve);
        }),
    );

    const first = service.generate('first request');
    const second = service.generate('second request');

    await vi.waitFor(() => expect(resolvers).toHaveLength(1));
    expect(mockProvider.generate).toHaveBeenCalledTimes(1);

    resolvers[0]('first response');
    await expect(first).resolves.toEqual({ response: 'first response' });

    await vi.waitFor(() => expect(resolvers).toHaveLength(2));
    expect(mockProvider.generate).toHaveBeenCalledTimes(2);

    resolvers[1]('second response');
    await expect(second).resolves.toEqual({ response: 'second response' });
  });

  it('should continue processing the queue after a failed request', async () => {
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
