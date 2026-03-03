import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindApplicationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  currentPage: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  pageSize: number;

  @ApiPropertyOptional({
    description: 'Filter for deleted applications. Can be true or false.',
    example: false,
  })
  
  @IsOptional()
  @IsString()
  isDeleted?: string;
}
