import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { BOOKMARK_TYPE } from 'src/common/constants';
import { UserAudit } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
export class Bookmark extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: BOOKMARK_TYPE.map((option) => option.value),
  })
  itemType: string;

  // ID của đối tượng được bookmark (JobId hoặc CompanyId hoặc NewsId)
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  itemId: MongooseSchema.Types.ObjectId;

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

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);
export type BookmarkDocument = HydratedDocument<Bookmark>;
