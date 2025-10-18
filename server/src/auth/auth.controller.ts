import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto, RegisterDto } from 'src/user/dto/create-user.dto';
import {
  Public,
  ResponseMessage,
  userDecorator,
} from 'src/decorator/customize';
import { Response } from 'express';
import { UserResponse } from 'src/user/schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(
    @Request() req: any, //- nó lấy từ req.user của middleware LocalAuthGuard
    @Res({ passthrough: true }) response: Response,
  ) {
    //- truyền response sang để lưu cookie
    const user: UserResponse = {
      id: req.user._id.toString(),
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      companyID: req.user.companyID,
      roleID: req.user.roleID,
    };
    return this.authService.login(user, response);
  }

  @Public()
  @ResponseMessage('Đăng ký người dùng thành công')
  @Post('register')
  async register(@Body() registerUserDto: RegisterDto) {
    return this.authService.register(registerUserDto);
  }

  @Get('profile')
  async getProfile(@userDecorator() user: UserResponse) {
    return { user };
  }

  @Public() //- phải để public vì khi này access_token đâu còn hợp lệ
  @ResponseMessage('Get User by refresh token')
  @Get('refresh')
  async handleRefreshToken(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];

    return await this.authService.getNewToken(refreshToken, response);
  }

  @Post('logout')
  @ResponseMessage('Logout User thành công')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @userDecorator() user: UserResponse,
  ) {
    return this.authService.logout(response, user);
  }

  @Public()
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    //- redirect đến facebook để login cái này fb tự xử lý
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(
    @Req() req,
    @Res() response: Response,
  ) {
    const user: UserResponse = {
      id: req.user.providerId,
      email: req.user.email || '',
      name: req.user.firstName + ' ' + req.user.lastName,
      avatar: req.user.avatar,
      companyID: req.user.companyID || [],
      roleID: req.user.roleID || [],
    };

    //- logic tương tự như jwt vẫn cần sinh access_Token + refresh_token để dùng cho app của mình
    const loginUser = await this.authService.loginFB(user, response);
    const access_token = loginUser.access_token;

    return response.redirect(
      `http://localhost:3000?access_token=${access_token}`,
    );
  }
}
