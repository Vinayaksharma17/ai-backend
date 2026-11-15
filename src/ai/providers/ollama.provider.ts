import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import type { LlmProvider } from './llm.provider.js';
import { LlmProviderError } from './llm-provider.error.js';

@Injectable()
export class OllamaProvider implements LlmProvider {
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('OLLAMA_BASE_URL');

    if (!baseURL) {
      throw new Error('OLLAMA_BASE_URL is not configured');
    }

    this.client = new OpenAI({
      baseURL,
      apiKey: 'ollama',
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
