import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AiChatHistoryDocument = HydratedDocument<AiChatHistory>;

@Schema({ timestamps: true })
export class AiChatHistory {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  jobId: string;

  @Prop({ type: [{ role: String, content: String }] })
  history: { role: 'human' | 'ai'; content: string }[];
}

export const AiChatHistorySchema = SchemaFactory.createForClass(AiChatHistory);
