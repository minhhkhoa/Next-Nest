import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatAiQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;

  //- cv id cua nguoi dung duoc gui kem de doi chieu (tuy chon)
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cvId?: string;
}
