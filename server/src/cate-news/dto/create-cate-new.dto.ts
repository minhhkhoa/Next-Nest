import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCateNewsDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên danh mục tin tức không được để trống' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Summary danh mục tin tức không được để trống' })
  summary: string;
}
