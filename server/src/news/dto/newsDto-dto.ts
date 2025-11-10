import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { NewsStatus } from 'src/utils/typeSchemas';

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
  @ValidateIf((o) => o.cateNewsID !== '' && o.cateNewsID != null)
  @IsMongoId({ message: 'cateNewsID phải là MongoId hợp lệ' })
  cateNewsID?: string;

  @ApiPropertyOptional()
  // @IsEnum(NewsStatus, { message: 'Status phải là active hoặc inactive hoặc ""' })
  @IsOptional()
  status?: NewsStatus;
}
