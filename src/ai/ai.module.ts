import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { OpenAiProvider } from './providers/openai.provider.js';
import { LLM_PROVIDER } from './providers/llm-provider.token.js';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    OpenAiProvider,
    {
      provide: LLM_PROVIDER,
      useFactory: (
        configService: ConfigService,
        openAiProvider: OpenAiProvider,
      ) => {
        const provider = configService.get<string>('AI_PROVIDER');

        if (provider !== 'openai') {
          throw new Error(`Unsupported AI provider: ${provider}`);
        }

        return openAiProvider;
      },
      inject: [ConfigService, OpenAiProvider],
    },
  ],
})
export class AiModule {}
