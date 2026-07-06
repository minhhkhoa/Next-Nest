import { Injectable, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Types } from 'mongoose';
import { ConversationService } from '../conversation/conversation.service';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { MessageRepository } from './repository/message.repository';
import { UserService } from '../user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from 'src/common/constants/notification-type.enum';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private conversationService: ConversationService,
    private configService: ConfigService,
    private chatGateway: ChatGateway, // Inject ChatGateway
    @Inject(forwardRef(() => UserService))
    private userService: UserService, //- inject user service để tìm danh sách recruiter
    private eventEmitter: EventEmitter2, //- dùng event emitter để phát tin nhắn mới
  ) {}

  async create(createMessageDto: CreateMessageDto, user: UserDecoratorType, socketId?: string) {
    try {
      //- Xác định người gửi
      const candidateText = this.configService.get<string>('role_candidate');
      const superAdminText = this.configService.get<string>('role_super_admin');

      //- Super Admin khong duoc gui tin nhan, chi co Candidate va Recruiter moi co quyen
      if (user.roleCodeName === superAdminText) {
        throw new ForbiddenException('Super Admin không được phép gửi tin nhắn trong cuộc trò chuyện');
      }

      const senderType =
        user.roleCodeName === candidateText ? 'CANDIDATE' : 'RECRUITER';

      const newMessage = await this.messageRepository.createAndPopulateSender({
        conversationId: new Types.ObjectId(createMessageDto.conversationId),
        senderId: new Types.ObjectId(user.id),
        senderType,
        type: createMessageDto.type,
        content: createMessageDto.content || '',
        metadata: createMessageDto.metadata || {},
        createdBy: {
          _id: new Types.ObjectId(user.id),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      });

      //- Tạo text tóm tắt lastMessage tuỳ theo type
      let lastMsgText = 'Đã gửi một tin nhắn mới';
      if (newMessage.type === 'TEXT') {
        lastMsgText = newMessage.content;
      } else if (newMessage.type === 'IMAGE') {
        lastMsgText = '[Hình ảnh]';
      } else if (newMessage.type === 'CV_LINK') {
        lastMsgText = '[Tệp đính kèm]';
      } else if (newMessage.type === 'CV_SYSTEM') {
        lastMsgText = '[CV hệ thống]';
      } else if (newMessage.type === 'JOB_REFERENCE') {
        lastMsgText = '[Đính kèm công việc]';
      }

      //- Cập nhật last message và unread count cho phòng chat
      await this.conversationService.updateLastMessage(
        createMessageDto.conversationId,
        lastMsgText,
        user.roleCodeName,
      );

      //- Lấy thông tin cuộc trò chuyện để tìm người nhận tin nhắn
      const conversation = await this.conversationService.findOne(
        createMessageDto.conversationId,
        user,
      );

      //- Xác định danh sách ID người nhận thông báo tin nhắn mới
      const receivers: string[] = [];
      if (senderType === 'CANDIDATE') {
        //- ứng viên gửi -> người nhận là tất cả recruiter thuộc công ty
        try {
          const companyId = conversation.companyId?._id?.toString() || conversation.companyId?.toString();
          if (companyId) {
            const recruiters = await this.userService.findRecruitersByCompany(companyId);
            recruiters.forEach((r) => {
              receivers.push(r._id.toString());
            });
          }
        } catch (err) {
          console.error(`[Message Service - Find Recruiters Error]: ${err.message}`);
        }
      } else {
        //- recruiter gửi -> người nhận là ứng viên
        const candidateId = conversation.candidateId?._id?.toString() || conversation.candidateId?.toString();
        if (candidateId) {
          receivers.push(candidateId);
        }
      }

      //- Bắn sự kiện thông báo tin nhắn mới tới các người nhận
      try {
        receivers.forEach((receiverId) => {
          this.eventEmitter.emit(NotificationType.NEW_MESSAGE, {
            receiverId,
            senderId: user.id,
            title: 'Tin nhắn mới',
            content: senderType === 'CANDIDATE'
              ? `Ứng viên ${user.name} đã gửi tin nhắn mới`
              : `Nhà tuyển dụng ${user.name} đã gửi tin nhắn mới`,
            type: NotificationType.NEW_MESSAGE,
            metadata: {
              module: 'CHAT',
              resourceId: createMessageDto.conversationId,
            },
          });
        });
      } catch (err) {
        console.error(`[Message Service - Emit NEW_MESSAGE Error]: ${err.message}`);
      }

      //- Phát sự kiện realtime gửi xuống cho các Client đang trong room conversationId
      this.chatGateway.emitMessageToConversation(
        createMessageDto.conversationId,
        newMessage,
        socketId,
      );

      return newMessage;
    } catch (error) {
      throw new BadRequestException('Không thể gửi tin nhắn');
    }
  }

  async findByConversation(
    conversationId: string,
    page: number = 1,
    limit: number = 50,
    user: UserDecoratorType,
  ) {
    //- Kiểm tra xem user có quyền truy cập vào conversationId này không
    //- Hàm findOne của conversationService đã ném lỗi Forbidden nếu không có quyền
    await this.conversationService.findOne(conversationId, user);

    const skip = (page - 1) * limit;

    const messages = await this.messageRepository.findByConversationWithPagination(
      conversationId,
      skip,
      limit,
    );

    const total = await this.messageRepository.countByConversation(
      conversationId,
    );

    return {
      messages: messages.reverse(), // Đảo lại mảng để messages cũ ở trên, mới ở dưới phù hợp giao diện khung chat
      meta: {
        current: Number(page),
        pageSize: Number(limit),
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }

  //- tìm kiếm thông tin tin nhắn theo id
  async findOne(id: string) {
    return this.messageRepository.findByIdRaw(id, { includeDeleted: true });
  }

  //- xử lý logic nghiệp vụ cập nhật biểu cảm tin nhắn
  async updateReaction(messageId: string, userId: string, name: string, emoji: string) {
    return this.messageRepository.updateReaction(messageId, userId, name, emoji);
  }
}
