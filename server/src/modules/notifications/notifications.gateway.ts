import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { WsJwtGuard } from './guards/ws-jwt.guard'; // Khoa cần viết thêm Guard này để check Token socket

@WebSocketGateway({
  cors: { origin: '*' }, // Trong thực tế Khoa nên giới hạn domain Next.js
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // 1. Lấy userId từ handshake (đã qua Guard validate)
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(userId); // Cho user vào phòng riêng của họ
      console.log(`Client connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected');
  }

  // Hàm helper để các service khác gọi tới
  sendToUser(userId: string, payload: any) {
    this.server.to(userId).emit('new-notification', payload);
  }
}
