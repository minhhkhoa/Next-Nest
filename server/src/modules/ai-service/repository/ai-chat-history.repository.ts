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

  async findByUserId(userId: string): Promise<AiChatHistoryDocument | null> {
    return this.aiChatHistoryModel.findOne({ userId }).exec();
  }

  async createOrUpdate(
    userId: string,
    jobId: string,
    history: { role: 'human' | 'ai'; content: string }[],
  ): Promise<AiChatHistoryDocument> {
    return this.aiChatHistoryModel.findOneAndUpdate(
      { userId },
      { jobId, history },
      { new: true, upsert: true },
    ).exec();
  }
}
