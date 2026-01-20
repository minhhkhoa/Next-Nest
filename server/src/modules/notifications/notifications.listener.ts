import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';

//- Là nơi nhận các sự kiện mà các moduleService khác đăng ký và đẩy thông báo đi.
//- vd: moduleNews khi created đăng ký 1 sự kiện thì ở đây sẽ nhận và lưu notify xuống db.
//- Đây như là 1 cầu nối giữa các module. Giúp tách biệt logic, các module khác như NewsModule không cần biết gì tới socket.

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @OnEvent(NotificationType.NEWS_CREATED) //- lắng nghe
  async handleNewsCreatedEvent(payload: any) {
    try {
      // 1. Lưu notify xuống DB
      const newNotif = await this.notificationsService.create({
        receiverId: payload.receiverId,
        senderId: payload.senderId,
        title: payload.title,
        content: payload.content,
        type: NotificationType.NEWS_CREATED,
        metadata: payload.metadata,
      });

      if (!newNotif)
        throw new BadRequestCustom('Lỗi tạo thông báo', !!newNotif);

      // 2. Đẩy real-time ngay sau khi lưu DB thành công, chuyển sang thằng gateway xử lý
      this.notificationsGateway.sendToUser(
        payload.receiverId.toString(),
        newNotif,
      );
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
