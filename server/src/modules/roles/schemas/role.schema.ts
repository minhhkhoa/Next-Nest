import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Permission } from 'src/modules/permissions/schemas/permission.schema';
import { MultiLang } from 'src/utils/typeSchemas';

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
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
    avatar: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
    avatar: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
    avatar: string;
  };
}

export const RoleSchema = SchemaFactory.createForClass(Role);
export type RoleDocument = HydratedDocument<Role>;
