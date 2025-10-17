import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as ms from 'ms';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import { RegisterDto } from 'src/user/dto/create-user.dto';
import { UserResponse } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { comparePassword, hashPassword } from 'src/utils/hashPassword';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) return null;

    const isDeleted = user.isDeleted;

    if (isDeleted) return null;

    //- tới được đây thì check pasword
    const { password } = user;
    const isMatch = await comparePassword(pass, password);

    //- sai pass
    if (!isMatch) return null;

    const { password: _, refresh_token, ...result } = user.toObject();
    return result;
  }

  async login(user: UserResponse, response: Response) {
    try {
      const { avatar, email, name, companyID, roleID, id } = user;
      const payload = { email, id, name, roleID, companyID, avatar };

      //- create refresh_token
      const resfreshToken = this.createRefreshToken(payload);

      //- set refresh_token to user in db
      await this.usersService.updateRefreshToken(id, resfreshToken);

      //- set refresh_token to cookie of client(browser)
      response.clearCookie('refresh_token');
      response.cookie('refresh_token', resfreshToken, {
        httpOnly: true,
        //- maxAge là thoi gian hieu luc cua cookie tính theo ms
        maxAge: ms(
          this.configService.get<string>(
            'JWT_REFRESH_EXPIRE',
          ) as ms.StringValue,
        ),
      });

      //- return access_token to client and some info of user
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id,
          avatar,
          email,
          name,
          companyID,
          roleID,
        },
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- function create refresh_token
  createRefreshToken = (payload: any) => {
    try {
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn:
          ms(
            this.configService.get<string>(
              'JWT_REFRESH_EXPIRE',
            ) as ms.StringValue,
          ) / 1000, //- ms: mili-seconds còn jwt là second (1 second = 1000 mili-seconds)
      });

      return refreshToken;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  };

  //- func register
  async register(registerDto: RegisterDto) {
    try {
      const { email, password } = registerDto;
      const user = await this.usersService.findUserByEmail(email);
      if (user)
        throw new BadRequestCustom(
          'Email đã tồn tại, vui lòng đăng ký bằng email khác',
        );

      const hashedPassword = await hashPassword(password);

      const newUser = {
        ...registerDto,
        password: hashedPassword,
      };

      const resultUser = await this.usersService.register(newUser);

      if (!resultUser) throw new BadRequestCustom('Tạo người dùng thất bại');

      return {
        _id: resultUser.id,
        createdAt: resultUser.createdAt,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- func logout
  async logout(response: Response, user: UserResponse) {
    try {
      //- set refresh_token is "" to user in db
      const result = await this.usersService.updateRefreshToken(user.id, '');
      response.clearCookie('refresh_token');

      if (result.matchedCount == 1) return 'Logout thanh cong';
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- func refresh token
  async getNewToken(refreshToken: string, response: Response) {
    try {
      //1. giải mã
      const decode = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      //2.Lấy user id
      const userId = decode.id;

      if (!userId) {
        throw new BadRequestException('Token payload thiếu userId');
      }

      // 3. Query user theo userId
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new BadRequestException('User không tồn tại');
      }
      if (user.refresh_token !== refreshToken) {
        throw new BadRequestException('Refresh token không khớp');
      }

      //-update refresh_token
      const { email, name, avatar, companyID, roleID, id } = user;

      const payload = {
        id,
        avatar,
        name,
        email,
        roleID,
        companyID,
      };

      const result = await this.login(payload, response);

      return result;
    } catch (error) {
      throw new UnauthorizedException('Refresh_token khong hop le!');
    }
  }

  async validateOAuthLogin(userData: any) {
    // TODO: kiểm tra user trong DB (bằng email hoặc providerId)
    // nếu chưa có thì tạo mới user
    // return user object
    console.log('userData: ', userData);
    return userData;
  }
}
