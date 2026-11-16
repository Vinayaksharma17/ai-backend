import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { GeneratePromptDto } from './dto/generate-prompt.dto.js';
import { Throttle } from '@nestjs/throttler';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  @Post('generate')
  generate(@Body() dto: GeneratePromptDto) {
    return this.aiService.generate(dto.prompt);
  }
}
