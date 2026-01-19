import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from 'src/common/guard/ws-jwt.guard';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Khi có người kết nối, ta verify thủ công một lần để join room
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });

      const userId = payload.id;
      client.join(userId);
      console.log(`Socket joined room: ${userId}`);
    } catch (e) {
      client.disconnect(); // Ngắt nếu không hợp lệ
    }
  }

  // Dùng Guard cho các event cụ thể nếu cần (ví dụ client gửi tin lên)
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe_to_topic')
  handleEvent(client: Socket, data: any) {
    // Logic xử lý
  }

  sendToUser(userId: string, payload: any) {
    this.server.to(userId).emit('new-notification', payload);
  }
}
