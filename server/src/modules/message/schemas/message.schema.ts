import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { UserAudit } from 'src/utils/typeSchemas';
import { User } from 'src/modules/user/schemas/user.schema';
import { Conversation } from 'src/modules/conversation/schemas/conversation.schema';

export type MessageDocument = HydratedDocument<Message>;

class MetadataMessage {
  //- Hình ảnh
  @Prop()
  imageUrl?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  fileSize?: number;

  @Prop()
  fileExt?: string;

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  //- CV hệ thống (đã ứng tuyển có sẵn trong DB)
  @Prop()
  cvId?: string;

  @Prop()
  cvName?: string;

  @Prop()
  templateID?: string;

  @Prop()
  templateId?: string;

  @Prop({ type: Object })
  resumeContent?: any;

  @Prop()
  isDefault?: boolean;

  @Prop()
  previewImage?: string;

  @Prop()
  updatedAt?: string;

  //- CV dạng link bên ngoài gửi
  @Prop()
  link?: string;

  @Prop()
  fileName?: string;

  //- Tham chiếu (Reference) tới Job Post từ trang chi tiết
  @Prop()
  jobId?: string;

  @Prop()
  jobImage?: string;

  @Prop()
  jobTitle?: string;

  @Prop()
  jobSlug?: string;

  @Prop()
  salary?: string;

  @Prop()
  thumbnail?: string;
}

export const SENDER_TYPE_OPTIONS = ['CANDIDATE', 'RECRUITER'] as const;
export const MESSAGE_TYPE_OPTIONS = [
  'TEXT',
  'IMAGE',
  'CV_SYSTEM',
  'CV_LINK',
  'JOB_REFERENCE',
] as const;

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Conversation.name,
    index: true,
  })
  conversationId: Types.ObjectId; //- Liên kết tới Conversation (phòng chat) mà tin nhắn này thuộc về

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    index: true,
  })
  senderId: Types.ObjectId; //- Người gửi tin nhắn (có thể là Candidate hoặc Recruiter, dựa vào senderType)

  @Prop({
    type: String,
    enum: SENDER_TYPE_OPTIONS,
  })
  senderType: string; //- Xác định người gửi là Candidate hay Recruiter, giúp phân biệt khi hiển thị giao diện chat

  @Prop({
    type: String,
    enum: MESSAGE_TYPE_OPTIONS,
    default: 'TEXT',
  })
  type: string;

  @Prop({ default: '' })
  content: string;

  //- Lưu trữ các trường JSON linh động theo loại tin nhắn (type)
  @Prop({ type: Object, default: {} })
  metadata: MetadataMessage;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt: Date | null;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: Object })
  createdBy: UserAudit;

  @Prop({ type: Object })
  updatedBy: UserAudit;

  @Prop({ type: Object })
  deletedBy: UserAudit;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
