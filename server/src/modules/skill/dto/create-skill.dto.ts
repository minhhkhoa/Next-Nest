import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateSkillDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên kỹ năng không được để trống' })
  name: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean({ message: 'isDeleted phải là boolean' })
  @IsOptional()
  isDeleted?: boolean;

  @ApiProperty()
  @IsArray({ message: 'industryID phải là mảng objectId' })
  @IsMongoId({
    each: true,
    message: 'Mỗi ID trong industryID phải là MongoId hợp lệ',
  })
  industryID: string[];
}
