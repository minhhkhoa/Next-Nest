import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from 'src/common/constants/notification-type.enum';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @OnEvent(NotificationType.NEWS_CREATED) //- lắng nghe
  async handleNewsCreatedEvent(payload: any) {
    // 1. Logic dịch thuật và lưu DB
    const newNotif = await this.notificationsService.create({
      receiverId: payload.receiverId,
      senderId: payload.senderId,
      title: payload.title,
      content: payload.content,
      type: NotificationType.NEWS_CREATED,
      metadata: payload.metadata,
    });

    // 2. Đẩy real-time ngay sau khi lưu DB thành công
    this.notificationsGateway.sendToUser(
      payload.receiverId.toString(),
      newNotif,
    );
  }
}
