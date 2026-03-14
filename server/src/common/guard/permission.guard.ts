import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  IS_PUBLIC_KEY,
  IS_PUBLIC_PERMISSION_KEY,
} from '../decorator/customize';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    //- Bypass cho các route Public (không cần login)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    //- Bypass cho các route Public Permission (chỉ cần login)
    const isPublicPermission = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublicPermission) return true;

    //- Lấy thông tin Request
    const method = request.method;
    const apiPath = request.route?.path; //- đây là path có chứa param dạng /users/:id

    //- Bypass tự động cho các route thuộc /api/auth
    if (apiPath?.startsWith('/api/auth')) return true;

    //- Bypass cho SUPER_ADMIN
    const roleAdmin = this.configService.get<string>('role_super_admin');
    if (user?.roleCodeName === roleAdmin) return true;

    //- Kiểm tra quyền
    const permissions = user?.permissions ?? [];

    //- So khớp chính xác Method và ApiPath
    const hasPermission = permissions.some(
      (p) => p.method === method && p.apiPath === apiPath,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này!',
      );
    }

    return true;
  }
}
