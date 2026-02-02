import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
  //- chỉ nhận 2 giá trị truyền lên 'active' hoặc 'inactive'/ không truyền
  @IsIn(['', 'active', 'inactive'], {
    message: 'status chỉ được là active hoặc inactive',
  })
  status: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  //- chỉ nhận 2 giá trị truyền lên 'active' hoặc 'inactive'/ không truyền
  @IsIn(['', 'true', 'false'], {
    message: 'isActive chỉ được là true hoặc false',
  })
  isActive: string;

  //- người tạo
  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  nameCreatedBy: string;

  //- dành riêng cho super_admin lọc các job Hot
  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsIn(['', 'true', 'false'], {
    message: 'isHot chỉ được là true hoặc false',
  })
  isHot: string;

  //- dành riêng cho super_admin lọc các job đã xóa mềm
  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsIn(['', 'true', 'false'], {
    message: 'isDeleted chỉ được là true hoặc false',
  })
  isDeleted?: string;

  //- Hiện đang để tìm theo tên công ty hoặc mã số thuế
  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  fieldCompany?: string;
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
