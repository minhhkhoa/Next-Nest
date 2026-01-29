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

export class FindCompanyQueryDto {
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

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Filter for deleted companies. Can be true or false.',
    example: false,
  })
  @IsOptional()
  @IsString()
  isDeleted?: string;
}

export class FindCompanyWithTaxCode {
  @ApiPropertyOptional({ example: '' })
  @IsString()
  taxCode: string;
}

export class JoinCompanyDto {
  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsMongoId()
  companyID: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  note: string;
}
export class ApproveCompanyDto {
  @ApiPropertyOptional({ example: '65f0c9b2a3b4c5d6e7f8a901' })
  @IsMongoId()
  targetUserId: string;

  @ApiPropertyOptional({ example: 'ACCEPT/REJECT' })
  @IsString()
  @IsIn(['ACCEPT', 'REJECT'], {
    message: 'action chỉ được là ACCEPT hoặc REJECT',
  })
  action: string;
}

export class AdminApproveCompanyDto {
  @ApiPropertyOptional({ example: '65f0c9b2a3b4c5d6e7f8a901' })
  @IsMongoId()
  companyID: string;

  @ApiPropertyOptional({ example: 'ACCEPT/REJECT' })
  @IsString()
  @IsIn(['ACCEPT', 'REJECT'], {
    message: 'action chỉ được là ACCEPT hoặc REJECT',
  })
  action: string;
}

export class FindJoinRequestDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  currentPage: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  pageSize: number;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  name?: string; // Tên người xin gia nhập cần tìm
}

export class DeleteManyCompanyDto {
  @ApiProperty({
    description: 'Array of company IDs to delete',
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
