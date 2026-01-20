import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Industry } from 'src/modules/industry/schemas/industry.schema';
import { MultiLang } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
//- Định nghĩa các field có trong collection Company
export class Company {
  @Prop({ type: MultiLang })
  name: MultiLang;

  @Prop({ required: true, unique: true }) //- Lưu mã số thuế
  taxCode: string;

  @Prop({
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string; // Phục vụ Giai đoạn 3: Super Admin duyệt công ty

  @Prop()
  address: string;

  @Prop({ type: MultiLang })
  description: MultiLang;

  @Prop({ type: [{ type: Types.ObjectId, ref: Industry.name }] }) //- tham chiếu tới Industry
  industryID: Types.ObjectId[];

  @Prop()
  totalMember: string;

  @Prop()
  website: string;

  @Prop()
  banner: string;

  @Prop()
  logo: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] }) //- tham chiếu tới User tránh lỗi Circular Dependency vì 2 schema company và user nó đang gọi tới nhau nên không thể dùng User.name được
  userFollow: Types.ObjectId[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
  };
}

export const CompanySchema = SchemaFactory.createForClass(Company);
export type CompanyDocument = HydratedDocument<Company>;
