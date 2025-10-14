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

  @Post('logout')
  @ResponseMessage('Logout User thành công')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @userDecorator() user: UserResponse,
  ) {
    return this.authService.logout(response, user);
  }
}
