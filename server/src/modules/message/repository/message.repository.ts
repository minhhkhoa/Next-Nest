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

  //- cập nhật danh sách các biểu cảm đã thả trên tin nhắn
  async updateReaction(
    messageId: string,
    userId: string,
    name: string,
    emoji: string,
  ) {
    const message = await this.messageModel.findById(messageId);
    if (!message) return null;

    if (!message.reactions) {
      message.reactions = [];
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId,
    );

    if (existingReactionIndex > -1) {
      const existingReaction = message.reactions[existingReactionIndex];
      if (existingReaction.emoji === emoji) {
        //- nếu thả trùng biểu cảm cũ thì gỡ bỏ
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        //- nếu thả biểu cảm mới thì thay đổi emoji
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      //- nếu chưa thả biểu cảm nào thì push mới vào
      message.reactions.push({
        userId: new Types.ObjectId(userId),
        emoji,
        senderName: name,
      });
    }

    await message.save();
    return message.reactions;
  }
}
