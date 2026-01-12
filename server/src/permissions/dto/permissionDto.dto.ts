import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindPermissionQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  currentPage: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  pageSize: number;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  method: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  module: string;
}
