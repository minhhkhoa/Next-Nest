import { ApiProperty } from '@nestjs/swagger';
import { IsBooleanString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateIndustryDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên ngành nghề không được để trống' })
  name: string;

  @ApiProperty({ required: false, default: false })
  @IsBooleanString({ message: 'isDeleted phải là boolean' })
  @IsOptional()
  isDeleted: boolean;
}
