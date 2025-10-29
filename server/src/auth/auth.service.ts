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
import { MailService } from 'src/mail/mail.service';
import { RegisterDto } from 'src/user/dto/create-user.dto';
import { UserResponse } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import {
  comparePassword,
  generateResetToken,
  hashPassword,
} from 'src/utils/hashPassword';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UserService,
    private mailService: MailService,
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

      //- create refresh_token/access_token
      const accessToken = this.jwtService.sign(payload);
      const resfreshToken = this.createRefreshToken(payload);

      //- set refresh_token to user in db
      await this.usersService.updateRefreshToken(id, resfreshToken);

      //- set refresh_token/access_token to cookie of client(browser)
      response.clearCookie('access_token');
      response.cookie('access_token', accessToken, {
        httpOnly: true,
        //- maxAge là thoi gian hieu luc cua cookie tính theo ms
        maxAge: ms(
          this.configService.get<string>('JWT_ACCESS_EXPIRE') as ms.StringValue,
        ),
      });

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

  async loginWithSocial(
    user: UserResponse,
    response: Response,
    provider: string,
  ) {
    try {
      const { avatar, email, id: idProvider, name, companyID, roleID } = user;

      //- B1: check xem có tài khoản chưa
      const userLoginSocial =
        await this.usersService.findUserByProviderIDSocial(idProvider);

      if (!userLoginSocial) {
        //- B2: tạo người dùng
        await this.usersService.createUserWithProviderSocial(user, provider);

        //- B3: tạo refresh_token
        const payload = {
          email,
          idProvider,
          name,
          roleID,
          companyID,
          avatar,
        };

        const resfreshToken = this.createRefreshToken(payload);

        //- tim user vua tao de luu refresh_token vao db
        const userNew =
          await this.usersService.findUserByProviderIDSocial(idProvider);

        const idDocumentUserLogin = userNew?._id.toString();

        if (!idDocumentUserLogin)
          throw new BadRequestCustom('User khong ton tai', true);
        //- set refresh_token to user in db
        await this.usersService.updateRefreshToken(
          idDocumentUserLogin,
          resfreshToken,
        );

        //- set refresh_token/access_token to cookie of client(browser)
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

        const payloadNew = {
          ...payload,
          id: idDocumentUserLogin,
        };

        const accessToken = this.jwtService.sign(payloadNew);
        response.clearCookie('access_token');
        response.cookie('access_token', accessToken, {
          httpOnly: true,
          //- maxAge là thoi gian hieu luc cua cookie tính theo ms
          maxAge: ms(
            this.configService.get<string>(
              'JWT_ACCESS_EXPIRE',
            ) as ms.StringValue,
          ),
        });

        return {
          access_token: this.jwtService.sign(payloadNew),
          user: {
            id: idDocumentUserLogin,
            avatar,
            email,
            name,
            companyID,
            roleID,
          },
        };
      } else {
        //- nếu đã có tài khoản ==> refresh_token
        const payload = {
          email,
          idProvider,
          name,
          roleID,
          companyID,
          avatar,
        };

        const resfreshToken = this.createRefreshToken(payload);
        const idDocumentUserLogin = userLoginSocial?._id.toString();

        //- luu refresh_token vao db
        await this.usersService.updateRefreshToken(
          idDocumentUserLogin,
          resfreshToken,
        );

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

        const payloadNew = {
          ...payload,
          id: idDocumentUserLogin,
        };

        const accessToken = this.jwtService.sign(payloadNew);
        response.clearCookie('access_token');
        response.cookie('access_token', accessToken, {
          httpOnly: true,
          //- maxAge là thoi gian hieu luc cua cookie tính theo ms
          maxAge: ms(
            this.configService.get<string>(
              'JWT_ACCESS_EXPIRE',
            ) as ms.StringValue,
          ),
        });

        return {
          access_token: this.jwtService.sign(payloadNew),
          user: {
            id: idDocumentUserLogin,
            avatar,
            email,
            name,
            companyID,
            roleID,
          },
        };
      }
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
      response.clearCookie('access_token');

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
      const providerId = decode.idProvider ?? undefined;
      const userProvider =
        providerId &&
        (await this.usersService.findUserByProviderIDSocial(providerId));
      const idUserProvider = providerId && userProvider?._id.toString();
      const userId = decode.id ? decode.id : idUserProvider;

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

  //- getProfile
  async getProfile(id: string) {
    try {
      if (!id) throw new BadRequestCustom('Không truyền ID', !!id);

      const user = await this.usersService.findOne(id);
      return user;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //-start forgot/reset password
  async sendResetEmail(email: string) {
    try {
      if (!email) throw new BadRequestCustom('Không truyền email', !!email);

      const user = await this.usersService.findUserByEmail(email);
      if (!user) throw new BadRequestCustom('Email khong ton tai', !!email);

      //- tạo token để xác nhân người dùng nào đang yêu cầu tạo lại mật khẩu
      const { tokenPlain, tokenHash, expiresAt } = await generateResetToken();

      //- lưu vào db
      const update = {
        $set: {
          resetToken: tokenHash,
          resetTokenExpiresAt: expiresAt,
        },
      };

      await this.usersService.updateUserResetToken(user.id, update);

      //- tạo link
      const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${tokenPlain}&email=${user.email}`;

      await this.mailService.sendResetPasswordMail(user.email, resetLink);

      return { message: 'Chúng tôi đã gửi đường dẫn tạo lại mật khẩu tới Email của bạn, hãy làm theo hướng dẫn tại Email để đặt lại mật khẩu' };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
  //-end forgot/reset password
}
