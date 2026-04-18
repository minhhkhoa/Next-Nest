import { Module } from '@nestjs/common';
import { BusinessModule } from 'src/common/decorator/customize';
import { AdSlotModule } from './ad-slot/ad-slot.module';
import { AdBookingModule } from './ad-booking/ad-booking.module';
import { AdPaymentModule } from './ad-payment/ad-payment.module';

@BusinessModule()
@Module({
  imports: [AdSlotModule, AdBookingModule, AdPaymentModule],
  exports: [AdSlotModule, AdBookingModule, AdPaymentModule],
})
export class AdvertisingModule {}
