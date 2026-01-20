import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Req,
  Res,
  Body,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './passport-guard/local-auth.guard';
import { LoginDto, RegisterDto } from 'src/modules/user/dto/create-user.dto';
import {
  Public,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import { Response } from 'express';
import { UserResponse } from 'src/modules/user/schemas/user.schema';
import { FacebookAuthGuard } from './passport-guard/facebook.guard';
import { GoogleAuthGuard } from './passport-guard/google.guard';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../roles/roles.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private roleService: RolesService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Đăng nhập email/password' })
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(
    @Request() req: any, //- nó lấy từ req.user của middleware LocalAuthGuard
    @Res({ passthrough: true }) response: Response,
  ) {
    const idRoleUser = req.user.roleID.toString();
    const roleSchema = await this.roleService.findOne(idRoleUser);
    const roleCodeName = roleSchema.name.vi;
    //- truyền response sang để lưu cookie
    const user: UserResponse = {
      id: req.user._id.toString(),
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      roleID: req.user.roleID,
      roleCodeName: roleCodeName,
      employerInfo: req.user.employerInfo,
    };
    return this.authService.login(user, response);
  }

  @Public()
  @ApiOperation({ summary: 'Đăng ký tài khoản' })
  @ResponseMessage('Đăng ký người dùng thành công')
  @Post('register')
  async register(@Body() registerUserDto: RegisterDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @ApiOperation({ summary: 'Đăng ký tài khoản nhà tuyển dụng' })
  @ResponseMessage('Đăng ký nhà tuyển dụng thành công')
  @Post('recruiter-register')
  async recruiterRegister(@Body() registerUserDto: RegisterDto) {
    return this.authService.recruiterRegister(registerUserDto);
  }

  //- cần query xuống db chứ không phải lấy ở jwt vì khi update song mà vẫn lấy ở jwt thì data đã cũ
  @Get('profile')
  @ResponseMessage('Get User Profile')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân tài khoản đang đăng nhập' })
  async getProfile(@userDecorator() user: UserResponse) {
    try {
      const id = user.id;

      const userProfile = await this.authService.getProfile(id);

      return {
        user: userProfile,
      };
    } catch (error) {
      console.log('error getProfile: ', error);
    }
  }

  @Public() //- phải để public vì khi này access_token đâu còn hợp lệ
  @ResponseMessage('Get User by refresh token')
  @ApiOperation({ summary: 'refresh token' })
  @Get('refresh')
  async handleRefreshToken(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      //- refresh_token có thể bị hết hạn ==> logout
      const refreshToken = request.cookies['refresh_token'];

      const getNewToken = await this.authService.getNewToken(
        refreshToken,
        response,
      );

      return getNewToken;
    } catch (error) {
      throw new BadRequestCustom(
        'Refresh_token đã hết hạn!',
        !!error.message,
        423,
      );
    }
  }

  @Public() //- phải để public vì khi này access_token đâu còn hợp lệ
  @ResponseMessage('Success')
  @ApiOperation({ summary: 'Xóa access_token trong cookie' })
  @Get('removeAccessToken')
  async handleRemoveAccessTokenInCookie(
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      response.clearCookie('access_token');
    } catch (error) {
      throw new BadRequestCustom('Lỗi xóa access_token', !!error.message, 423);
    }
  }

  @Post('logout')
  @ResponseMessage('Logout User thành công')
  @ApiOperation({ summary: 'Đăng xuất tài khoản' })
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @userDecorator() user: UserResponse,
  ) {
    return this.authService.logout(response, user);
  }

  @Public()
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookLogin(): Promise<any> {
    //- redirect đến facebook để login cái này fb tự xử lý
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookLoginCallback(@Req() req, @Res() response: Response) {
    try {
      const idRoleUser = req.user.roleID.toString();
      const roleSchema = await this.roleService.findOne(idRoleUser);
      const roleCodeName = roleSchema.name.vi;

      //- không cho recruiter đăng ký tài khoản bằng provider là được, ép nó dùng email/password
      const user: UserResponse = {
        id: req.user.providerId,
        email: req.user.email || '',
        name: req.user.firstName + ' ' + req.user.lastName,
        avatar: req.user.avatar,
        roleID: req.user.roleID,
        roleCodeName: roleCodeName,
        employerInfo: undefined,
      };

      const loginUser = await this.authService.loginWithSocial(
        user,
        response,
        'facebook',
      );
      const access_token = loginUser.access_token;
      const clientUrl = this.configService.get<string>(
        'FRONTEND_URL',
      ) as string;

      const html = `
      <html>
        <body>
          <script>
            window.opener.postMessage(
              { token: "${access_token}" },
              "${clientUrl}"
            );
            window.close();
          </script>
        </body>
      </html>
    `;

      response.setHeader('Content-Type', 'text/html');
      return response.send(html);
    } catch (error) {
      const message = error.message;
      const html = `
                <html>
                  <body>
                    <script>
                      window.opener.postMessage(
                        { 
                          error: "${message}",
                          status: "FORBIDDEN" 
                        },
                        "${this.configService.get('FRONTEND_URL')}"
                      );
                      window.close();
                    </script>
                  </body>
                </html>
              `;
      response.status(200).send(html);
    }
  }

  //- login google
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    //- redirect đến google để login cái này gg tự xử lý
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req, @Res() res: Response) {
    try {
      const idRoleUser = req.user.roleID.toString();
      const roleSchema = await this.roleService.findOne(idRoleUser);
      const roleCodeName = roleSchema.name.vi;

      //- không cho recruiter đăng ký tài khoản bằng provider là được, ép nó dùng email/password
      const user: UserResponse = {
        id: req.user.providerId,
        email: req.user.email || '',
        name: req.user.name,
        avatar: req.user.avatar,
        roleID: req.user.roleID,
        roleCodeName: roleCodeName,
        employerInfo: undefined,
      };

      //- để cho đỡ rối, lần này sẽ xử lý hết ở đây
      const loginGoogle = await this.authService.loginWithSocial(
        user,
        res,
        'google',
      );
      const access_token = loginGoogle.access_token;

      const html = `
      <html>
        <body>
          <script>
            window.opener.postMessage(
              { token: "${access_token}" },
              "http://localhost:3000"
            );
            window.close();
          </script>
        </body>
      </html>
    `;

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (error) {
      const message = error.message;
      const html = `
                <html>
                  <body>
                    <script>
                      window.opener.postMessage(
                        { 
                          error: "${message}",
                          status: "FORBIDDEN" 
                        },
                        "${this.configService.get('FRONTEND_URL')}"
                      );
                      window.close();
                    </script>
                  </body>
                </html>
              `;
      res.status(200).send(html);
    }
  }

  //- start handle forgot/reset password
  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Quên mật khẩu' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.sendResetEmail(body.email);
  }

  @Public()
  @Get('validate-reset')
  @ApiOperation({ summary: 'Validate token and email to reset password' })
  async validateReset(
    @Query('token') token: string,
    @Query('email') email: string,
  ) {
    return this.authService.validateResetToken(email, token);
  }

  @Public()
  @ResponseMessage('Đặt lại mật khẩu thành công')
  @ApiOperation({ summary: 'Đặt lại mật khẩu' })
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
  //- end handle forgot/reset password

  //- change password
  @ApiOperation({ summary: 'Thay đổi mật khẩu' })
  @ResponseMessage('Thay đổi mật khẩu thành công')
  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto) {
    return this.authService.changePassword(body);
  }
}
