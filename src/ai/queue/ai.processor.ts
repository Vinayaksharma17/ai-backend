import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

import { LLM_PROVIDER } from '../providers/llm-provider.token.js';
import type { LlmProvider } from '../providers/llm.provider.js';
import { AI_GENERATION_QUEUE } from './ai-queue.constants.js';
import type { AiGenerationJob, AiGenerationResult } from './ai-job.types.js';

@Processor(AI_GENERATION_QUEUE, {
  concurrency: 1,
})
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LlmProvider,
  ) {
    super();
  }

  async process(
    job: Job<AiGenerationJob, AiGenerationResult>,
  ): Promise<AiGenerationResult> {
    this.logger.debug(`Processing AI generation job ${job.id}`);

    try {
      const response = await this.llmProvider.generate(job.data.prompt);

      this.logger.log(`AI generation job ${job.id} completed`);

      return { response };
    } catch (error) {
      this.logger.error(
        `AI generation job ${job.id} failed`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }
}
