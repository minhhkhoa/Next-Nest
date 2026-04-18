import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import {
  Conversation,
  ConversationDocument,
} from '../schemas/conversation.schema';
import {
  Message,
  MessageDocument,
} from 'src/modules/message/schemas/message.schema';

@Injectable()
export class ConversationRepository extends MongoAbstractRepository<ConversationDocument> {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: SoftDeleteModel<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {
    super(Conversation, conversationModel);
  }

  async findExisting(candidateId: string, companyId: string) {
    return this.findOneRaw(
      {
        candidateId: new Types.ObjectId(candidateId),
        companyId: new Types.ObjectId(companyId),
      },
      {
        populate: ['candidateId', 'companyId'],
        includeDeleted: true,
      },
    );
  }

  async createAndPopulate(payload: Partial<ConversationDocument>) {
    const newConv = await this.create(payload);
    return this.findByIdRaw((newConv as any)._id, {
      includeDeleted: true,
      populate: ['candidateId', 'companyId'],
    });
  }

  async findAllByFilter(filter: any) {
    return this.findRaw(filter, {
      includeDeleted: true,
      sort: { updatedAt: -1 },
      populate: [
        { path: 'candidateId', select: 'name avatar email' },
        { path: 'companyId', select: 'name logo' },
      ],
    });
  }

  async findByIdWithDetails(id: string) {
    return this.findByIdRaw(id, {
      includeDeleted: true,
      populate: [
        { path: 'candidateId', select: 'name avatar email' },
        { path: 'companyId', select: 'name logo' },
        { path: 'assignedRecruiterId', select: 'name avatar email' },
      ],
    });
  }

  async assignRecruiter(id: string, recruiterId: string) {
    return this.findOneAndUpdateRaw(
      { _id: id },
      {
        assignedRecruiterId: new Types.ObjectId(recruiterId),
      },
      { new: true },
    );
  }

  async markAsRead(
    conversationId: string,
    readerId: string,
    isCandidate: boolean,
  ) {
    const readAt = new Date();
    const conversationObjectId = new Types.ObjectId(conversationId);
    const readerObjectId = new Types.ObjectId(readerId);
    const updateData = isCandidate
      ? { unreadCandidate: 0 }
      : { unreadCompany: 0 };

    const [updatedConversation] = await Promise.all([
      this.findOneAndUpdateRaw({ _id: conversationId }, updateData, {
        new: true,
      }),
      this.messageModel.updateMany(
        {
          conversationId: conversationObjectId,
          senderId: { $ne: readerObjectId },
          isDeleted: false,
          $or: [{ isRead: { $exists: false } }, { isRead: false }],
        },
        {
          $set: {
            isRead: true,
            readAt,
          },
        },
      ),
    ]);

    return updatedConversation;
  }

  async updateLastMessage(
    conversationId: string,
    message: string,
    isCandidate: boolean,
  ) {
    const incQuery = isCandidate
      ? { unreadCompany: 1 }
      : { unreadCandidate: 1 };

    return this.findOneAndUpdateRaw(
      { _id: conversationId },
      {
        lastMessage: message,
        lastMessageAt: new Date(),
        $inc: incQuery,
      },
    );
  }
}
