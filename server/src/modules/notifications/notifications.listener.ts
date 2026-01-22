import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  //- sử dụng mảng để lắng nghe nhiều sự kiện cùng lúc
  @OnEvent([
    NotificationType.NEWS_CREATED,
    NotificationType.COMPANY_RECRUITER_JOINED,
    NotificationType.JOIN_REQUEST_PROCESSED,
    NotificationType.COMPANY_CREATED,
  ])
  async handleNotificationEvents(payload: any) {
    try {
      //- Validation chung
      if (!payload.receiverId || !payload.senderId) {
        console.error(
          '[Event Error] Missing receiverId or senderId in payload',
        );
        return;
      }

      const newNotif = await this.notificationsService.create({
        receiverId: payload.receiverId,
        senderId: payload.senderId,
        title: payload.title,
        content: payload.content,
        type: payload.type,
        metadata: payload.metadata,
      });

      if (!newNotif) throw new BadRequestCustom('Lỗi tạo thông báo');

      //- Đẩy real-time qua gateway
      this.notificationsGateway.sendToUser(
        payload.receiverId.toString(),
        newNotif,
      );
    } catch (error) {
      console.error(`[NotificationListener Error]: ${error.message}`);
    }
  }
}
