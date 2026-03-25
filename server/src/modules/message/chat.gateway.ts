import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('MessageGateway');

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  //- được gọi tự động duy nhất 1 lần ngay lúc mà Frontend Next.js khởi tạo lệnh kết nối (vd: io("http://localhost:port/chat", { auth: { token: '...' } }))
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new Error('No token provided in /chat namespace');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });
      // Vượt qua xác thực khi bắt tay thì gán thông tin user vào client để các event sau có thể dùng
      client.data.user = payload;
      this.logger.log(
        `[Chat] Socket connected: ${client.id} - User: ${payload.email}`,
      );
    } catch (e) {
      //- lỗi thì đóng kết nối, không cho vào phòng chat
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

  /**
   * Phương thức được gọi từ MessageService sau khi có tin nhắn vào DB.
   * Chức năng: Phát sóng thông tin 'receive_message' tới phòng (conversationId) để các Client đang mở khung chat đó nhận được tin nhắn mới realtime.
   * @param conversationId ID của phòng chat (conversation)
   * @param messagePayload Dữ liệu tin nhắn mới vừa được tạo (sau khi đã lưu vào DB)
   */
  emitMessageToConversation(conversationId: string, messagePayload: any) {
    this.server.to(conversationId).emit('receive_message', messagePayload);
  }
}
