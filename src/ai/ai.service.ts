import { Injectable } from '@nestjs/common';

import { AiQueueService } from './queue/ai-queue.service.js';
import type { AiGenerationJobResponse } from './queue/ai-job.types.js';

@Injectable()
export class AiService {
  constructor(private readonly aiQueueService: AiQueueService) {}

  async generate(prompt: string): Promise<AiGenerationJobResponse> {
    return this.aiQueueService.addGenerationJob(prompt);
  }
}
