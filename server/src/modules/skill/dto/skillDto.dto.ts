import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindSkillQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  currentPage: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  pageSize: number;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: ['id1', 'id2'], type: [String] })
  @IsOptional()
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [value];
  })
  industryIDs?: string[];
}
