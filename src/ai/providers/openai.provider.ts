import { Injectable } from '@nestjs/common';
import type { LlmProvider } from './llm.provider.js';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LlmProviderError } from './llm-provider.error.js';

@Injectable()
export class OpenAiProvider implements LlmProvider {
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.client = new OpenAI({
      apiKey,
      timeout: 30000,
      maxRetries: 0,
    });
  }

  async generate(prompt: string): Promise<string> {
    const model = this.configService.get<string>('OLLAMA_MODEL');

    if (!model) {
      throw new Error('OLLAMA_MODEL is not configured');
    }

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message.content;

      if (!content) {
        throw new Error('Ollama returned an empty response');
      }

      return content;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'OLLAMA_MODEL is not configured'
      ) {
        throw error;
      }

      throw new LlmProviderError('Ollama request failed', error);
    }
  }
}
