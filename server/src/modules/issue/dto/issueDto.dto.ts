import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, IsArray, IsNotEmpty, IsMongoId } from 'class-validator';
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

export class DeleteManyIssueDto {
  @ApiProperty({
    description: 'Array of issue IDs to delete',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  ids: string[];
}
