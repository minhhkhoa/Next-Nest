import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export class MultiLang {
  @Prop() vi: string;
  @Prop() en: string;
}

@Schema({ timestamps: true })
//- Định nghĩa các field có trong collection Industry
export class Industry {
  @Prop({ type: MultiLang })
  name: MultiLang;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Industry' }] }) //- tham chiếu tới chính nó
  relatedIndustries: Types.ObjectId[]; //- Mảng chứa _id của các ngành nghề liên quan

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const IndustrySchema = SchemaFactory.createForClass(Industry);
export type IndustryDocument = HydratedDocument<Industry>;
