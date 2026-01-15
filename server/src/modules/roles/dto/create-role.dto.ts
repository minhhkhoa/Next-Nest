import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên quyền không được để trống' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Chưa đặt trạng thái vai trò' })
  isActived: boolean;

  @ApiProperty()
  @IsNotEmpty({ message: 'Mô tả quyền không được để trống' })
  description: string;

  @ApiProperty()
  @IsArray({ message: 'permissions phải là mảng' })
  permissions: string[];
}
