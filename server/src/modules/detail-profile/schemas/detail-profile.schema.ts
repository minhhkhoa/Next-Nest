import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Industry } from 'src/modules/industry/schemas/industry.schema';
import { Skill } from 'src/modules/skill/schemas/skill.schema';
import { User } from 'src/modules/user/schemas/user.schema';
import { Gender } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
//- Định nghĩa các field có trong collection DetailProfile
export class DetailProfile {
  @Prop()
  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }] }) //- tham chiếu tới user
  userID: Types.ObjectId;

  @Prop()
  sumary: string;

  @Prop({ type: String, enum: Gender, default: Gender.Boy })
  gender: Gender;

  @Prop({ type: [{ type: Types.ObjectId, ref: Industry.name }] }) //- tham chiếu tới Industry
  industryID: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: Skill.name }] }) //- tham chiếu tới skill
  skillID: Types.ObjectId[];

  @Prop({ type: Object })
  desiredSalary: {
    min: number;
    max: number;
  };

  @Prop({ type: [Object] })
  education: [
    {
      school: string;
      degree: string;
      startDate: Date;
      endDate: Date;
    },
  ];

  @Prop()
  level: string;

  @Prop()
  address: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const DetailProfileSchema = SchemaFactory.createForClass(DetailProfile);
export type DetailProfileDocument = HydratedDocument<DetailProfile>;
