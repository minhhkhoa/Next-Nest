import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCateNewsDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên danh mục tin tức không được để trống' })
  name: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean({ message: 'isDeleted phải là boolean' })
  @IsOptional()
  isDeleted?: boolean;

  @ApiProperty()
  @IsNotEmpty({ message: 'Summary danh mục tin tức không được để trống' })
  summary: string;
}
