import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueAdminDto, UpdateIssueDto } from './dto/update-issue.dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { Issue, IssueDocument } from './schemas/issue.schema';
import { FindIssueQueryDto } from './dto/issueDto.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import { TranslationService } from 'src/common/translation/translation.service';

@Injectable()
export class IssueService {
  constructor(
    private readonly translationService: TranslationService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private eventEmitter: EventEmitter2,
    @InjectModel(Issue.name)
    private issueModel: SoftDeleteModel<IssueDocument>,
  ) {}

  async create(createIssueDto: CreateIssueDto, user: UserDecoratorType) {
    try {
      //- Xử lý đa ngôn ngữ
      const dataLang = await this.translationService.translateModuleData(
        'issue',
        createIssueDto,
      );

      const { title, description, type, targetId, attachments } = dataLang;

      const newIssue = await this.issueModel.create({
        title,
        description,
        type,
        targetId,
        attachments,
        createdBy: {
          _id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        status: 'PENDING',
        history: [
          {
            status: 'PENDING',
            updatedAt: new Date(),
            note: 'Yêu cầu/Báo cáo đã được khởi tạo.',
          },
        ],
      });

      //- start ping event to notify admin
      try {
        // Tìm Super Admin để gửi thông báo (Bạn có thể dùng hàm tương tự getRecruiterAdminByCompanyID nhưng cho Super Admin)
        const textRoleAdmin =
          this.configService.get<string>('role_super_admin');
        const superAdmin = await this.userService.getUserByRoleSuperAdmin(
          textRoleAdmin!,
        );

        if (superAdmin) {
          this.eventEmitter.emit(NotificationType.ISSUE_CREATED, {
            receiverId: superAdmin._id,
            senderId: user.id,
            title: 'Yêu cầu/Báo cáo mới',
            content: `Người dùng "${user.name}" vừa gửi một yêu cầu/báo cáo mới.`,
            type: NotificationType.ISSUE_CREATED,
            metadata: {
              module: 'ISSUE',
              resourceId: newIssue._id.toString(),
              action: 'CREATE ISSUE',
            },
          });
        }
      } catch (notifError) {
        //- Log lỗi notify nhưng không làm crash luồng chính vì DB đã lưu xong
        console.error(
          'Notification Error after issue creation:',
          notifError.message,
        );
      }
      //- end ping event to notify admin

      return {
        _id: newIssue._id,
        title: newIssue.title,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  /**
   * Admin lọc danh sách Issue (Phân trang, Filter, Search)
   */
  async findAllByFilter(query: FindIssueQueryDto) {
    try {
      const { currentPage, pageSize, type, status, searchText } = query;

      const queryForAqp = { type, status, searchText };

      const { filter, sort } = aqp(queryForAqp);
      let filterConditions: any = { ...filter };

      //- Xóa các field phân trang khỏi filter của mongo
      delete filterConditions.currentPage;
      delete filterConditions.pageSize;

      //- Thêm các bộ lọc bổ sung nếu Admin chọn trên UI
      if (type) filterConditions.type = type;
      if (status) filterConditions.status = status;

      //- Xử lý search text
      if (searchText) {
        delete filterConditions.searchText;
        filterConditions.$or = [
          { title: { $regex: searchText, $options: 'i' } },
          { description: { $regex: searchText, $options: 'i' } },
        ];
      }

      const defaultPage = +currentPage > 0 ? +currentPage : 1;
      const defaultLimit = +pageSize > 0 ? +pageSize : 10;
      const offset = (defaultPage - 1) * defaultLimit;

      const totalItems = await this.issueModel.countDocuments(filterConditions);
      const totalPages = Math.ceil(totalItems / defaultLimit);

      const result = await this.issueModel
        .find(filterConditions)
        .skip(offset)
        .limit(defaultLimit)
        .sort('-createdAt')
        .exec();

      return {
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          pages: totalPages,
          total: totalItems,
        },
        result,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  /**
   * Người dùng (Ứng viên/HR) xem danh sách yêu cầu của chính họ
   * Hỗ trợ phân trang và lọc theo trạng thái/loại nếu cần
   */
  async findAllByUser(user: UserDecoratorType, query: FindIssueQueryDto) {
    try {
      const { currentPage, pageSize, type, status } = query;

      //- Thiết lập điều kiện lọc: Bắt buộc phải là của người đang login
      const filterConditions: any = {
        'createdBy._id': new mongoose.Types.ObjectId(user.id),
      };

      //- Thêm các bộ lọc bổ sung nếu người dùng chọn trên UI
      if (type) filterConditions.type = type;
      if (status) filterConditions.status = status;

      const defaultPage = +currentPage > 0 ? +currentPage : 1;
      const defaultLimit = +pageSize > 0 ? +pageSize : 10;
      const offset = (defaultPage - 1) * defaultLimit;

      const totalItems = await this.issueModel.countDocuments(filterConditions);
      const totalPages = Math.ceil(totalItems / defaultLimit);

      const result = await this.issueModel
        .find(filterConditions)
        .skip(offset)
        .limit(defaultLimit)
        .sort('-createdAt')
        .exec();

      return {
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          pages: totalPages,
          total: totalItems,
        },
        result,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  /**
   * Lấy chi tiết 1 Issue
   */
  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID không đúng định dạng', true);
      }

      const issue = await this.issueModel.findById(id).lean();
      if (!issue) throw new BadRequestCustom('Không tìm thấy yêu cầu', true);

      return issue;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  /**
   * Admin phản hồi và cập nhật trạng thái
   */
  async handleAdminReply(
    updateAdminDto: UpdateIssueAdminDto,
    admin: UserDecoratorType,
  ) {
    try {
      //- dịch nội dung phản hồi của admin
      const dataLang = await this.translationService.translateModuleData(
        'issue',
        { adminReply: updateAdminDto.adminReply }, //- Truyền object có key là 'adminReply'
      );

      const translatedContent = dataLang.adminReply;

      const { id, status } = updateAdminDto;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID không đúng định dạng', true);
      }

      const updatedIssue = await this.issueModel.findByIdAndUpdate(
        id,
        {
          $set: {
            status,
            adminResponse: {
              adminId: admin.id,
              content: translatedContent,
              repliedAt: new Date(),
            },
          },
          $push: {
            history: {
              status,
              updatedAt: new Date(),
              note: `Admin ${admin.name} đã phản hồi và cập nhật trạng thái thành "${status}".`,
            },
          },
        },
        { new: true },
      );

      if (!updatedIssue)
        throw new BadRequestCustom('Cập nhật phản hồi thất bại', true);

      //- start ping event to notify user
      try {
        //- Tìm user để gửi thông báo
        const user = await this.userService.findOne(
          updatedIssue.createdBy._id.toString(),
        );

        if (user) {
          this.eventEmitter.emit(NotificationType.ISSUE_ADMIN_REPLY, {
            receiverId: user._id,
            senderId: admin.id,
            title: 'Phản hồi từ Admin cho yêu cầu/báo cáo của bạn',
            content: `Yêu cầu/báo cáo của bạn đã được Admin phản hồi.`,
            type: NotificationType.ISSUE_ADMIN_REPLY,
            metadata: {
              module: 'ISSUE',
              resourceId: updatedIssue._id.toString(),
              action: 'ADMIN_REPLY',
            },
          });
        }
      } catch (notifError) {
        //- Log lỗi notify nhưng không làm crash luồng chính vì DB đã lưu xong
        console.error(
          'Notification Error after issue creation:',
          notifError.message,
        );
      }
      //- end ping

      return updatedIssue;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  /**
   * User cập nhật nội dung (Chỉ cho phép khi status là PENDING)
   */
  async update(id: string, updateDto: UpdateIssueDto, user: UserDecoratorType) {
    try {
      const issue = await this.issueModel.findById(id);
      if (!issue) throw new BadRequestCustom('Không tìm thấy yêu cầu', true);

      // Kiểm tra chính chủ
      if (issue.createdBy._id.toString() !== user.id) {
        throw new BadRequestCustom(
          'Bạn không có quyền chỉnh sửa yêu cầu này',
          true,
        );
      }

      // Chỉ cho sửa khi Admin chưa xử lý
      if (issue.status !== 'PENDING') {
        throw new BadRequestCustom(
          'Yêu cầu đã được tiếp nhận, không thể chỉnh sửa',
          true,
        );
      }

      return await this.issueModel.findByIdAndUpdate(
        id,
        { ...updateDto },
        { new: true },
      );
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string, user: UserDecoratorType) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID không đúng định dạng', true);
      }

      const result = await this.issueModel.softDelete({ _id: id });

      // Cập nhật người xóa
      await this.issueModel.updateOne(
        { _id: id },
        { deletedBy: { _id: user.id, name: user.name, email: user.email } },
      );

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
