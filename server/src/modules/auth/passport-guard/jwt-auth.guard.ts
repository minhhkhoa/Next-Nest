import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    //- Luôn chạy super.canActivate để cố gắng parse user từ token (nếu có)
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    //- lấy ra metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    //- Nếu có user thì trả về user
    if (user) {
      return user;
    }

    //- Nếu là public route thì cho qua (trả về null user)
    if (isPublic) {
      return null;
    }

    //- Nếu không public và không có user/lỗi -> Bắn lỗi
    if (err || !user) {
      throw err || new UnauthorizedException('Token không hợp lệ hoặc không có token');
    }

    return user;
  }
}
