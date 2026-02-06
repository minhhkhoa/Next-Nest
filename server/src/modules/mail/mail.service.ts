import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendResetPasswordMail(to: string, link: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Đặt lại mật khẩu',
      template: 'reset-password',
      context: { linkResetPassword: link },
    });
  }

  //- Gửi mail xác nhận tiếp nhận yêu cầu Issue tới user
  async sendIssueConfirmationMail(
    userEmail: string,
    userName: string,
    title: string,
    issueId: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `[Support Ticket #${issueId}] Xác nhận tiếp nhận yêu cầu`,
        template: 'issue-received', // Tên file .hbs
        context: {
          name: userName,
          title: title,
          issueId: issueId.toString().slice(-6).toUpperCase(), // Lấy 6 ký tự cuối của ID cho đẹp
        },
      });
    } catch (error) {
      // Log lỗi nhưng không làm crash ứng dụng vì mail chỉ là notification phụ
      console.error('Lỗi gửi mail xác nhận Issue:', error);
    }
  }

  /**
   * Gửi email thông báo Admin đã trả lời Issue
   */
  async sendAdminRepliedMail(
    userEmail: string,
    userName: string,
    title: string,
    issueId: string,
    status: string,
  ) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const linkDetail = `${frontendUrl}/user/support/${issueId}`;

      await this.mailerService.sendMail({
        to: userEmail,
        subject: `[Cập nhật yêu cầu #${issueId.slice(-6).toUpperCase()}] Đã có phản hồi từ Admin`,
        template: 'admin-replied',
        context: {
          name: userName,
          title: title,
          status: status,
          linkDetail: linkDetail,
        },
      });
    } catch (error) {
      console.error('Lỗi gửi mail thông báo phản hồi Admin:', error);
    }
  }
}
