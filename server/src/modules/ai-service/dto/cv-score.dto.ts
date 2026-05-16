import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CvScoreDto {
  @ApiProperty({
    example: '69196656a454387e65159503',
    description: 'ID của CV cần chấm',
  })
  @IsString()
  @IsNotEmpty()
  cvId: string;
}
