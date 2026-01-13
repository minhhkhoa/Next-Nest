import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MultiLang } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
//- Định nghĩa các field có trong collection Company
export class Company {
  @Prop({ type: MultiLang })
  name: MultiLang;

  @Prop()
  address: string;

  @Prop({ type: MultiLang })
  description: MultiLang;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Industry' }] }) //- tham chiếu tới Industry
  industryID: Types.ObjectId[];

  @Prop()
  totalMember: string;

  @Prop()
  website: string;

  @Prop()
  banner: string;

  @Prop()
  logo: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] }) //- tham chiếu tới User
  userFollow: Types.ObjectId[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
export type CompanyDocument = HydratedDocument<Company>;
