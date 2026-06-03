import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  constructor(private configService: ConfigService) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const origin = request.query.origin;
    if (origin) {
      return {
        state: origin,
      };
    }
    return {};
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const res: Response = context.switchToHttp().getResponse<Response>();
    const req: Request = context.switchToHttp().getRequest<Request>();

    //- trường hợp user ấn "Cancel" trên modal Facebook
    if (req.query?.error_reason === 'user_denied') {
      const state = req.query.state as string;
      const clientUrl = this.configService.get<string>('FRONTEND_URL') || '';
      let clientOrigin = state || clientUrl;
      try {
        clientOrigin = new URL(clientOrigin).origin;
      } catch (e) {
        //- lấy clientUrl làm fallback
      }

      //- bắn mã lỗi về client
      const html = `
        <html>
          <body>
            <script>
              window.opener.postMessage(
                { error: "Bạn đã huỷ đăng nhập Facebook." },
                "${clientOrigin}"
              );
              window.close();
            </script>
          </body>
        </html>
      `;
      res.status(200).send(html);
      return null;
    }

    return user;
  }
}
