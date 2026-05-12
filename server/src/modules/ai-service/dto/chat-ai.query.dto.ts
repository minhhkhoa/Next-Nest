import { IsNotEmpty, IsString } from 'class-validator';

export class ChatAiQueryDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  question: string;
}
