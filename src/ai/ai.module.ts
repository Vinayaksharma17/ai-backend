import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

import { OpenAiProvider } from './providers/openai.provider.js';
import { OllamaProvider } from './providers/ollama.provider.js';
import { LLM_PROVIDER } from './providers/llm-provider.token.js';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    OpenAiProvider,
    OllamaProvider,
    {
      provide: LLM_PROVIDER,
      useFactory: (
        configService: ConfigService,
        openAiProvider: OpenAiProvider,
        ollamaProvider: OllamaProvider,
      ) => {
        const provider = configService
          .get<string>('AI_PROVIDER')
          ?.toLowerCase();

        switch (provider) {
          case 'openai':
            return openAiProvider;

          case 'ollama':
            return ollamaProvider;

          default:
            throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
        }
      },
      inject: [ConfigService, OpenAiProvider, OllamaProvider],
    },
  ],
})
export class AiModule {}
