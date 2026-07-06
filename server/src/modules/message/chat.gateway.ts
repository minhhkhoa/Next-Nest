import { Logger, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from './message.service';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from 'src/common/guard/ws-jwt.guard';

//- Chạy trên namespace '/chat' để không đụng chạm với thông báo đang để '/' ở NotificationsGateway
@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  private logger: Logger = new Logger('MessageGateway');

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}

  //- duoc goi tu dong duy nhat 1 lan ngay luc ma Frontend Next.js khoi tao lenh ket noi
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new Error('No token provided in /chat namespace');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });
      //- Vuot qua xac thuc khi bat tay thi gan thong tin user vao client de cac event sau co the dung
      client.data.user = payload;
      this.logger.log(
        `[Chat] Socket connected: ${client.id} - User: ${payload.email}`,
      );

      //- Neu la recruiter thi tu dong join vao company room de nhan duoc event conversation moi
      const companyId = payload?.employerInfo?.companyID;
      if (companyId) {
        const companyRoom = `company_${companyId}`;
        client.join(companyRoom);
        this.logger.log(
          `[Chat] Recruiter ${payload.email} joined company room: ${companyRoom}`,
        );
      }
    } catch (e) {
      //- loi thi dong ket noi, khong cho vao phong chat
      this.logger.error(`[Chat] Connection rejected: ${e.message}`);
      client.disconnect();
    }
  }

  // Lắng nghe sự kiện người dùng join vào 1 phòng chat cụ thể khi mở khung chat
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_conversation') //- Tên sự kiện do FE emit lên khi mở khung chat, vd: socket.emit('join_conversation', conversationId)
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    if (!conversationId) return;

    //- Rời các phòng cũ (nếu có logic chỉ được mở 1 chat 1 lúc)
    // - Tuỳ FE có thể mở nhiều tab nhưng cứ an toàn join mới
    client.join(conversationId);
    this.logger.log(
      `[Chat] Client ${client.id} joined conversation: ${conversationId}`,
    );
  }

  //- Lắng nghe rời phòng (khi đóng khung chat)
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_conversation') //- Tên sự kiện do FE emit lên khi đóng khung chat, vd: socket.emit('leave_conversation', conversationId)
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    if (!conversationId) return;
    client.leave(conversationId);
    this.logger.log(
      `[Chat] Client ${client.id} left conversation: ${conversationId}`,
    );
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('conversation_read')
  handleConversationRead(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      conversationId: string;
      readAt?: string;
    },
  ) {
    if (!payload?.conversationId) return;

    const readerId = client.data?.user?.id;
    const readAt = payload.readAt || new Date().toISOString();

    this.server.to(payload.conversationId).emit('messages_read', {
      conversationId: payload.conversationId,
      readerId,
      readAt,
    });
  }

  //- Emit new_conversation den company room khi co conversation moi duoc tao (triggered boi EventEmitter)
  @OnEvent('conversation.created')
  handleConversationCreated(payload: { companyId: string; conversation: any }) {
    const companyRoom = `company_${payload.companyId}`;
    this.server.to(companyRoom).emit('new_conversation', payload.conversation);
    this.logger.log(`[Chat] Emitted new_conversation to room: ${companyRoom}`);
  }

  /**
   * Phương thức được gọi từ MessageService sau khi có tin nhắn vào DB.
   * Chức năng: Phát sóng thông tin 'receive_message' tới phòng (conversationId) để các Client đang mở khung chat đó nhận được tin nhắn mới realtime.
   * @param conversationId ID của phòng chat (conversation)
   * @param messagePayload Dữ liệu tin nhắn mới vừa được tạo (sau khi đã lưu vào DB)
   */
  emitMessageToConversation(conversationId: string, messagePayload: any, senderSocketId?: string) {
    const payload = {
      ...(messagePayload.toJSON ? messagePayload.toJSON() : messagePayload),
      senderSocketId,
    };
    this.server.to(conversationId).emit('receive_message', payload);
  }

  //- lắng nghe sự kiện thả biểu cảm cảm xúc tin nhắn từ client
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_reaction')
  async handleSendReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      messageId: string;
      emoji: string;
    },
  ) {
    if (!payload?.messageId || !payload?.emoji) return;
    const userId = client.data?.user?.id;
    const name = client.data?.user?.name || client.data?.user?.email;

    const updatedReactions = await this.messageService.updateReaction(
      payload.messageId,
      userId,
      name,
      payload.emoji,
    );

    if (updatedReactions) {
      const message = await this.messageService.findOne(payload.messageId);
      if (message) {
        //- phát sóng cập nhật biểu cảm tin nhắn realtime cho mọi người trong phòng chat
        this.server.to(message.conversationId.toString()).emit('receive_reaction', {
          messageId: payload.messageId,
          reactions: updatedReactions,
        });
      }
    }
  }
}
