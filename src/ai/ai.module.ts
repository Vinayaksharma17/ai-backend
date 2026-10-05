import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { OpenAiProvider } from './providers/openai.provider.js';
import { LLM_PROVIDER } from './providers/llm-provider.token.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    OpenAiProvider,
    { provide: LLM_PROVIDER, useExisting: OpenAiProvider },
  ],
})
export class AiModule {}
