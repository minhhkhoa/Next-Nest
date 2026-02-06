import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserResumeDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên CV không được để trống' })
  resumeName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Vui lòng chọn mẫu CV' })
  templateID: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Nội dung CV không được để trống' })
  content: any; //- Đây là cục JSON nhận được từ FE

  @ApiProperty()
  @IsOptional()
  isDefault?: boolean;
}
