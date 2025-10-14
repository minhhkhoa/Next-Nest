import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as ms from 'ms';
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
    const { avatar, email, name, companyID, roleID, _id } = user;
    const payload = { email, id: _id, name, roleID, companyID, avatar };

    //- create refresh_token
    const resfreshToken = this.createRefreshToken(payload);

    //- set refresh_token to user in db
    await this.usersService.updateRefreshToken(_id, resfreshToken);

    //- set refresh_token to cookie of client(browser)
    response.clearCookie('refresh_token');
    response.cookie('refresh_token', resfreshToken, {
      httpOnly: true,
      //- maxAge là thoi gian hieu luc cua cookie tính theo ms
      maxAge: ms(
        this.configService.get<string>('JWT_REFRESH_EXPIRE') as ms.StringValue,
      ),
    });

    //- return access_token to client and some info of user
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        avatar,
        email,
        name,
        companyID,
        roleID,
      },
    };
  }

  //- function create refresh_token
  createRefreshToken = (payload: any) => {
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
  };

  //- func register
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    const user = await this.usersService.findUserByEmail(email);
    if (user)
      throw new Error('Email đã tồn tại, vui lòng đăng ký bằng email khác');

    const hashedPassword = await hashPassword(password);

    const newUser = {
      ...registerDto,
      password: hashedPassword,
    };
    
    const resultUser = await this.usersService.register(newUser);

    if (!resultUser) throw new Error('Tạo người dùng thất bại');

    return resultUser;
  }
}
