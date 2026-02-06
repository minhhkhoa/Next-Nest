import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @ApiPropertyOptional({ enum: ['PENDING', 'ACCEPT', 'REJECTED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'ACCEPT', 'REJECTED'], {
    message: 'Trạng thái không hợp lệ',
  })
  status?: string;
}
