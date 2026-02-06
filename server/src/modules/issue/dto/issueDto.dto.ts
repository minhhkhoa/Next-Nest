import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  ISSUE_STATUS_OPTIONS,
  ISSUE_TYPE_OPTIONS,
} from 'src/common/constants/issue-const';

export class FindIssueQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  currentPage: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  pageSize: number;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  @IsIn(ISSUE_TYPE_OPTIONS.map((opt) => opt.value))
  type: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  @IsIn(ISSUE_STATUS_OPTIONS.map((opt) => opt.value))
  status: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  searchText: string;
}
