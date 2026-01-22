import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsMongoId,
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
