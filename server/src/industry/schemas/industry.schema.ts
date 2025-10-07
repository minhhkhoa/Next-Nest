import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
}

export const IndustrySchema = SchemaFactory.createForClass(Industry);
export type IndustryDocument = HydratedDocument<Industry>;
