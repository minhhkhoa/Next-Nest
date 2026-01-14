import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { typeMethods } from 'src/utils/typeSchemas';

export class CreatePermissionDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên quyền không được để trống' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Mã quyền không được để trống' })
  code: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'apiPath không được để trống' })
  apiPath: string;

  @ApiProperty({ enum: typeMethods, default: typeMethods.GET })
  @IsNotEmpty({ message: 'Phương thức https không được để trống' })
  method: typeMethods;

  @ApiProperty()
  @IsNotEmpty({ message: 'Loại module không được để trống' })
  module: string;
}
