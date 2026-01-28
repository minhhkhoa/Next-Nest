import { ApiOAuth2, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
  title: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  //- người tạo
  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  nameCreatedBy: string;

  //- dành cho super_admin lọc các job Hot
  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsBoolean()
  isHot: boolean;
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

export class RecruiteAdminApproveJobDto {
  @ApiPropertyOptional({ example: '65f0c9b2a3b4c5d6e7f8a901' })
  @IsMongoId()
  jobId: string;

  @ApiPropertyOptional({ example: 'ACCEPT/REJECT' })
  @IsString()
  @IsIn(['ACCEPT', 'REJECT'], {
    message: 'action chỉ được là ACCEPT hoặc REJECT',
  })
  action: string;
}
