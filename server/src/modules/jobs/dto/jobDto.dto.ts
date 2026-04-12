import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  EMPLOYEE_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  LEVEL_OPTIONS,
} from 'src/common/constants/company-const';

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

  @ApiPropertyOptional({ example: 'Hà Nội' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'intern' })
  @IsOptional()
  @IsString()
  level?: string;
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

export class FindJobAdvancedPublicQueryDto {
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
  @IsString()
  fieldCompany?: string;

  @ApiPropertyOptional({ example: 'Hà Nội' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsIn(['', ...LEVEL_OPTIONS.map((option) => option.value)], {
    message: 'level không hợp lệ',
  })
  level?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsIn(['', ...EMPLOYEE_TYPE_OPTIONS.map((option) => option.value)], {
    message: 'employeeType không hợp lệ',
  })
  employeeType?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsIn(['', ...EXPERIENCE_OPTIONS.map((option) => option.value)], {
    message: 'experience không hợp lệ',
  })
  experience?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsIn(['', 'true', 'false'], {
    message: 'isHot chỉ được là true hoặc false',
  })
  isHot?: string;

  @ApiPropertyOptional({ example: 10000000 })
  @IsOptional()
  @IsNumber()
  minSalary?: number;

  @ApiPropertyOptional({ example: 30000000 })
  @IsOptional()
  @IsNumber()
  maxSalary?: number;

  @ApiPropertyOptional({ example: 'VND' })
  @IsOptional()
  @IsIn(['', 'VND', 'USD'], {
    message: 'currency chỉ được là VND hoặc USD',
  })
  currency?: string;

  @ApiPropertyOptional({ example: ['67f2d36fbcf86cd799439011'], type: [String] })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
  })
  @IsArray()
  @IsMongoId({ each: true, message: 'industryIDs phải là MongoId hợp lệ' })
  industryIDs?: string[];

  @ApiPropertyOptional({ example: ['67f2d36fbcf86cd799439012'], type: [String] })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
  })
  @IsArray()
  @IsMongoId({ each: true, message: 'skillIDs phải là MongoId hợp lệ' })
  skillIDs?: string[];
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
