import { IsEnum, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { MESSAGE_TYPE_OPTIONS } from '../schemas/message.schema';

export class CreateMessageDto {
  @IsMongoId({ message: 'Conversation ID không hợp lệ' })
  @IsNotEmpty({ message: 'Conversation ID là bắt buộc' })
  conversationId: string;

  @IsEnum(MESSAGE_TYPE_OPTIONS, { message: 'Loại tin nhắn không hợp lệ' })
  @IsNotEmpty({ message: 'Loại tin nhắn là bắt buộc' })
  type: string;

  @IsString({ message: 'Nội dung tin nhắn phải là chuỗi' })
  @IsOptional()
  content?: string;

  @IsObject({ message: 'Metadata phải là một object' })
  @IsOptional()
  metadata?: Record<string, any>;
}

