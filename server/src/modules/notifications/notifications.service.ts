import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { TranslationService } from 'src/common/translation/translation.service';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { FindNotifycationQueryDto } from './dto/notifycationDto-dto';
import mongoose from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(Notification.name)
    private notificationModel: SoftDeleteModel<NotificationDocument>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'Notification',
        createNotificationDto,
      );

      const notification = await this.notificationModel.create(dataLang);

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
        this.notificationModel.countDocuments(filterConditions),
        this.notificationModel
          .find(filterConditions)
          .skip(offset)
          .limit(defaultLimit)
          .sort('-createdAt') // Thông báo mới nhất luôn ở trên đầu
          .populate('senderId', 'name email avatar') // Lấy thêm info người gửi nếu cần
          .exec(),
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

      const res = await this.notificationModel.updateOne(
        { _id: id, receiverId: userId }, // Đảm bảo đúng chủ sở hữu mới được sửa
        { isRead: true, readAt: new Date() },
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
    const count = await this.notificationModel.countDocuments({
      receiverId: userId,
      isRead: false,
    });
    return { count };
  }

  // Đánh dấu tất cả là đã đọc
  async markAllAsRead(userId: string) {
    return await this.notificationModel.updateMany(
      { receiverId: userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  // Xóa 1 thông báo
  async remove(id: string, userId: string) {
    const res = await this.notificationModel.deleteOne({
      _id: id,
      receiverId: userId,
    });
    if (res.deletedCount === 0) {
      throw new BadRequestCustom(
        'Thông báo không tồn tại hoặc không thuộc quyền sở hữu của bạn',
      );
    }
    return res;
  }

  // Xóa tất cả thông báo của một user (Dọn sạch hòm thư)
  async removeAll(userId: string) {
    return await this.notificationModel.deleteMany({
      receiverId: userId,
    });
  }
}
