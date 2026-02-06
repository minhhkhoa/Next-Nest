import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private async processNotification(
    payload: CreateNotificationDto,
    eventType: NotificationType,
  ) {
    try {
      if (!payload.receiverId && payload.senderId) {
        throw new BadRequestCustom(
          'id người nhận và id người gửi là bắt buộc truyền lên',
          !!payload.receiverId,
        );
      }

      const newNotif = await this.notificationsService.create({
        ...payload,
        type: eventType, //- ưu tiên dùng type từ Decorator để an toàn
      });

      if (newNotif) {
        this.notificationsGateway.sendToUser(
          payload.receiverId.toString(),
          newNotif,
        );
      }
    } catch (error) {
      console.error(`[Notification Error - ${eventType}]: ${error.message}`);
    }
  }

  //- tạo mới tin tức
  @OnEvent(NotificationType.NEWS_CREATED)
  handleNews(payload: CreateNotificationDto) {
    return this.processNotification(payload, NotificationType.NEWS_CREATED);
  }

  //- tạo mới công ty
  @OnEvent(NotificationType.COMPANY_CREATED)
  handleCreatedCompany(payload: CreateNotificationDto) {
    return this.processNotification(payload, NotificationType.COMPANY_CREATED);
  }

  //- SUPER_ADMIN duyệt/từ chối yêu cầu
  @OnEvent(NotificationType.COMPANY_ADMIN_REQUEST_PROCESSED)
  handleAdminRequestCompanyProcess(payload: CreateNotificationDto) {
    return this.processNotification(
      payload,
      NotificationType.COMPANY_ADMIN_REQUEST_PROCESSED,
    );
  }

  //- RECUITER_ADMIN nhận: Yêu cầu gia nhập của RECRUITER'
  @OnEvent(NotificationType.COMPANY_RECRUITER_JOINED)
  handleJoinRequestCompany(payload: CreateNotificationDto) {
    return this.processNotification(
      payload,
      NotificationType.COMPANY_RECRUITER_JOINED,
    );
  }
  //- xử lý yêu cầu quản trị công ty(RECRUITER_ADMIN duyệt/từ chối yêu cầu)
  @OnEvent(NotificationType.COMPANY_JOIN_REQUEST_PROCESSED)
  handleJoinRequestCompanyProcess(payload: CreateNotificationDto) {
    return this.processNotification(
      payload,
      NotificationType.COMPANY_JOIN_REQUEST_PROCESSED,
    );
  }

  //- tạo mới công việc
  @OnEvent(NotificationType.JOB_CREATED)
  handleJobCreated(payload: CreateNotificationDto) {
    return this.processNotification(payload, NotificationType.JOB_CREATED);
  }

  //- cập nhật công việc
  @OnEvent(NotificationType.JOB_UPDATED)
  handleJobUpdated(payload: CreateNotificationDto) {
    return this.processNotification(payload, NotificationType.JOB_UPDATED);
  }

  //- xác thực công việc
  @OnEvent(NotificationType.JOB_VERIFIED)
  handleJobVerified(payload: CreateNotificationDto) {
    return this.processNotification(payload, NotificationType.JOB_VERIFIED);
  }

  //- tạo mới yêu cầu/báo cáo
  @OnEvent(NotificationType.ISSUE_CREATED)
  handleIssueCreated(payload: CreateNotificationDto) {
    return this.processNotification(payload, NotificationType.ISSUE_CREATED);
  }

  //- phản hồi yêu cầu/báo cáo
  @OnEvent(NotificationType.ISSUE_ADMIN_REPLY)
  handleIssueAdminReplied(payload: CreateNotificationDto) {
    return this.processNotification(
      payload,
      NotificationType.ISSUE_ADMIN_REPLY,
    );
  }
}
