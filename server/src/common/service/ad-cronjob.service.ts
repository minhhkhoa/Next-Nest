import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdBookingRepository } from '../../modules/advertising/ad-booking/repository/ad-booking.repository';
import { AdPaymentRepository } from '../../modules/advertising/ad-payment/repository/ad-payment.repository';
import * as dayjs from 'dayjs';

@Injectable()
export class AdCronjobService {
  private readonly logger = new Logger(AdCronjobService.name);

  constructor(
    private readonly adBookingRepository: AdBookingRepository,
    private readonly adPaymentRepository: AdPaymentRepository,
  ) {}

  //- Dọn rác đơn chưa thanh toán quá 15 phút
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredPayments() {
    this.logger.debug('Running cronjob: handleExpiredPayments');
    try {
      const fifteenMinutesAgo = dayjs().subtract(15, 'minute').toDate();

      //- Tìm các booking PENDING_PAYMENT quá hạn
      const expiredBookings = await this.adBookingRepository.find({
        filter: {
          status: 'PENDING_PAYMENT',
          createdAt: { $lte: fifteenMinutesAgo },
        },
      });

      for (const booking of expiredBookings) {
        //- Cập nhật booking thành EXPIRED
        await this.adBookingRepository.updateOneRaw(
          { _id: booking._id },
          { status: 'EXPIRED' },
        );

        //- Cập nhật payment tương ứng thành EXPIRED
        if (booking.paymentId) {
          await this.adPaymentRepository.updateOneRaw(
            { _id: booking.paymentId },
            { status: 'EXPIRED' },
          );
        }
        this.logger.log(`Expired booking ${booking._id}`);
      }
    } catch (error) {
      this.logger.error(`Error in handleExpiredPayments: ${error.message}`);
    }
  }

  //- Kích hoạt quảng cáo hiển thị
  @Cron(CronExpression.EVERY_HOUR)
  async handleActivateAds() {
    this.logger.debug('Running cronjob: handleActivateAds');
    try {
      const today = dayjs().startOf('day').toDate();

      //- Tìm các booking SCHEDULED có startAt <= today
      const readyBookings = await this.adBookingRepository.find({
        filter: {
          status: 'SCHEDULED',
          startAt: { $lte: today },
        },
      });

      for (const booking of readyBookings) {
        await this.adBookingRepository.updateOneRaw(
          { _id: booking._id },
          { status: 'RUNNING' },
        );
        this.logger.log(`Activated booking ${booking._id}`);
      }
    } catch (error) {
      this.logger.error(`Error in handleActivateAds: ${error.message}`);
    }
  }

  //- 3. Kết thúc quảng cáo
  @Cron(CronExpression.EVERY_HOUR)
  async handleCompleteAds() {
    this.logger.debug('Running cronjob: handleCompleteAds');
    try {
      const today = dayjs().startOf('day').toDate();

      //- Tìm các booking RUNNING có endAt < today (Ví dụ endAt là ngày 10/05, thì hôm nay 11/05 sẽ < today)
      const completedBookings = await this.adBookingRepository.find({
        filter: {
          status: 'RUNNING',
          endAt: { $lt: today },
        },
      });

      for (const booking of completedBookings) {
        await this.adBookingRepository.updateOneRaw(
          { _id: booking._id },
          { status: 'COMPLETED' },
        );
        this.logger.log(`Completed booking ${booking._id}`);
      }
    } catch (error) {
      this.logger.error(`Error in handleCompleteAds: ${error.message}`);
    }
  }
}
