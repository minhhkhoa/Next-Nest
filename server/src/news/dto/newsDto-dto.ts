import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindNewsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  currentPage: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  pageSize: number;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsMongoId({
    each: true,
    message: 'ID trong cateNewsID phải là MongoId hợp lệ',
  })
  cateNewsID?: string;
}
