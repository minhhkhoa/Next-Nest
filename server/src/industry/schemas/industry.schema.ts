import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false }) //- subdocument, không tạo _id riêng
export class MultiLang {
  @Prop() vi: string;
  @Prop() en: string;
}

//- Định nghĩa các field có trong collection Industry
export class Industry {
  @Prop({ type: MultiLang })
  name: MultiLang;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const IndustrySchema = SchemaFactory.createForClass(Industry);
