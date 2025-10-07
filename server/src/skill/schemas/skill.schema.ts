import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MultiLang } from 'src/industry/schemas/industry.schema';

@Schema({ timestamps: true })
//- Định nghĩa các field có trong collection Skill
export class Skill {
  @Prop({ type: MultiLang })
  name: MultiLang;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Industry' }] }) //- tham chiếu tới industry
  industryID: Types.ObjectId[]; //- Mảng chứa _id của các ngành nghề liên quan

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
export type SkillDocument = HydratedDocument<Skill>;
