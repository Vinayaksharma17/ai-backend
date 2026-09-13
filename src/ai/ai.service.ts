import { Injectable } from '@nestjs/common';

export interface GenerateResult {
  response: string;
}

@Injectable()
export class AiService {
  async generate(prompt: string): Promise<GenerateResult> {
    return { response: `Echo: ${prompt}` };
  }
}