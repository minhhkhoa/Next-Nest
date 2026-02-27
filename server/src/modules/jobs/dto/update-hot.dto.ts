import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateHotJobDto {
  @ApiProperty({ example: '6752cc5331e2d424074213d2' })
  @IsNotEmpty()
  @IsMongoId()
  jobId: string;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  isHot: boolean;

  @ApiProperty({ example: '2026-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  hotUntil?: string;

  @ApiProperty({ example: '6752cc5331e2d424074213d2' })
  @IsOptional()
  @IsMongoId()
  issueId?: string;
}
