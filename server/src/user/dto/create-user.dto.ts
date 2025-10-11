import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

//- lớp này là do admin tạo tài khoản cho employer còn candidate sẽ có phương thức register riêng
export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Email người dùng không được để trống' })
  @IsEmail({}, { message: 'Email người dùng không đúng định dạng' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password người dùng không được để trống' })
  password: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  avatar?: string;

  @ApiProperty()
  @IsMongoId({ message: 'ID công ty phải là MongoId hợp lệ' })
  companyID: string;

  // @ApiProperty()
  // @IsMongoId({ message: 'ID role phải là MongoId hợp lệ' })
  // roleID: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean({ message: 'isDeleted phải là boolean' })
  @IsOptional()
  isDeleted?: boolean;
}
