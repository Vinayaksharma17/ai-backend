import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class GeneratePromptDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(4000)
  prompt: string;
}