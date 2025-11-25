import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MultiLang } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
//- Định nghĩa các field có trong collection Industry
export class Industry {
  @Prop({ type: MultiLang })
  name: MultiLang;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: '000-00-000' })
  parentId: string; //- mỗi industry chỉ có 1 cha(industrId) - 1 cha có nhiều industry con

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const IndustrySchema = SchemaFactory.createForClass(Industry);
export type IndustryDocument = HydratedDocument<Industry>;
