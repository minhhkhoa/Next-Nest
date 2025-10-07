import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @ApiPropertyOptional({
    type: 'array', //- Chỉ định là mảng
    items: { type: 'string' }, //- Mỗi phần tử là chuỗi
    example: [''],
  })
  @IsOptional()
  @IsMongoId({
    each: true,
    message: 'Mỗi ID trong industryID phải là MongoId hợp lệ',
  })
  industryID?: string | string[];
}
