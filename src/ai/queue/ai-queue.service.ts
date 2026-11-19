import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';

import {
  AI_GENERATION_BACKOFF_DELAY_MS,
  AI_GENERATION_JOB,
  AI_GENERATION_JOB_ATTEMPTS,
  AI_GENERATION_JOB_RETENTION_COUNT,
  AI_GENERATION_QUEUE,
} from './ai-queue.constants.js';
import type {
  AiGenerationJob,
  AiGenerationJobResponse,
  AiGenerationResult,
} from './ai-job.types.js';

@Injectable()
export class AiQueueService {
  constructor(
    @InjectQueue(AI_GENERATION_QUEUE)
    private readonly queue: Queue<AiGenerationJob, AiGenerationResult>,
  ) {}

  async addGenerationJob(prompt: string): Promise<AiGenerationJobResponse> {
    const job = await this.queue.add(
      AI_GENERATION_JOB,
      { prompt },
      {
        attempts: AI_GENERATION_JOB_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: AI_GENERATION_BACKOFF_DELAY_MS,
        },
        removeOnComplete: { count: AI_GENERATION_JOB_RETENTION_COUNT },
        removeOnFail: { count: AI_GENERATION_JOB_RETENTION_COUNT },
      },
    );

    if (!job.id) {
      throw new Error('AI generation job was not assigned an id');
    }

    return { jobId: job.id };
  }
}
