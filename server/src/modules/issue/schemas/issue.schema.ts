import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  ISSUE_STATUS_OPTIONS,
  ISSUE_TYPE_OPTIONS,
} from 'src/common/constants/issue-const';
import { UserAudit } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
export class Issue {
  @Prop({ type: UserAudit, required: true })
  createdBy: UserAudit;

  //- Phân loại yêu cầu
  @Prop({
    required: true,
    enum: ISSUE_TYPE_OPTIONS.map((option) => option.value),
  })
  type: string;

  // targetId: Lưu ID của Job/company/user bị report hoặc liên quan đến issue
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  targetId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  //- Mảng URL ảnh bằng chứng đính kèm
  @Prop({ type: [String] })
  attachments: string[];

  @Prop({
    default: 'PENDING',
    enum: ISSUE_STATUS_OPTIONS.map((option) => option.value),
  })
  status: string;

  //- Phần dành cho Admin phản hồi
  @Prop({
    type: {
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      repliedAt: Date,
    },
    _id: false, //- Không tạo _id riêng cho subdocument này
  })
  adminResponse: {
    adminId: mongoose.Schema.Types.ObjectId;
    content: string;
    repliedAt: Date;
  };

  //- Lưu lịch sử thay đổi trạng thái để Admin dễ theo dõi
  @Prop({
    type: [{ status: String, updatedAt: Date, note: String }],
    _id: false,
  })
  history: {
    status: string;
    updatedAt: Date;
    note: string;
  }[];
}

export const IssueSchema = SchemaFactory.createForClass(Issue);
export type IssueDocument = HydratedDocument<Issue>;
