import { Inject, Injectable } from '@nestjs/common';
import { LLM_PROVIDER } from './providers/llm-provider.token.js';
import type { LlmProvider } from './providers/llm.provider.js';
import { GenerateResult } from './interfaces/generate-result.interface.js';

@Injectable()
export class AiService {
  constructor(
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LlmProvider,
  ) {}
  async generate(prompt: string): Promise<GenerateResult> {
    const response = await this.llmProvider.generate(prompt);

    return { response };
  }
}
