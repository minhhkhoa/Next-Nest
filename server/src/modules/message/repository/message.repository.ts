import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { Message, MessageDocument } from '../schemas/message.schema';

@Injectable()
export class MessageRepository extends MongoAbstractRepository<MessageDocument> {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: SoftDeleteModel<MessageDocument>,
  ) {
    super(Message, messageModel);
  }

  async createAndPopulateSender(payload: any) {
    const newMessage = await this.create(payload);
    return this.findByIdRaw(newMessage._id, {
      includeDeleted: true,
      populate: { path: 'senderId', select: 'name avatar email' },
    });
  }

  async findByConversationWithPagination(
    conversationId: string,
    skip: number,
    limit: number,
  ) {
    return this.findRaw(
      { conversationId: new Types.ObjectId(conversationId) },
      {
        sort: { createdAt: -1 },
        skip,
        limit,
        populate: { path: 'senderId', select: 'name avatar email' },
        includeDeleted: true,
      },
    );
  }

  async countByConversation(conversationId: string) {
    return this.countDocumentsRaw(
      {
        conversationId: new Types.ObjectId(conversationId),
      },
      true,
    );
  }
}
