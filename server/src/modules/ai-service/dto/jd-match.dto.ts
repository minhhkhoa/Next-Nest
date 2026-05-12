import { IsNotEmpty, IsString } from 'class-validator';

export class JdMatchDto {
  @IsString()
  @IsNotEmpty()
  cvId: string;

  @IsString()
  @IsNotEmpty()
  jobId: string;
}
