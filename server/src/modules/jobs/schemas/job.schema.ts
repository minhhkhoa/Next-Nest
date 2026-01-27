import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import {
  EMPLOYEE_TYPE_OPTIONS,
  LEVEL_OPTIONS,
} from 'src/common/constants/notification-type.enum';
import { Company } from 'src/modules/company/schemas/company.schema';
import { Industry } from 'src/modules/industry/schemas/industry.schema';
import { Skill } from 'src/modules/skill/schemas/skill.schema';
import { MultiLang, UserAudit } from 'src/utils/typeSchemas';

class SalaryRange {
  @Prop()
  min: number;

  @Prop()
  max: number;

  @Prop({ type: String, enum: ['VND', 'USD'], default: 'VND' })
  currency: string;
}

@Schema({ timestamps: true })
export class Job {
  @Prop()
  title: MultiLang;

  @Prop()
  slug: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Company.name })
  companyID: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: Industry.name }] })
  industryID: Types.ObjectId[];

  @Prop()
  description: MultiLang;

  @Prop({ type: [{ type: Types.ObjectId, ref: Skill.name }] })
  skills: Types.ObjectId[];

  @Prop()
  location: string;

  @Prop()
  salary: SalaryRange;

  @Prop({
    type: String,
    enum: LEVEL_OPTIONS.map((option) => option.value),
  })
  level: string;

  @Prop({
    type: String,
    enum: EMPLOYEE_TYPE_OPTIONS.map((option) => option.value),
  })
  employeeType: string;

  @Prop()
  quantity: number;

  //- recruiter/recruiter_admin có thể thay đổi trạng thái để xuất hiện hoặc ẩn tin tuyển dụng
  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  //- recruiter_admin duyệt bài mới hiển thị ra trang chủ
  @Prop()
  isActive: boolean;

  //- dành cho super_admin đánh dấu tin hot sẽ được đẩy lên đầu trang tuyển dụng
  @Prop()
  isHot: boolean;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  //- số lượt xem tin tuyển dụng
  @Prop({
    type: Number,
    default: 0,
  })
  totalViews: number;

  //- số lượt ứng tuyển
  @Prop({
    type: Number,
    default: 0,
  })
  totalApplied: number;

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

export const JobSchema = SchemaFactory.createForClass(Job);
export type JobDocument = HydratedDocument<Job>;
