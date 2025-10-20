import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const res: Response = context.switchToHttp().getResponse<Response>();
    const req: Request = context.switchToHttp().getRequest<Request>();

    //- trường hợp user ấn "Cancel" trên modal Facebook
    if (req.query?.error_reason === 'user_denied') {
      const html = `
        <html>
          <body>
            <script>
              window.opener.postMessage(
                { error: "Bạn đã huỷ đăng nhập Facebook." },
                "http://localhost:3000"
              );
              window.close();
            </script>
          </body>
        </html>
      `;
      res.status(200).send(html);
      return null;
    }

    //- trường hợp thất bại khác
    if (err || !user) {
      const msg = (
        err?.message ||
        info?.message ||
        'Đăng nhập Facebook thất bại'
      ).replace(/"/g, '\\"');

      //- trả về HTML nhỏ cho popup
      const html = `
        <html>
          <body>
            <script>
              window.opener.postMessage(
                { error: "${msg}" },
                "http://localhost:3000"
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
