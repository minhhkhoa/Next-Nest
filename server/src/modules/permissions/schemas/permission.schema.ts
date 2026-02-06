import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MultiLang, UserAudit } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
export class Permission {
  @Prop({ type: MultiLang })
  name: MultiLang;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  apiPath: string;

  @Prop()
  method: string;

  @Prop()
  module: string;

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

  @Prop()
  isDeleted?: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
export type PermissionDocument = HydratedDocument<Permission>;
