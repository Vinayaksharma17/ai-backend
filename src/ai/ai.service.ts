import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import PQueue from 'p-queue';

import { LLM_PROVIDER } from './providers/llm-provider.token.js';
import type { LlmProvider } from './providers/llm.provider.js';
import { GenerateResult } from './interfaces/generate-result.interface.js';
import { LlmProviderError } from './providers/llm-provider.error.js';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly maxConcurrentRequests = 1;
  private readonly queue = new PQueue({
    concurrency: this.maxConcurrentRequests,
  });

  constructor(
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LlmProvider,
  ) {}

  async generate(prompt: string): Promise<GenerateResult> {
    if (this.queue.size > 0) {
      this.logger.debug(
        `Queueing AI request (${this.queue.size} waiting, ${this.queue.pending} running)`,
      );
    }

    return this.queue.add(() => this.run(prompt));
  }

  private async run(prompt: string): Promise<GenerateResult> {
    try {
      const response = await this.llmProvider.generate(prompt);

      return { response };
    } catch (error) {
      if (error instanceof LlmProviderError) {
        this.logger.error('AI provider request failed');

        throw new ServiceUnavailableException(
          'AI service is temporarily unavailable. Please try again later.',
        );
      }

      throw error;
    }
  }
}
