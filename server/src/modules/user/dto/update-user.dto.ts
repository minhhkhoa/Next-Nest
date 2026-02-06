import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'ID người dùng mới nếu chuyển quyền sở hữu công ty',
    required: false,
  })
  @IsOptional()
  newOwnerID?: string;
}
