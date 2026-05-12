import { IsNotEmpty, IsString } from 'class-validator';

export class CvScoreDto {
  @IsString()
  @IsNotEmpty()
  cvId: string;
}
