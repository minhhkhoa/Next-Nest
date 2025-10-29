import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPasswordMail(to: string, link: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Đặt lại mật khẩu',
      template: './reset-password',
      context: { linkResetPassword: link },
    });
  }
}
