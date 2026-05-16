import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JdMatchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cvId: string;

  @ApiProperty()
  @IsNotEmpty()
  jobId: string;
}
