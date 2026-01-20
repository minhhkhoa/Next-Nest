import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserResponse } from 'src/modules/user/schemas/user.schema';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UserService,
  ) {
    //- decode access_token
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_ACCESS_TOKEN_SECRET',
      ) as string,
    });
  }

  //- payload là tham số nó tự truyền vào sau khi giải mã song hàm super bên trên, và nó tự động chạy hàm validate này
  async validate(payload: UserResponse) {
    // Lấy data "tươi" từ DB mỗi khi request tới, nếu admin thu hồi quyền thì ng dùng đó sẽ bị chặn đứng ở request tiếp theo không cần phải login lại mới có hiệu lực.
    //- nhưng mà mỗi lần reload trang đều query khá tốn nếu traffic dầy.
    const user = await this.usersService.findOneWithRole(payload.id);

    if (!user) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại hoặc đã bị khóa',
      );
    }

    const permissions = (user.roleID as any)?.permissions ?? [];

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      roleID: payload.roleID,
      roleCodeName: payload.roleCodeName,
      permissions: permissions, // Mảng permissions chi tiết
      avatar: payload.avatar,
      employerInfo: user.employerInfo,
    }; //- no gan vao req.user
  }
}

/**
 * Luồng chạy
 * 1. Request tới server vì main đặt JwtAuthGuard global nên nó chạy vào JwtAuthGuard trước.
 * 2. Nó sẽ chạy hàm canActive check xem route nào được đánh dấu @public() thì nó cho qua (tức là route đó không cần tới token xác minh). Nhưng nếu không public thì nó chạy tới super.canActivate(context) và thực hiện decode access_token bên trên file này.
 * 3. Sau khi decode song nó tự động chạy hàm validate luôn với tham số payload đầu vào là dữ liệu mà nó đã giải mã ban nãy. Rồi tự dán vào req.user. Tới đây thì Strategy đã xong.
 * 4. Sau khi Strategy chạy xong, kết quả (user hoặc error) được đẩy về hàm handleRequest trong file JwtAuthGuard. Nếu user tồn tại, nó gán user vào request.user.
 *
 */

/*
  - JwtStrategy chịu trách nhiệm xác thực & gắn thông tin user vào req.user.
  - JwtAuthGuard chịu trách nhiệm chặn request khi user không có quyền hoặc chưa login.
*/

/**
 * Khi dùng FB/GG login, Khoa sẽ có FacebookStrategy hoặc GoogleStrategy. Luồng chạy cũng tương tự: Guard tương ứng của chúng sẽ gọi hàm validate trong Strategy đó. Sau khi xác thực xong với FB/GG, Khoa sẽ tự tạo một JWT và gửi về cho Client. Từ đó trở đi, mọi request tiếp theo sẽ lại đi qua JwtAuthGuard như thường.
 */
