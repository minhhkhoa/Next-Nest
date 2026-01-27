import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import {
  EMPLOYEE_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  LEVEL_OPTIONS,
} from 'src/common/constants/company-const';
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
  @Prop({ type: MultiLang })
  title: MultiLang;

  @Prop({
    type: MultiLang,
    index: true,
  })
  slug: MultiLang;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Company.name,
    index: true,
  })
  companyID: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: Industry.name }], index: true })
  industryID: Types.ObjectId[];

  @Prop({ type: MultiLang })
  description: MultiLang;

  @Prop({ type: [{ type: Types.ObjectId, ref: Skill.name }], index: true })
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

  //- kinh nghiệm làm việc
  @Prop({
    type: String,
    enum: EXPERIENCE_OPTIONS.map((option) => option.value),
  })
  experience: string;

  @Prop()
  quantity: number;

  //- recruiter/recruiter_admin có thể thay đổi trạng thái để xuất hiện hoặc ẩn tin tuyển dụng
  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  })
  status: string;

  //- recruiter_admin duyệt bài mới hiển thị ra trang chủ
  @Prop({ index: true, default: false })
  isActive: boolean;

  //- dành cho super_admin đánh dấu tin hot sẽ được đẩy lên đầu trang tuyển dụng
  @Prop({ default: false })
  isHot: boolean;

  @Prop()
  startDate: Date;

  @Prop({ index: true })
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
