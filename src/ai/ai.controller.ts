import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { GeneratePromptDto } from './dto/generate-prompt.dto.js';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  generate(@Body() dto: GeneratePromptDto) {
    return this.aiService.generate(dto.prompt);
  }
}