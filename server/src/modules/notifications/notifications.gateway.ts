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

//- Đứa gác cổng (người cầm loa thông báo) và điều phối hướng đi của event.

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

  //- bắn thông tin đi tới đúng người
  sendToUser(userId: string, payload: any) {
    this.server.to(userId).emit('new-notification', payload);
  }
}

/**
 * 1. Cơ chế "Lắng nghe sự kiện" của NestJS
      - Khi sử dụng Decorator @WebSocketGateway(), NestJS sẽ khởi tạo một Server Socket.io chạy ngầm.
      - Khi có một Client (trình duyệt của User) thực hiện lệnh io(URL - ở file socket-provider), nó sẽ gửi một yêu cầu bắt tay (handshake) đến Server.
      - Ngay khi việc bắt tay thành công, Server Socket.io phát ra sự kiện connection.
      - NestJS lắng nghe sự kiện này và TỰ ĐỘNG gọi hàm handleConnection trong Gateway của Khoa, đồng thời truyền chính đối tượng Socket của User vừa kết nối vào tham số client cụ thể giải thích bên dưới đây.

  2. Biến client trong hàm handleConnection đến từ đâu ?
      - Bên trên file này có đoạn lấy token từ client vậy client đó lấy từ đâu?
      - Phần dữ liệu này đến từ phía Client (Next.js) khi Khoa khởi tạo Socket phía client
        socket = io(URL, {
          auth: {
            token: "JWT_TOKEN_HERE" // <--- Dữ liệu này sẽ chui vào client.handshake.auth ở Server
        }
});
 */
