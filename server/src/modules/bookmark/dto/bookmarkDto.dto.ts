import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindBookmarkQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  currentPage: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  pageSize: number;

  @ApiPropertyOptional({ example: 'job' })
  @IsOptional()
  @IsString()
  itemType?: string;
}
