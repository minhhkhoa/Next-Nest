import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { TranslationService } from 'src/common/translation/translation.service';
import { FindNotifycationQueryDto } from './dto/notifycationDto-dto';
import mongoose from 'mongoose';
import { FindJoinRequestDto } from '../company/dto/companyDto.dto';
import { NotificationsRepository } from './repository/notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly translationService: TranslationService,
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'Notification',
        createNotificationDto,
      );

      const notification = await this.notificationsRepository.createRaw(dataLang);

      return notification.toObject();
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAllByUser(userId: string, query: FindNotifycationQueryDto) {
    try {
      const { currentPage, pageSize, isRead, title } = query;

      // 1. Khởi tạo điều kiện lọc với receiverId
      let filterConditions: any = {
        receiverId: userId,
        isDeleted: { $ne: true }, // Phòng trường hợp sau này Khoa làm tính năng xóa thông báo
      };

      // 2. Xử lý filter cho title (Search đa ngôn ngữ)
      if (title) {
        const searchRegex = new RegExp(title, 'i');
        filterConditions.$or = [
          { 'title.vi': { $regex: searchRegex } },
          { 'title.en': { $regex: searchRegex } },
          { 'content.vi': { $regex: searchRegex } }, // Search cả trong nội dung cho thân thiện
        ];
      }

      // 3. Xử lý filter cho isRead (Đã đọc/Chưa đọc)
      if (isRead !== undefined) {
        // Chuyển đổi về boolean nếu cần (đề phòng query gửi lên là string "true"/"false")
        filterConditions.isRead = String(isRead) === 'true';
      }

      // 4. Tính toán phân trang
      const defaultPage = currentPage > 0 ? +currentPage : 1;
      const defaultLimit = +pageSize > 0 ? +pageSize : 10;
      const offset = (defaultPage - 1) * defaultLimit;

      // 5. Thực hiện truy vấn đồng thời để tối ưu thời gian (Parallel execution)
      const [totalItems, result] = await Promise.all([
        this.notificationsRepository.countByFilter(filterConditions),
        this.notificationsRepository.findByFilterWithPagination(
          filterConditions,
          offset,
          defaultLimit,
        ),
      ]);

      const totalPages = Math.ceil(totalItems / defaultLimit);

      return {
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          totalPages: totalPages,
          totalItems: totalItems,
        },
        result,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  // Đánh dấu đã đọc
  async markAsRead(id: string, userId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID không hợp lệ');
      }

      const res = await this.notificationsRepository.markAsReadByIdAndReceiver(
        id,
        userId,
      );

      if (res.matchedCount === 0) {
        throw new BadRequestException(
          'Thông báo không tồn tại hoặc không thuộc quyền sở hữu của bạn',
        );
      }
      return res;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  // Lấy số lượng chưa đọc
  async countUnread(userId: string) {
    const count = await this.notificationsRepository.countUnreadByReceiver(
      userId,
    );
    return { count };
  }

  // Đánh dấu tất cả là đã đọc
  async markAllAsRead(userId: string) {
    return this.notificationsRepository.markAllAsReadByReceiver(userId);
  }

  //- lấy ra danh sách đứa xin gia nhập công ty
  async getJoinRequestsForAdmin(adminId: string, query: FindJoinRequestDto) {
    const { currentPage, pageSize, name } = query;
    const defaultPage = +currentPage > 0 ? +currentPage : 1;
    const defaultLimit = +pageSize > 0 ? +pageSize : 10;
    const skip = (defaultPage - 1) * defaultLimit;

    const results =
      await this.notificationsRepository.getJoinRequestsForAdminWithPagination(
        adminId,
        skip,
        defaultLimit,
        name,
      );
    const data = results[0].data;
    const totalItems = results[0].meta[0]?.totalItems || 0;

    return {
      meta: {
        current: defaultPage,
        pageSize: defaultLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / defaultLimit),
      },
      result: data,
    };
  }

  // Xóa 1 thông báo
  async remove(id: string, userId: string) {
    const res = await this.notificationsRepository.deleteOneByIdAndReceiver(
      id,
      userId,
    );
    if (res.deletedCount === 0) {
      throw new BadRequestCustom(
        'Thông báo không tồn tại hoặc không thuộc quyền sở hữu của bạn',
      );
    }
    return res;
  }

  // Xóa tất cả thông báo của một user (Dọn sạch hòm thư)
  async removeAll(userId: string) {
    return this.notificationsRepository.deleteAllByReceiver(userId);
  }
}
