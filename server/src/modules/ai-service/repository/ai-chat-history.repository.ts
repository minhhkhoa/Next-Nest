import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AiChatHistory,
  AiChatHistoryDocument,
} from '../schemas/ai-chat-history.schema';

@Injectable()
export class AiChatHistoryRepository {
  constructor(
    @InjectModel(AiChatHistory.name)
    private readonly aiChatHistoryModel: Model<AiChatHistoryDocument>,
  ) {}

  async findBySessionId(sessionId: string): Promise<AiChatHistoryDocument | null> {
    return this.aiChatHistoryModel.findOne({ sessionId }).exec();
  }

  async createOrUpdate(
    sessionId: string,
    jobId: string,
    history: { role: 'human' | 'ai'; content: string }[],
  ): Promise<AiChatHistoryDocument> {
    return this.aiChatHistoryModel.findOneAndUpdate(
      { sessionId },
      { jobId, history },
      { new: true, upsert: true },
    ).exec();
  }
}
