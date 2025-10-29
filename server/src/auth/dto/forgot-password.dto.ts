import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'test@gmail.com', description: 'Email người dùng' })
  @IsEmail()
  email: string;
}
