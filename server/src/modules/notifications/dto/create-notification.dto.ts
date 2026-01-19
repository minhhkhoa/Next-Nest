import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { NotificationType } from 'src/common/constants/notification-type.enum';

class MetadataDto {
  @IsNotEmpty({ message: 'Module không được để trống' })
  @IsString()
  module: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  [key: string]: any;
}

export class CreateNotificationDto {
  @ApiProperty()
  @IsMongoId({ message: 'ReceiverID phải là MongoId hợp lệ' })
  @IsNotEmpty({ message: 'Người nhận không được để trống' })
  receiverId: string;

  @ApiPropertyOptional()
  @IsMongoId({ message: 'SenderID phải là MongoId hợp lệ' })
  @IsOptional()
  senderId?: string;

  // Thay đổi: Nhận chuỗi đơn thuần từ Client/Service khác
  @ApiProperty({ description: 'Tiêu đề bằng tiếng Việt' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Nội dung bằng tiếng Việt' })
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsString()
  content: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType, { message: 'Loại thông báo không hợp lệ' })
  type: NotificationType;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
