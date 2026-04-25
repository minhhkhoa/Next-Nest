import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdBookingRepository } from '../ad-booking/repository/ad-booking.repository';
import { CreateAdPaymentDto } from './dto/create-ad-payment.dto';
import { SePayWebhookDto } from './dto/sepay-webhook.dto';
import { UpdateAdPaymentDto } from './dto/update-ad-payment.dto';
import { AdPaymentRepository } from './repository/ad-payment.repository';

@Injectable()
export class AdPaymentService {
  private readonly logger = new Logger(AdPaymentService.name);

  constructor(
    private readonly adPaymentRepository: AdPaymentRepository,
    private readonly adBookingRepository: AdBookingRepository,
    private readonly configService: ConfigService,
  ) {}

  async handleSePayWebhook(payload: SePayWebhookDto, authHeader: string) {
    this.logger.log(`Received SePay webhook: ${JSON.stringify(payload)}`);

    //- Xác thực API Key
    const masterApiKey = this.configService.get<string>('SEPAY_API_KEY');

    //- SePay có thể gửi header: "Authorization": "Apikey spsk_..."
    let apiKey = authHeader;
    if (authHeader && authHeader.startsWith('Apikey ')) {
      apiKey = authHeader.replace('Apikey ', '');
    }

    if (apiKey !== masterApiKey) {
      this.logger.error(`Invalid SePay API Key. Received: ${apiKey}`);
      throw new UnauthorizedException('Invalid API Key');
    }

    //- Tìm AdPayment theo nội dung chuyển khoản (transferContent)
    //- SePay gửi nội dung chuyển khoản trong trường 'content'
    const payment = await this.adPaymentRepository.findOne({
      filter: { transferContent: payload.content, status: 'PENDING' },
    });

    if (!payment) {
      this.logger.warn(
        `No pending payment found for content: ${payload.content}`,
      );
      return { status: 'error', message: 'Payment not found' };
    }

    //- Kiểm tra số tiền (tùy chọn nhưng nên có)
    // if (payload.transferAmount < payment.amount) {
    //   this.logger.warn(`Amount mismatch: expected ${payment.amount}, got ${payload.transferAmount}`);
    //   // Có thể cập nhật trạng thái là FAILED hoặc để PENDING chờ xử lý thủ công
    // }

    //- Cập nhật trạng thái Payment thành PAID
    await this.adPaymentRepository.updateOneRaw(
      { _id: payment._id },
      {
        status: 'PAID',
        paidAt: new Date(payload.transactionDate),
        webhookPayload: payload,
      },
    );

    //- Cập nhật trạng thái Booking tương ứng
    await this.adBookingRepository.updateOneRaw(
      { _id: payment.bookingId },
      { status: 'WAITING_SLOT' },
    );

    this.logger.log(
      `Payment ${payment.orderCode} processed successfully for Booking ${payment.bookingId}`,
    );

    return { status: 'success', message: 'Payment processed' };
  }

  create(createAdPaymentDto: CreateAdPaymentDto) {
    return this.adPaymentRepository.create(createAdPaymentDto);
  }

  findAll() {
    return this.adPaymentRepository.find();
  }

  findOne(id: string) {
    return this.adPaymentRepository.findById(id);
  }

  update(id: string, updateAdPaymentDto: UpdateAdPaymentDto) {
    return this.adPaymentRepository.updateOneRaw(
      { _id: id },
      updateAdPaymentDto,
    );
  }

  remove(id: string) {
    return this.adPaymentRepository.softDeleteById(id);
  }
}
