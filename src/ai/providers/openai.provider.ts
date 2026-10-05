import { Injectable } from '@nestjs/common';
import { LlmProvider } from './llm.provider.js';

@Injectable()
export class OpenAiProvider implements LlmProvider {
  async generate(prompt: string): Promise<string> {
    // Actual OpenAI API call will go here
    return 'Response from OpenAI';
  }
}
