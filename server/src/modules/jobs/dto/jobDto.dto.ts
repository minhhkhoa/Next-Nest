import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

//- tạm thời để thế này, sau này sẽ thêm các trường filter khác
export class FindJobQueryDto {
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
}

export class DeleteManyJobDto {
  @ApiProperty({
    description: 'Array of job IDs to delete',
    type: [String],
  })
  @IsArray({ message: 'ids phải là một mảng' })
  @IsNotEmpty({
    each: true,
    message: 'Mỗi phần tử trong mảng ids không được rỗng',
  })
  @IsMongoId({
    each: true,
    message: 'Mỗi phần tử trong mảng ids phải là một Mongo ID hợp lệ',
  })
  ids: string[];
}
