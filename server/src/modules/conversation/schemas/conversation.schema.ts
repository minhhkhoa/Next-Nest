import { Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Company } from 'src/modules/company/schemas/company.schema';
import { User } from 'src/modules/user/schemas/user.schema';
import { UserAudit } from 'src/utils/typeSchemas';
import { Prop } from 'src/common/override/override-prop';


export type ConversationDocument = HydratedDocument<Conversation>;

//- Conversation(phòng chat) giữa Candidate và Company, có thể có nhiều Recruiter tham gia (được gán bởi Admin)

@Schema({ timestamps: true })
export class Conversation {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    index: true,
  })
  candidateId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Company.name,
    index: true,
  })
  companyId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    default: null,
  })
  //-  giúp linh hoạt chuyển tiếp 1 đoạn chat cho 1 người chuyên trách nếu lúc sau công ty muốn phân luồng.
  assignedRecruiterId: Types.ObjectId | null;

  @Prop()
  lastMessage: string;

  @Prop()
  lastMessageAt: Date;

  @Prop({ type: Number, default: 0 })
  unreadCandidate: number; //- Số tin nhắn mới mà Candidate chưa đọc

  @Prop({ type: Number, default: 0 })
  unreadCompany: number; //- Số tin nhắn mới mà Company chưa đọc

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

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
