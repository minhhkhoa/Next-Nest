import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserAudit } from 'src/utils/typeSchemas';

/**
 * - Module này có nhiệm vụ lưu các bản cv mà người dùng tạo ra trên hệ thống của mình
 * - Vì sau này sẽ có rất nhiều mẫu cv nên tạo module này để lưu các mẫu cv đó.
 */

@Schema({ timestamps: true })
export class UserResume {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userID: Types.ObjectId;

  @Prop({ required: true })
  resumeName: string; //- Tên gợi nhớ cho ứng viên (VD: CV Front-end Tiếng Anh)

  @Prop({ required: true })
  templateID: string; //- ID của mẫu giao diện (VD: 'modern-01', 'classic-02')

  @Prop({ type: Object, required: true })
  content: any; //- Lưu toàn bộ Object dữ liệu từ api /user/resume-data

  @Prop({ default: false })
  isDefault: boolean; //- Đánh dấu CV chính để nộp nhanh

  @Prop()
  previewImage?: string; //- Link ảnh thumbnail của CV (nếu có)

  @Prop({ default: false })
  isDeleted: boolean;

  //- Các trường Audit đồng bộ với dự án của Khoa
  @Prop({ type: Object })
  createdBy: UserAudit;

  @Prop({ type: Object })
  updatedBy: UserAudit;

  @Prop({ type: Object })
  deletedBy: UserAudit;
}

export const UserResumeSchema = SchemaFactory.createForClass(UserResume);
export type UserResumeDocument = HydratedDocument<UserResume>;
