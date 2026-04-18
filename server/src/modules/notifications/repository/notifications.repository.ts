import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';

@Injectable()
export class NotificationsRepository extends MongoAbstractRepository<NotificationDocument> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: SoftDeleteModel<NotificationDocument>,
  ) {
    super(Notification, notificationModel);
  }

  async createRaw(payload: any) {
    return this.create(payload);
  }

  async countByFilter(filter: any): Promise<number> {
    return this.countDocumentsRaw(filter, true);
  }

  async findByFilterWithPagination(
    filter: any,
    offset: number,
    limit: number,
  ): Promise<NotificationDocument[]> {
    return this.findRaw(filter, {
      skip: offset,
      limit,
      sort: { createdAt: -1 },
      populate: { path: 'senderId', select: 'name email avatar' },
      includeDeleted: true,
    }) as Promise<NotificationDocument[]>;
  }

  async markAsReadByIdAndReceiver(id: string, receiverId: string) {
    return this.updateOneRaw(
      { _id: id, receiverId },
      { isRead: true, readAt: new Date() },
    );
  }

  async countUnreadByReceiver(receiverId: string): Promise<number> {
    return this.countDocumentsRaw({ receiverId, isRead: false }, true);
  }

  async markAllAsReadByReceiver(receiverId: string) {
    return this.updateManyRaw(
      { receiverId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async getJoinRequestsForAdminWithPagination(
    adminId: string,
    skip: number,
    limit: number,
    name?: string,
  ) {
    const pipeline: any[] = [
      {
        $match: {
          receiverId: new Types.ObjectId(adminId),
          type: NotificationType.COMPANY_RECRUITER_JOINED,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'senderInfo',
        },
      },
      { $unwind: '$senderInfo' },
    ];

    if (name) {
      pipeline.push({
        $match: {
          'senderInfo.name': { $regex: name, $options: 'i' },
        },
      });
    }

    pipeline.push({
      $facet: {
        meta: [{ $count: 'totalItems' }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              title: 1,
              content: 1,
              createdAt: 1,
              note: '$metadata.note',
              sender: {
                _id: '$senderInfo._id',
                name: '$senderInfo.name',
                email: '$senderInfo.email',
                avatar: '$senderInfo.avatar',
              },
            },
          },
        ],
      },
    });

    return this.aggregateRaw(pipeline);
  }

  async deleteOneByIdAndReceiver(id: string, receiverId: string) {
    return this.deleteOneRaw({ _id: id, receiverId });
  }

  async deleteAllByReceiver(receiverId: string) {
    return this.deleteManyRaw({ receiverId });
  }
}
