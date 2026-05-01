import { Module } from '@nestjs/common';
import { BusinessModule } from 'src/common/decorator/customize';
import { AdSlotModule } from './ad-slot/ad-slot.module';
import { AdBookingModule } from './ad-booking/ad-booking.module';
import { AdPaymentModule } from './ad-payment/ad-payment.module';

import { AdCronjobService } from 'src/common/service/ad-cronjob.service';

import { NotificationsModule } from '../notifications/notifications.module';

@BusinessModule()
@Module({
  imports: [AdSlotModule, AdBookingModule, AdPaymentModule, NotificationsModule],
  providers: [AdCronjobService],
  exports: [AdSlotModule, AdBookingModule, AdPaymentModule, AdCronjobService],
})
export class AdvertisingModule {}
