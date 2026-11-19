import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { GeneratePromptDto } from './dto/generate-prompt.dto.js';
import { AiQueueService } from './queue/ai-queue.service.js';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiQueueService: AiQueueService,
  ) {}

  @Post('jobs')
  @HttpCode(HttpStatus.ACCEPTED)
  async createJob(@Body() dto: GeneratePromptDto) {
    return this.aiQueueService.addGenerationJob(dto.prompt);
  }
}
