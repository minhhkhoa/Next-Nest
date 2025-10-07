import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateIndustryDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên ngành nghề không được để trống' })
  name: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean({ message: 'isDeleted phải là boolean' })
  @IsOptional()
  isDeleted?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsArray({ message: 'relatedIndustries phải là mảng' })
  @IsMongoId({
    each: true,
    message: 'Mỗi ID trong relatedIndustries phải là MongoId hợp lệ',
  })
  relatedIndustries?: string[];
}
