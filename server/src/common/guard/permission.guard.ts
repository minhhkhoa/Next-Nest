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

    // 1. Bypass cho các route Public (không cần login)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 1.1. Bypass cho các route Public Permission (chỉ cần login)
    const isPublicPermission = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublicPermission) return true;

    // 2. Lấy thông tin Request
    const method = request.method;
    const apiPath = request.route?.path; // Đây là path có chứa param dạng /users/:id

    // 3. Bypass tự động cho các route thuộc /api/auth
    if (apiPath?.startsWith('/api/auth')) return true;

    // 4. Bypass cho SUPER_ADMIN
    const roleAdmin = this.configService.get<string>('role_super_admin');
    if (user?.roleCodeName === roleAdmin) return true;

    // 5. Kiểm tra quyền
    const permissions = user?.permissions ?? [];

    // So khớp chính xác Method và ApiPath
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
