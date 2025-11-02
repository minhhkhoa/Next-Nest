import { IsMongoId, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  @IsMongoId()
  userID: string;

  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
