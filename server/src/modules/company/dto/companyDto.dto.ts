import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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
  companyID: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  note: string;
}
