import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import { MultiLang } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiverId: mongoose.Schema.Types.ObjectId; //- người nhận

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  senderId: mongoose.Schema.Types.ObjectId; //- người gửi

  @Prop({ type: Object, required: true })
  title: MultiLang;

  @Prop({ type: Object, required: true })
  content: MultiLang;

  @Prop({ required: true, enum: NotificationType })
  //- Phân loại để xử lý logic ở Frontend
  type: string; // VD: 'COMPANY_REQUEST', 'NEW_RESUME'

  @Prop({ type: Object, required: true })
  //- Metadata - "Linh hồn" của việc điều hướng
  metadata: {
    module: string;
    resourceId: string; //- // ID của bản ghi cụ thể
    [key: string]: any; //- viết như này thì bắt buộc có 2 field trên và vô số field nữa
  };

  @Prop({ default: false })
  isRead: boolean; //- cờ check đã đọc hay chưa

  @Prop()
  readAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
export type NotificationDocument = HydratedDocument<Notification>;
