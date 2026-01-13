import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên công ty không được để trống' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Địa chỉ công ty không được để trống' })
  address: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Mô tả công ty không được để trống' })
  description: string;

  @ApiProperty()
  @IsArray({ message: 'industryID phải là mảng' })
  @IsMongoId({
    each: true,
    message: 'Mỗi ID trong industryID phải là MongoId hợp lệ',
  })
  industryID: string[];

  @ApiProperty()
  @IsNotEmpty({ message: 'Số lượng nhân viên công ty không được để trống' })
  totalMember: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Website công ty không được để trống' })
  website: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Banner công ty không được để trống' })
  banner: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Logo công ty không được để trống' })
  logo: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean({ message: 'isDeleted phải là boolean' })
  @IsOptional()
  isDeleted?: boolean;
}
