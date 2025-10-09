import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { NewsStatus } from "src/utils/typeSchemas";

export class CreateNewsDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Tên kỹ năng không được để trống' })
  title: string;

  @ApiProperty()
  @IsMongoId({ message: 'ID phải là MongoId hợp lệ' })
  cateNewsID: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Thông tin tin tức không được để trống' })
  description: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Ảnh tin tức không được để trống' })
  image: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Mô tả tin tức không được để trống' })
  summary: string;

  @ApiProperty({ enum: NewsStatus, default: NewsStatus.INACTIVE })
  @IsEnum(NewsStatus, { message: 'Status phải là active hoặc inactive' })
  @IsOptional()
  status?: NewsStatus;

  @ApiProperty({ required: false, default: false })
  @IsBoolean({ message: 'isDeleted phải là boolean' })
  @IsOptional()
  isDeleted?: boolean;
}
