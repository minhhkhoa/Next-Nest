import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Prop } from 'src/common/override/override-prop';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { APPLICATION_STATUS } from 'src/common/constants';
import { Company } from 'src/modules/company/schemas/company.schema';
import { Job } from 'src/modules/jobs/schemas/job.schema';
import { User } from 'src/modules/user/schemas/user.schema';
import { UserAudit, MultiLang } from 'src/utils/typeSchemas';

@Schema()
export class ApplicationHistory {
  @Prop({
    type: String,
    enum: APPLICATION_STATUS.map((status) => status.value),
  })
  status: string;

  @Prop({ type: MultiLang })
  note: MultiLang;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: UserAudit })
  updatedBy: UserAudit;
}
@Schema()
export class SystemCvData {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserResume' })
  userResumeId: Types.ObjectId;

  @Prop()
  templateId: string;

  @Prop({ type: Object })
  resumeContent: any;
}

@Schema({ timestamps: true })
export class Application {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Job.name,
    required: true,
    index: true,
  })
  jobId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Company.name,
    required: true,
    index: true,
  })
  companyId: Types.ObjectId;

  //- lưu email tại lúc ứng tuyển để tránh trường hợp sau này user đổi email hoặc tài khoản bị xóa thì còn thông tin liên hệ
  @Prop({ required: true })
  email: string;

  //- Phân loại hồ sơ nộp
  @Prop({
    type: String,
    enum: ['UPLOAD_CV', 'SYSTEM_CV'],
    default: 'UPLOAD_CV',
  })
  resumeType: string;

  //- Link tải file CV (PDF). Có thể null nếu nộp bằng SYSTEM_CV
  @Prop()
  cvUrl?: string;

  //- Dữ liệu chi tiết nếu nộp bằng CV hệ thống - SYSTEM_CV (Optional)
  @Prop({ type: SystemCvData, _id: false })
  systemCvData?: SystemCvData;

  //- Thư giới thiệu bản thân. Có thể để trống nếu ứng viên không muốn cung cấp.
  @Prop({ type: MultiLang })
  coverLetter: MultiLang;

  @Prop({
    type: String,
    enum: APPLICATION_STATUS.map((status) => status.value),
    default: APPLICATION_STATUS.filter(
      (status) => status.value === 'PENDING',
    )[0].value,
    index: true,
  })
  status: string;

  //- đánh dấu đã xem bởi nhà tuyển dụng hay chưa để hiển thị trên UI
  @Prop({ default: false })
  isViewed: boolean;

  //- Nhà tuyển dụng chấm điểm ứng viên (0-100 điểm)
  @Prop({ min: 0, max: 100, default: 0 })
  score: number;

  //- Ghi chú riêng tư của HR
  @Prop({ type: MultiLang })
  recruiterNote: MultiLang;

  //- Lưu lịch phỏng vấn.
  @Prop()
  interviewTime: Date;

  //- Lưu lý do từ chối
  @Prop({ type: MultiLang })
  rejectionReason: MultiLang;

  @Prop({ type: [ApplicationHistory], default: [] })
  history: ApplicationHistory[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: UserAudit })
  createdBy: UserAudit;

  @Prop({ type: UserAudit })
  updatedBy: UserAudit;

  @Prop({ type: UserAudit })
  deletedBy: UserAudit;

  @Prop()
  deletedAt: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
export type ApplicationDocument = HydratedDocument<Application>;
