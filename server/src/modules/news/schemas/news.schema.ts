import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { CateNews } from 'src/modules/cate-news/schemas/cate-new.schema';
import { MultiLang, NewsStatus, UserAudit } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
//- Định nghĩa các field có trong collection News
export class News {
  @Prop({ type: MultiLang })
  title: MultiLang;

  @Prop({ type: [{ type: Types.ObjectId, ref: CateNews.name }] }) //- tham chiếu tới CateNews
  cateNewsID: Types.ObjectId[];

  @Prop({ type: MultiLang })
  description: MultiLang;

  @Prop()
  image: string;

  @Prop({ type: MultiLang })
  summary: MultiLang;

  @Prop({ type: String, enum: NewsStatus, default: NewsStatus.INACTIVE })
  status: NewsStatus;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;

  //- update schema
  @Prop({ type: Object })
  createdBy: UserAudit;

  @Prop({ type: Object })
  updatedBy: UserAudit;

  @Prop({ type: Object })
  deletedBy: UserAudit;
}

export const NewsSchema = SchemaFactory.createForClass(News);
export type NewsDocument = HydratedDocument<News>;
