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
  // @OnEvent([
  //   //- news
  //   NotificationType.NEWS_CREATED,

  //   //- company
  //   NotificationType.COMPANY_CREATED,
  //   NotificationType.COMPANY_ADMIN_REQUEST_PROCESSED,
  //   NotificationType.COMPANY_RECRUITER_JOINED,
  //   NotificationType.COMPANY_JOIN_REQUEST_PROCESSED,
  // ])
  // async handleNotificationEvents(payload: any) {
  //   try {
  //     //- Validation chung
  //     if (!payload.receiverId || !payload.senderId) {
  //       console.error(
  //         '[Event Error] Missing receiverId or senderId in payload',
  //       );
  //       return;
  //     }

  //     const newNotif = await this.notificationsService.create({
  //       receiverId: payload.receiverId,
  //       senderId: payload.senderId,
  //       title: payload.title,
  //       content: payload.content,
  //       type: payload.type,
  //       metadata: payload.metadata,
  //     });

  //     if (!newNotif) throw new BadRequestCustom('Lỗi tạo thông báo');

  //     //- Đẩy real-time qua gateway
  //     this.notificationsGateway.sendToUser(
  //       payload.receiverId.toString(),
  //       newNotif,
  //     );
  //   } catch (error) {
  //     console.error(`[NotificationListener Error]: ${error.message}`);
  //   }
  // }

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

  @OnEvent(NotificationType.COMPANY_CREATED) //- lắng nghe
  async handleCompanyCreatedEvent(payload: any) {
    // 1. Logic dịch thuật và lưu DB
    const newNotif = await this.notificationsService.create({
      receiverId: payload.receiverId,
      senderId: payload.senderId,
      title: payload.title,
      content: payload.content,
      type: NotificationType.COMPANY_CREATED,
      metadata: payload.metadata,
    });

    // 2. Đẩy real-time ngay sau khi lưu DB thành công
    this.notificationsGateway.sendToUser(
      payload.receiverId.toString(),
      newNotif,
    );
  }
}
