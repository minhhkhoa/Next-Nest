import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Types } from 'mongoose';
import { ConversationService } from '../conversation/conversation.service';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { MessageRepository } from './repository/message.repository';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private conversationService: ConversationService,
    private configService: ConfigService,
    private chatGateway: ChatGateway, // Inject ChatGateway
  ) {}

  async create(createMessageDto: CreateMessageDto, user: UserDecoratorType) {
    try {
      //- Xác định người gửi
      const candidateText = this.configService.get<string>('role_candidate');

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

      //- Phát sự kiện realtime gửi xuống cho các Client đang trong room conversationId
      this.chatGateway.emitMessageToConversation(
        createMessageDto.conversationId,
        newMessage,
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
  ) {
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
}
