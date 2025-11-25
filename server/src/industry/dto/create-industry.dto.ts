import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateIndustryDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên ngành nghề không được để trống' })
  name: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean({ message: 'isDeleted phải là boolean' })
  @IsOptional()
  isDeleted?: boolean;

  @ApiProperty({ required: false, default: '000-00-000' })
  @IsOptional()
  parentId?: string;
}
