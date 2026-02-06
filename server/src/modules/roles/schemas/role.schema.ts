import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Permission } from 'src/modules/permissions/schemas/permission.schema';
import { MultiLang, UserAudit } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
export class Role {
  @Prop({ type: MultiLang })
  name: MultiLang;

  @Prop({ type: MultiLang })
  description: MultiLang;

  @Prop({ default: true })
  isActived: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: Permission.name }] })
  permissions: Types.ObjectId[];

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

export const RoleSchema = SchemaFactory.createForClass(Role);
export type RoleDocument = HydratedDocument<Role>;
