import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      // Lấy token từ auth object (như phía Next.js mình đã viết)
      const token = client.handshake.auth?.token;

      if (!token) {
        throw new WsException('Missing token');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });

      // Gán thông tin user vào client để dùng sau này (giống request.user)
      client.data.user = payload;

      return true;
    } catch (ex) {
      console.log('WsJwtGuard error:', ex.message);
      return false; // Chặn kết nối nếu token sai/hết hạn
    }
  }
}
