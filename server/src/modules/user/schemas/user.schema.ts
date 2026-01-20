import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Role } from 'src/modules/roles/schemas/role.schema';

class EmployerInfo {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
  companyID: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['PENDING', 'ACTIVE', 'INACTIVE'],
    default: 'PENDING',
  })
  userStatus: string;

  @Prop({ default: false })
  isOwner: boolean;
}

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name }) //- tham chiếu tới Role
  roleID: Types.ObjectId;

  //- login bằng fb|gg thì có thêm field này
  @Prop({ type: Object })
  provider?: {
    type: string;
    id: string;
  };

  // Trường dành riêng cho nhà tuyển dụng (Chỉ xuất hiện nếu là RECRUITER)
  @Prop({ type: EmployerInfo, _id: false })
  employerInfo?: EmployerInfo;

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

  //- phục vụ cho forgot/reset password
  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpiresAt?: Date;
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
  | 'createdBy'
  | 'updatedBy'
  | 'deletedBy'
  | 'resetToken'
  | 'resetTokenExpiresAt'
> & {
  id: string;
  roleCodeName: string;
  employerInfo?: {
    companyID: any;
    userStatus: string;
    isOwner: boolean;
  };
};
