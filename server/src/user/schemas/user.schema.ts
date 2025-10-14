import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
//- Định nghĩa các field có trong collection User
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  avatar: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Company' }] }) //- tham chiếu tới Company
  companyID?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }] }) //- tham chiếu tới Role
  roleID: Types.ObjectId;

  @Prop()
  refresh_token: string;

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
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;

export type UserResponse = Omit<
  User,
  | 'password'
  | 'refresh_token'
  | 'isDeleted'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> & { _id: string };
