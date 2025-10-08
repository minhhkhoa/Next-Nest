import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MultiLang } from 'src/industry/schemas/industry.schema';

@Schema({ timestamps: true })
//- Định nghĩa các field có trong collection CateNews
export class CateNews {
  @Prop({ type: MultiLang })
  name: MultiLang;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  summary: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const CateNewsSchema = SchemaFactory.createForClass(CateNews);
export type CateNewsDocument = HydratedDocument<CateNews>;
